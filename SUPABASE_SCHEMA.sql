-- ==========================================
-- LeadQ.AI Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables and RLS policies.
-- This script is idempotent - safe to run multiple times.
-- ==========================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  location text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- 2. COMPANIES
create table if not exists public.companies (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text,
  website text,
  address text,
  intro text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.companies enable row level security;
drop policy if exists "Users can view their own company" on companies;
drop policy if exists "Users can update their own company" on companies;
drop policy if exists "Users can insert their own company" on companies;
create policy "Users can view their own company" on companies for select using (auth.uid() = owner_id);
create policy "Users can update their own company" on companies for update using (auth.uid() = owner_id);
create policy "Users can insert their own company" on companies for insert with check (auth.uid() = owner_id);

-- 3. NOTIFICATION SETTINGS
create table if not exists public.notification_settings (
    user_id uuid references auth.users(id) on delete cascade primary key,
    push_enabled boolean default true,
    meeting_reminders boolean default true,
    account_alerts boolean default false,
    system_announcements boolean default false,
    product_updates boolean default true,
    timers jsonb default '[15, 60]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.notification_settings enable row level security;
drop policy if exists "Users can view/edit their own settings" on notification_settings;
create policy "Users can view/edit their own settings" on notification_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. SECURITY LOGS (For Password Updates, etc.)
create table if not exists public.security_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    event_type text not null, -- 'PASSWORD_UPDATE', 'LOGIN_ATTEMPT', etc.
    ip_address text,
    device_info text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.security_logs enable row level security;
drop policy if exists "Users can insert logs" on security_logs;
drop policy if exists "Users can view their own logs" on security_logs;
create policy "Users can insert logs" on security_logs for insert with check (auth.uid() = user_id);
create policy "Users can view their own logs" on security_logs for select using (auth.uid() = user_id);

-- 5. USERS LOGIN (For Login/Signup tracking)
create table if not exists public.users_login (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    email text,
    event_type text, -- 'LOGIN', 'SIGNUP'
    device_info text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.users_login enable row level security;
drop policy if exists "Users can insert login logs" on users_login;
drop policy if exists "Users can view their own login logs" on users_login;
create policy "Users can insert login logs" on users_login for insert with check (auth.uid() = user_id);
create policy "Users can view their own login logs" on users_login for select using (auth.uid() = user_id);

-- 6. SUPPORT TICKETS
create table if not exists public.support_tickets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    category text,
    priority text,
    subject text,
    description text,
    status text default 'Open',
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.support_tickets enable row level security;
drop policy if exists "Users can create tickets" on support_tickets;
drop policy if exists "Users can view their own tickets" on support_tickets;
create policy "Users can create tickets" on support_tickets for insert with check (auth.uid() = user_id);
create policy "Users can view their own tickets" on support_tickets for select using (auth.uid() = user_id);

-- 7. FEEDBACK SUBMISSIONS
create table if not exists public.feedback_submissions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    topic text,
    message text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.feedback_submissions enable row level security;
drop policy if exists "Users can submit feedback" on feedback_submissions;
create policy "Users can submit feedback" on feedback_submissions for insert with check (auth.uid() = user_id);

-- 8. PAYMENT METHODS (Mock/Placeholder)
create table if not exists public.payment_methods (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    card_brand text,
    last_4 text,
    expiry text,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.payment_methods enable row level security;
drop policy if exists "Users can manage payment methods" on payment_methods;
create policy "Users can manage payment methods" on payment_methods for all using (auth.uid() = user_id);

-- 9. REFERRALS (Mock/Placeholder)
create table if not exists public.referrals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    referral_code text unique,
    referral_history jsonb default '[]'::jsonb, -- Array of objects
    stats jsonb default '{}'::jsonb, -- Earnings, clicks etc
    created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.referrals enable row level security;
drop policy if exists "Users can view their own referrals" on referrals;
create policy "Users can view their own referrals" on referrals for select using (auth.uid() = user_id);

-- 10. INVOICES (Mock/Placeholder)
create table if not exists public.invoices (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    invoice_date timestamp with time zone default now(),
    amount numeric,
    status text,
    pdf_url text
);
alter table public.invoices enable row level security;
drop policy if exists "Users can view their invoices" on invoices;
create policy "Users can view their invoices" on invoices for select using (auth.uid() = user_id);

-- 11. SECURITY SETTINGS (Two-Factor Authentication)
create table if not exists public.security_settings (
    user_id uuid references auth.users(id) on delete cascade primary key,
    two_factor_enabled boolean default true,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.security_settings enable row level security;
drop policy if exists "Users can view their own security settings" on security_settings;
drop policy if exists "Users can update their own security settings" on security_settings;
drop policy if exists "Users can insert their own security settings" on security_settings;
create policy "Users can view their own security settings" on security_settings for select using (auth.uid() = user_id);
create policy "Users can update their own security settings" on security_settings for update using (auth.uid() = user_id);
create policy "Users can insert their own security settings" on security_settings for insert with check (auth.uid() = user_id);

-- Function to automatically create security_settings for new users
create or replace function public.handle_new_user_security_settings()
returns trigger as $$
begin
  insert into public.security_settings (user_id, two_factor_enabled)
  values (new.id, true)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create security_settings on user signup
drop trigger if exists on_auth_user_created_security_settings on auth.users;
create trigger on_auth_user_created_security_settings
  after insert on auth.users
  for each row execute function public.handle_new_user_security_settings();
