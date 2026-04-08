-- Consolidated Supabase SQL Setup
-- This file contains all table definitions and logic for the Settings Dashboard

-- 1. Security Settings
CREATE TABLE IF NOT EXISTS public.security_settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    two_factor_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT true,
    meeting_reminders BOOLEAN DEFAULT true,
    account_alerts BOOLEAN DEFAULT false,
    system_announcements BOOLEAN DEFAULT false,
    product_updates BOOLEAN DEFAULT true,
    timers INTEGER[] DEFAULT '{15, 60}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Security Logs
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    ip_address TEXT,
    device_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    category TEXT,
    priority TEXT,
    subject TEXT,
    description TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Feedback Submissions
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    topic TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10, 2),
    status TEXT,
    invoice_date DATE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    brand TEXT,
    last_4 TEXT,
    expiry TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Active Sessions (NEW FEATURE)
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    device TEXT,
    browser TEXT,
    ip_address TEXT,
    location TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Policies (Allow users to see their own data)
CREATE POLICY "Users can view their own security settings" ON public.security_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own security settings" ON public.security_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification settings" ON public.notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification settings" ON public.notification_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own security logs" ON public.security_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own security logs" ON public.security_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.feedback_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.active_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.active_sessions FOR DELETE USING (auth.uid() = user_id);
