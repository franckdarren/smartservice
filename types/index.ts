export type Plan = "free" | "pro" | "business";
export type Role = "admin" | "staff";
export type AppointmentStatus = "pending" | "confirmed" | "done" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  plan: Plan;
  logoUrl: string | null;
  whatsappNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
}

export interface Customer {
  id: string;
  tenantId: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  serviceId: string | null;
  scheduledAt: Date;
  status: AppointmentStatus;
  isUrgent: boolean;
  notes: string | null;
  reviewToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  service?: Service | null;
}

export interface Intervention {
  id: string;
  tenantId: string;
  appointmentId: string;
  technicianId: string | null;
  notes: string | null;
  photosBefore: string[] | null;
  photosAfter: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  appointmentId: string | null;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  tenantId: string;
  customerId: string;
  appointmentId: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
}
