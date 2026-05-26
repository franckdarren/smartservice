import { redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getServices } from "@/server/queries/services";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ServicesView } from "@/features/services/services-view";

export default async function ServicesPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const servicesList = await getServices(tenant.id);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Services"
        subtitle={`${servicesList.length} service${servicesList.length > 1 ? "s" : ""}`}
      />
      <div className="p-6 flex-1">
        <ServicesView services={servicesList} />
      </div>
    </div>
  );
}
