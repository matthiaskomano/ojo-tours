import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | OJO Tours",
  description: "Sign in or create an account to access OJO Tours premium experiences.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#040C08]">
      {children}
    </main>
  );
}
