export type UserRole = 'admin' | 'reseller' | 'attendant';

export type CustomerStatus = 'active' | 'expiring' | 'expired' | 'suspended' | 'trial';

export type PlanDuration = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'canceled';

export type PaymentMethod = 'pix' | 'manual_cash' | 'manual_transfer' | 'credit_card';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type DeviceType = 'smart_tv' | 'fire_stick' | 'tv_box' | 'smartphone' | 'pc' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  companyName: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  durationType: PlanDuration;
  price: number;
  screens: number;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  userId: string; // Reseller or Admin owner
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  planId: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  screens: number;
  devices: string[];
  notes: string;
  status: CustomerStatus;
  consentLgpd: boolean;
  consentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName?: string;
  planId: string;
  planName?: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  pixCode: string;
  pixQrUrl?: string;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: 'confirmed' | 'pending' | 'refunded';
  transactionReference: string;
  paidAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  triggerEvent: 'before_3_days' | 'on_due_date' | 'after_2_days' | 'trial_welcome' | 'payment_confirmed';
  content: string;
  isActive: boolean;
}

export interface QueuedMessage {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  templateId?: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: string;
  sentAt?: string;
  failureReason?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'agent' | 'customer' | 'system';
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  assignedTo?: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  deviceType: DeviceType;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  createdAt: string;
}
