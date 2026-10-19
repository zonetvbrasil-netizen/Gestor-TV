-- ==============================================================================
-- GESTORTV - SISTEMA DE CRM & COBRANÇA RECORRENTE PARA TV POR ASSINATURA
-- Schema SQL PostgreSQL com Supabase RLS (Row Level Security) e Migrations
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS CUSTOMIZADOS (ENUMS)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'reseller', 'attendant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_status AS ENUM ('active', 'expiring', 'expired', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'canceled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'reseller',
    phone TEXT,
    company_name TEXT DEFAULT 'GestorTV',
    pix_key TEXT,
    pix_key_type TEXT DEFAULT 'random',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA: PLANS
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration_months INT NOT NULL DEFAULT 1,
    duration_type TEXT NOT NULL DEFAULT 'mensal', -- mensal, trimestral, semestral, anual
    price NUMERIC(10, 2) NOT NULL,
    screens INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA: COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percent', -- percent, fixed
    discount_value NUMERIC(10, 2) NOT NULL,
    max_uses INT DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA: CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    screens INT NOT NULL DEFAULT 1,
    devices JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Smart TV LG", "Fire Stick 4K"]
    notes TEXT,
    status customer_status NOT NULL DEFAULT 'active',
    consent_lgpd BOOLEAN NOT NULL DEFAULT true,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA: SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA: INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'pending',
    pix_code TEXT,
    pix_qr_url TEXT,
    payment_method TEXT DEFAULT 'pix',
    external_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABELA: PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method TEXT NOT NULL DEFAULT 'pix', -- pix, manual_cash, manual_transfer, credit_card
    status TEXT NOT NULL DEFAULT 'confirmed',
    transaction_reference TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABELA: MESSAGE_TEMPLATES
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- before_3_days, on_due_date, after_2_days, trial_welcome, payment_confirmed
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABELA: MESSAGE_QUEUE
CREATE TABLE IF NOT EXISTS public.message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    sent_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TABELA: TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'open',
    device_type TEXT NOT NULL DEFAULT 'smart_tv', -- smart_tv, fire_stick, tv_box, smartphone, pc, other
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABELA: TICKET_MESSAGES
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL DEFAULT 'agent', -- agent, customer, system
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. TABELA: AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES DE ALTA PERFORMANCE (STATUS, VENCIMENTO, BUSCA)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_due_date ON public.customers(due_date);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_plan_id ON public.customers(plan_id);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);

CREATE INDEX IF NOT EXISTS idx_message_queue_status ON public.message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_customer ON public.message_queue(customer_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: current user role
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: Users can read own profile; Admin can read all
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.get_auth_role() = 'admin');

CREATE POLICY "Profiles updatable by self or admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.get_auth_role() = 'admin');

-- Customers:
-- Admin & Attendant see all; Resellers see ONLY their own (user_id = auth.uid())
CREATE POLICY "Customers visibility by role" ON public.customers
    FOR SELECT USING (
        public.get_auth_role() IN ('admin', 'attendant') 
        OR user_id = auth.uid()
    );

CREATE POLICY "Customers insertable by reseller or admin" ON public.customers
    FOR INSERT WITH CHECK (
        public.get_auth_role() = 'admin' 
        OR user_id = auth.uid()
    );

CREATE POLICY "Customers updatable by owner or admin" ON public.customers
    FOR UPDATE USING (
        public.get_auth_role() = 'admin' 
        OR user_id = auth.uid()
    );

CREATE POLICY "Customers deletable by owner or admin" ON public.customers
    FOR DELETE USING (
        public.get_auth_role() = 'admin' 
        OR user_id = auth.uid()
    );

-- Invoices:
CREATE POLICY "Invoices visibility by role" ON public.invoices
    FOR SELECT USING (
        public.get_auth_role() IN ('admin', 'attendant') 
        OR EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.id = invoices.customer_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Invoices manageable by owner or admin" ON public.invoices
    FOR ALL USING (
        public.get_auth_role() = 'admin' 
        OR EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.id = invoices.customer_id AND c.user_id = auth.uid()
        )
    );

-- Plans & Coupons: Viewable by all authenticated users; Managed by admin
CREATE POLICY "Plans readable by authenticated users" ON public.plans
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Plans manageable by admin" ON public.plans
    FOR ALL USING (public.get_auth_role() = 'admin');

CREATE POLICY "Coupons readable by authenticated users" ON public.coupons
    FOR SELECT TO authenticated USING (true);

-- Tickets & Messages:
CREATE POLICY "Tickets visible to assigned, attendants, admins and customer owners" ON public.tickets
    FOR SELECT USING (
        public.get_auth_role() IN ('admin', 'attendant')
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.id = tickets.customer_id AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Tickets insertable by authenticated users" ON public.tickets
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Tickets updatable by authenticated users" ON public.tickets
    FOR UPDATE TO authenticated USING (true);

-- Audit logs: Read by admin only, inserted by system/users
CREATE POLICY "Audit logs visible by admin" ON public.audit_logs
    FOR SELECT USING (public.get_auth_role() = 'admin');

CREATE POLICY "Audit logs insertable by all authenticated" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
