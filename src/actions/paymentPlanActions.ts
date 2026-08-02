"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { requireAuth, requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Create payment plan for a booking
export async function createPaymentPlan(data: {
  bookingId: string;
  totalAmount: number;
  depositAmount: number;
  installments: Array<{
    amount: number;
    dueDate: Date;
  }>;
  currency?: string;
}) {
  noStore();
  try {
    await requireAuth();

    const remainingAmount = data.totalAmount - data.depositAmount;

    const paymentPlan = await prisma.paymentPlan.create({
      data: {
        bookingId: data.bookingId,
        totalAmount: data.totalAmount,
        depositAmount: data.depositAmount,
        remainingAmount,
        installments: data.installments.map((installment, index) => ({
          ...installment,
          paid: false,
          paidAt: null,
          installmentNumber: index + 1,
        })),
        currency: data.currency || "USD",
        status: "Active",
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      paymentPlan,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to create payment plan:", error);
    return { success: false, error: "Failed to create payment plan" };
  }
}

// Get payment plan for a booking
export async function getPaymentPlan(bookingId: string) {
  noStore();
  try {
    await requireAuth();

    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { bookingId },
    });

    return paymentPlan;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get payment plan:", error);
    return null;
  }
}

// Mark deposit as paid
export async function markDepositPaid(bookingId: string) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const paymentPlan = await prisma.paymentPlan.update({
      where: { bookingId },
      data: {
        depositPaid: true,
        depositPaidAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      paymentPlan,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark deposit as paid:", error);
    return { success: false, error: "Failed to mark deposit as paid" };
  }
}

// Mark installment as paid
export async function markInstallmentPaid(
  bookingId: string,
  installmentNumber: number
) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const paymentPlan = await prisma.paymentPlan.findUnique({
      where: { bookingId },
    });

    if (!paymentPlan) {
      return { success: false, error: "Payment plan not found" };
    }

    const installments = paymentPlan.installments as any[];
    const installmentIndex = installments.findIndex(
      (i) => i.installmentNumber === installmentNumber
    );

    if (installmentIndex === -1) {
      return { success: false, error: "Installment not found" };
    }

    installments[installmentIndex].paid = true;
    installments[installmentIndex].paidAt = new Date();

    // Check if all installments are paid
    const allPaid = installments.every((i) => i.paid);

    const updatedPaymentPlan = await prisma.paymentPlan.update({
      where: { bookingId },
      data: {
        installments,
        status: allPaid ? "Completed" : "Active",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      paymentPlan: updatedPaymentPlan,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to mark installment as paid:", error);
    return { success: false, error: "Failed to mark installment as paid" };
  }
}

// Cancel payment plan
export async function cancelPaymentPlan(bookingId: string) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const paymentPlan = await prisma.paymentPlan.update({
      where: { bookingId },
      data: {
        status: "Cancelled",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/admin/bookings");
    revalidatePath("/dashboard/tourist/bookings");

    return {
      success: true,
      paymentPlan,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to cancel payment plan:", error);
    return { success: false, error: "Failed to cancel payment plan" };
  }
}

// Get upcoming payment reminders
export async function getUpcomingPaymentReminders() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const paymentPlans = await prisma.paymentPlan.findMany({
      where: {
        status: "Active",
      },
    });

    const upcomingPayments = [];

    for (const plan of paymentPlans) {
      const installments = plan.installments as any[];
      for (const installment of installments) {
        if (
          !installment.paid &&
          new Date(installment.dueDate) <= sevenDaysFromNow
        ) {
          upcomingPayments.push({
            bookingId: plan.bookingId,
            installmentNumber: installment.installmentNumber,
            amount: installment.amount,
            dueDate: installment.dueDate,
            daysUntilDue: Math.ceil(
              (new Date(installment.dueDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            ),
          });
        }
      }
    }

    return upcomingPayments;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get upcoming payment reminders:", error);
    return [];
  }
}

// Get payment plan statistics
export async function getPaymentPlanStats() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [totalPlans, activePlans, completedPlans, cancelledPlans] =
      await Promise.all([
        prisma.paymentPlan.count(),
        prisma.paymentPlan.count({ where: { status: "Active" } }),
        prisma.paymentPlan.count({ where: { status: "Completed" } }),
        prisma.paymentPlan.count({ where: { status: "Cancelled" } }),
      ]);

    const allPlans = await prisma.paymentPlan.findMany({
      where: { status: "Active" },
    });

    let totalDepositsPaid = 0;
    let totalRemaining = 0;

    for (const plan of allPlans) {
      if (plan.depositPaid) {
        totalDepositsPaid += plan.depositAmount;
      }
      totalRemaining += plan.remainingAmount;
    }

    return {
      totalPlans,
      activePlans,
      completedPlans,
      cancelledPlans,
      totalDepositsPaid,
      totalRemaining,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to get payment plan stats:", error);
    return {
      totalPlans: 0,
      activePlans: 0,
      completedPlans: 0,
      cancelledPlans: 0,
      totalDepositsPaid: 0,
      totalRemaining: 0,
    };
  }
}
