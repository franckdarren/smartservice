import { redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getCustomers } from "@/server/queries/customers";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CustomersView } from "@/features/customers/customers-view";

export default async function ClientsPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const customersList = await getCustomers(tenant.id);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Clients"
        subtitle={`${customersList.length} client${customersList.length > 1 ? "s" : ""}`}
      />
      <div className="p-6 flex-1">
        <CustomersView customers={customersList} />
      </div>
    </div>
  );
}
