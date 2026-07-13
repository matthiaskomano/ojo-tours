import type { Metadata } from "next";
import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | OJO Tours",
  description: "Manage your OJO Tours account and bookings.",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      {children}
    </main>
  );
}
