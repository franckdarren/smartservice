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
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-card">
      <div className="min-w-0">
        <h1 className="text-base sm:text-xl font-semibold truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{tenant.name}</p>
        </div>
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
