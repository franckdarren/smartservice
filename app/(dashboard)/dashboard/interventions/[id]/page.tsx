import { notFound, redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getInterventionById } from "@/server/queries/interventions";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InterventionDetail } from "@/features/interventions/intervention-detail";

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const intervention = await getInterventionById(tenant.id, id);
  if (!intervention) notFound();

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Détail intervention"
        subtitle={`${intervention.customerName ?? "Client"} — ${intervention.serviceName ?? "Sans service"}`}
      />
      <div className="p-6 flex-1">
        <InterventionDetail intervention={intervention} />
      </div>
    </div>
  );
}
