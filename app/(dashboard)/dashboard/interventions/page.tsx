import { redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getInterventions, getCompletedAppointmentsWithoutIntervention } from "@/server/queries/interventions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InterventionsView } from "@/features/interventions/interventions-view";

export default async function InterventionsPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const [interventionsList, appointments] = await Promise.all([
    getInterventions(tenant.id),
    getCompletedAppointmentsWithoutIntervention(tenant.id),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Interventions"
        subtitle={`${interventionsList.length} intervention${interventionsList.length > 1 ? "s" : ""}`}
      />
      <div className="p-6 flex-1">
        <InterventionsView
          interventions={interventionsList}
          appointments={appointments}
        />
      </div>
    </div>
  );
}
