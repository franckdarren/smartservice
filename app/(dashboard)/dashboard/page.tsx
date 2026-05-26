import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getDashboardKPIs } from "@/server/queries/dashboard";
import { redirect } from "next/navigation";

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export default async function DashboardPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);

  if (!tenant || !user) redirect("/login");

  const kpis = await getDashboardKPIs(tenant.id);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Tableau de bord"
        subtitle={`Bienvenue, ${user.fullName}`}
      />

      <div className="p-6 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total clients"
            value={kpis.totalCustomers}
            icon={Users}
          />
          <StatCard
            title="RDV aujourd'hui"
            value={kpis.appointmentsToday}
            icon={Calendar}
          />
          <StatCard
            title="RDV en attente"
            value={kpis.pendingAppointments}
            icon={Clock}
          />
          <StatCard
            title="CA du mois"
            value={formatFCFA(kpis.monthRevenue)}
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );
}
