"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { updateAppointmentStatus } from "@/server/actions/appointments";
import type { AppointmentStatus } from "@/types";

const nextStatus: Record<AppointmentStatus, { label: string; value: AppointmentStatus } | null> = {
  pending: { label: "Confirmer", value: "confirmed" },
  confirmed: { label: "Marquer terminé", value: "done" },
  done: null,
  cancelled: null,
};

interface AppointmentStatusButtonProps {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}

export function AppointmentStatusButton({
  appointmentId,
  currentStatus,
}: AppointmentStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const next = nextStatus[currentStatus];

  if (!next) return null;

  async function handleAction(status: AppointmentStatus) {
    setLoading(true);
    await updateAppointmentStatus(appointmentId, status);
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={() => handleAction(next.value)}
    >
      {loading ? "..." : next.label}
    </Button>
  );
}
