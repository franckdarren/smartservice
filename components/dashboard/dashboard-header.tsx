import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tenant, User } from "@/types";

interface DashboardHeaderProps {
  tenant: Tenant;
  user: User;
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ tenant, user, title, subtitle }: DashboardHeaderProps) {
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{tenant.name}</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
