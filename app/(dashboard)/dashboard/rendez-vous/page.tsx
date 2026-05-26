import { redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getAppointments } from "@/server/queries/appointments";
import { getCustomers } from "@/server/queries/customers";
import { getServices } from "@/server/queries/services";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppointmentsView } from "@/features/appointments/appointments-view";

export default async function RendezVousPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const [appts, customersList, servicesList] = await Promise.all([
    getAppointments(tenant.id),
    getCustomers(tenant.id),
    getServices(tenant.id),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Rendez-vous"
        subtitle={`${appts.length} rendez-vous`}
      />
      <div className="p-6 flex-1">
        <AppointmentsView
          appointments={appts}
          customers={customersList}
          services={servicesList}
        />
      </div>
    </div>
  );
}
