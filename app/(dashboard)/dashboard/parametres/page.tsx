import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { SettingsForm } from "@/features/settings/settings-form";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { redirect } from "next/navigation";

export default async function ParametresPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Paramètres"
        subtitle="Gérez les informations de votre entreprise"
      />
      <div className="p-4 sm:p-6 flex-1">
        <SettingsForm tenant={tenant} />
      </div>
    </div>
  );
}
