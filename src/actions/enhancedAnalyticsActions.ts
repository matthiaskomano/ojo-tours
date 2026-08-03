"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { requireMinimumRole, AuthorizationError } from "@/lib/authorization";

// Enhanced revenue analytics with trends
export async function getEnhancedRevenueStats(params: {
  period?: "7d" | "30d" | "90d" | "1y";
}) {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const period = params.period || "30d";
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await prisma.booking.findMany({
      where: {
        status: "Confirmed",
        createdAt: { gte: startDate },
      },
      select: {
        totalPrice: true,
        createdAt: true,
        paymentType: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate daily revenue
    const dailyRevenue: Record<string, number> = {};
    const dailyBookings: Record<string, number> = {};

    bookings.forEach((booking) => {
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (booking.totalPrice || 0);
      dailyBookings[dateKey] = (dailyBookings[dateKey] || 0) + 1;
    });

    // Fill in missing dates
    const revenueTrend = [];
    const bookingTrend = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      revenueTrend.push({
        date: dateKey,
        revenue: dailyRevenue[dateKey] || 0,
      });
      bookingTrend.push({
        date: dateKey,
        bookings: dailyBookings[dateKey] || 0,
      });
    }

    // Calculate growth rates
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const avgDailyRevenue = totalRevenue / days;
    
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    const previousBookings = await prisma.booking.findMany({
      where: {
        status: "Confirmed",
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
      select: { totalPrice: true },
    });

    const previousRevenue = previousBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Payment type breakdown
    const paymentBreakdown = bookings.reduce((acc, booking) => {
      const type = booking.paymentType || "Unknown";
      acc[type] = (acc[type] || 0) + (booking.totalPrice || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      avgDailyRevenue,
      growthRate,
      revenueTrend,
      bookingTrend,
      paymentBreakdown,
      totalBookings: bookings.length,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch enhanced revenue stats:", error);
    return {
      totalRevenue: 0,
      avgDailyRevenue: 0,
      growthRate: 0,
      revenueTrend: [],
      bookingTrend: [],
      paymentBreakdown: {},
      totalBookings: 0,
    };
  }
}

// Customer analytics and segmentation
export async function getCustomerAnalytics() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [totalUsers, usersWithBookings, topCustomers, customerMetrics] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          isActive: true,
          bookings: { some: { status: "Confirmed" } },
        },
      }),
      prisma.user.findMany({
        where: { isActive: true },
        include: {
          bookings: {
            where: { status: "Confirmed" },
            select: { totalPrice: true },
          },
        },
        orderBy: { bookings: { _count: "desc" } },
        take: 10,
      }),
      prisma.booking.groupBy({
        by: ["userId"],
        where: { status: "Confirmed" },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
    ]);

    // Calculate customer lifetime value
    const avgCustomerValue = customerMetrics.length > 0
      ? customerMetrics.reduce((sum, m) => sum + (m._sum.totalPrice || 0), 0) / customerMetrics.length
      : 0;

    // Customer segmentation
    const segments = {
      new: 0, // 0-1 bookings
      occasional: 0, // 2-5 bookings
      regular: 0, // 6-10 bookings
      loyal: 0, // 10+ bookings
    };

    customerMetrics.forEach((metric) => {
      const count = metric._count.id;
      if (count === 1) segments.new++;
      else if (count <= 5) segments.occasional++;
      else if (count <= 10) segments.regular++;
      else segments.loyal++;
    });

    return {
      totalUsers,
      usersWithBookings,
      conversionRate: totalUsers > 0 ? (usersWithBookings / totalUsers) * 100 : 0,
      avgCustomerValue,
      topCustomers: topCustomers.map((user) => ({
        id: user.id,
        name: user.fullName || user.email,
        email: user.email,
        totalBookings: user.bookings.length,
        totalSpent: user.bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      })),
      segments,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch customer analytics:", error);
    return {
      totalUsers: 0,
      usersWithBookings: 0,
      conversionRate: 0,
      avgCustomerValue: 0,
      topCustomers: [],
      segments: { new: 0, occasional: 0, regular: 0, loyal: 0 },
    };
  }
}

// Tour/lodge performance analytics
export async function getContentPerformanceAnalytics() {
  noStore();
  try {
    await requireMinimumRole("STAFF");

    const [tourPerformance, lodgePerformance, popularCategories] = await Promise.all([
      prisma.booking.groupBy({
        by: ["itemId"],
        where: { itemType: "Tour", status: "Confirmed" },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
      prisma.booking.groupBy({
        by: ["itemId"],
        where: { itemType: "Lodge", status: "Confirmed" },
        _count: { id: true },
        _sum: { totalPrice: true },
      }),
      prisma.tour.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
    ]);

    // Get tour details
    const tourIds = tourPerformance.map((t) => t.itemId);
    const tours = await prisma.tour.findMany({
      where: { id: { in: tourIds } },
      select: { id: true, title: true, category: true, price: true },
    });

    const tourMap = new Map(tours.map((t) => [t.id, t]));

    const topTours = tourPerformance
      .map((t) => ({
        ...t,
        tour: tourMap.get(t.itemId),
      }))
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10);

    // Get lodge details
    const lodgeIds = lodgePerformance.map((l) => l.itemId);
    const lodges = await prisma.lodge.findMany({
      where: { id: { in: lodgeIds } },
      select: { id: true, name: true, location: true, price: true },
    });

    const lodgeMap = new Map(lodges.map((l) => [l.id, l]));

    const topLodges = lodgePerformance
      .map((l) => ({
        ...l,
        lodge: lodgeMap.get(l.itemId),
      }))
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10);

    return {
      topTours: topTours.map((t) => ({
        id: t.tour?.id,
        title: t.tour?.title,
        category: t.tour?.category,
        bookings: t._count.id,
        revenue: t._sum.totalPrice || 0,
      })),
      topLodges: topLodges.map((l) => ({
        id: l.lodge?.id,
        name: l.lodge?.name,
        location: l.lodge?.location,
        bookings: l._count.id,
        revenue: l._sum.totalPrice || 0,
      })),
      popularCategories: popularCategories
        .sort((a, b) => b._count.id - a._count.id)
        .slice(0, 10),
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch content performance analytics:", error);
    return {
      topTours: [],
      topLodges: [],
      popularCategories: [],
    };
  }
}

// Predictive analytics - booking trends
export async function getPredictiveAnalytics() {
  noStore();
  try {
    await requireMinimumRole("ADMIN");

    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);

    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: last90Days },
      },
      select: {
        createdAt: true,
        status: true,
        itemType: true,
        date: true, // booking date
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate booking velocity (bookings per week)
    const weeklyBookings: Record<string, number> = {};
    recentBookings.forEach((booking) => {
      const weekKey = getWeekKey(booking.createdAt);
      weeklyBookings[weekKey] = (weeklyBookings[weekKey] || 0) + 1;
    });

    const weeklyData = Object.entries(weeklyBookings)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Calculate trend (simple linear regression)
    const avgWeeklyBookings = weeklyData.length > 0
      ? weeklyData.reduce((sum, d) => sum + d.count, 0) / weeklyData.length
      : 0;

    // Predict next month's bookings
    const predictedNextMonth = Math.round(avgWeeklyBookings * 4);

    // Seasonal patterns
    const monthlyPattern: Record<string, number> = {};
    recentBookings.forEach((booking) => {
      const monthKey = booking.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyPattern[monthKey] = (monthlyPattern[monthKey] || 0) + 1;
    });

    // Peak season identification
    const peakMonth = Object.entries(monthlyPattern)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      weeklyTrend: weeklyData,
      avgWeeklyBookings,
      predictedNextMonth,
      peakSeason: peakMonth ? { month: peakMonth[0], bookings: peakMonth[1] } : null,
      totalRecentBookings: recentBookings.length,
    };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      console.error("Authorization error:", error.message);
      throw error;
    }
    console.error("Failed to fetch predictive analytics:", error);
    return {
      weeklyTrend: [],
      avgWeeklyBookings: 0,
      predictedNextMonth: 0,
      peakSeason: null,
      totalRecentBookings: 0,
    };
  }
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = Math.ceil((d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}
