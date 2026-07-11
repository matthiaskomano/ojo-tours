import type { Metadata } from "next";
import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Admin Dashboard | OJO Tours",
  description: "Manage your OJO Tours content and operations.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  // Check if user has admin role
  if (user.role?.name !== "ADMIN" && user.role?.name !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      <TooltipProvider>
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
}
