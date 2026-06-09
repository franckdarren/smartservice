import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);

  if (!tenant || !user) {
    redirect("/login");
  }

  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      <Toaster richColors position="top-right" />
    </>
  );
}
