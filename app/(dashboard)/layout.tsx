import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
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
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
