import type { Metadata } from "next";
import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { TouristSidebar } from "@/components/tourist/tourist-sidebar";
import Chatbot from "@/components/chatbot/Chatbot";
import { NotificationProvider } from "@/contexts/notification-context";

export const metadata: Metadata = {
  title: "Tourist Dashboard | OJO Tours",
  description: "Manage your bookings, trips, and profile.",
};

export default async function TouristLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  // Check if user has tourist role
  if (user.role?.name !== "TOURIST") {
    // Redirect to appropriate dashboard
    if (["ADMIN", "SUPER_ADMIN", "STAFF"].includes(user.role?.name || "")) {
      redirect("/dashboard/admin");
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
          <TouristSidebar user={user} />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                {children}
              </div>
            </div>
          </SidebarInset>
          <Chatbot />
        </SidebarProvider>
      </NotificationProvider>
    </TooltipProvider>
  );
}
