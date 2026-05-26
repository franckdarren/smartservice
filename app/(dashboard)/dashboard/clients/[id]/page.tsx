import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getCustomerWithAppointments } from "@/server/queries/customers";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CustomerDetailActions } from "@/features/customers/customer-detail-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "En attente", variant: "secondary" },
  confirmed: { label: "Confirmé", variant: "default" },
  done: { label: "Terminé", variant: "outline" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const data = await getCustomerWithAppointments(tenant.id, id);
  if (!data) notFound();

  const { customer, appointments } = data;

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader tenant={tenant} user={user} title={customer.fullName} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux clients
          </Link>
          <CustomerDetailActions customer={customer} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Client depuis le{" "}
                  {format(new Date(customer.createdAt), "dd/MM/yyyy", { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Historique des rendez-vous ({appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun rendez-vous.</p>
                ) : (
                  <div className="space-y-2">
                    {appointments.map((appt) => {
                      const status = statusLabels[appt.status];
                      return (
                        <div
                          key={appt.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(appt.scheduledAt), "dd/MM/yyyy HH:mm", {
                                locale: fr,
                              })}
                            </p>
                            {appt.notes && (
                              <p className="text-xs text-muted-foreground">{appt.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {appt.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
