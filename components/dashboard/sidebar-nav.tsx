"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  ClipboardList,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/features/auth/actions";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/rendez-vous", label: "Rendez-vous", icon: Calendar },
  { href: "/dashboard/interventions", label: "Interventions", icon: ClipboardList },
  { href: "/dashboard/factures", label: "Factures", icon: FileText },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar text-sidebar-foreground shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-semibold text-sidebar-foreground">SmartService</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <form action={logoutUser}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
