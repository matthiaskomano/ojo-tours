import type { Metadata } from "next";
import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { NotificationProvider } from "@/contexts/notification-context";

export const metadata: Metadata = {
  title: "Staff Dashboard | OJO Tours",
  description: "Staff dashboard for managing bookings and viewing content.",
};

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  // Check if user has staff role
  if (user.role?.name !== "STAFF") {
    // Redirect to appropriate dashboard
    if (["ADMIN", "SUPER_ADMIN"].includes(user.role?.name || "")) {
      redirect("/dashboard/admin");
    }
    if (user.role?.name === "TOURIST") {
      redirect("/dashboard/tourist");
    }
    redirect("/");
  }

  return (
    <TooltipProvider>
      <NotificationProvider userId={user.id} userRole={user.role?.name}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <StaffSidebar user={user} />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </NotificationProvider>
    </TooltipProvider>
  );
}