-- ============================================================================
-- QUICK MIGRATION: RUN THIS TO ADD ONLY THE MISSING TABLES & COLUMNS
-- Safe & Instant: Won't delete or overwrite existing data!
-- ============================================================================

-- 1. ORDERS TABLE (Missing delivery & order type columns)
alter table if exists orders add column if not exists order_type text default 'dine_in';
alter table if exists orders add column if not exists delivery_address text;
alter table if exists orders add column if not exists delivery_phone text;
alter table if exists orders add column if not exists customer_name text;
alter table if exists orders add column if not exists payment_status text default 'Pending';
alter table if exists orders add column if not exists discount_code text;
alter table if exists orders add column if not exists discount_amount numeric(10,2) default 0.00;

-- 2. MENU ITEMS TABLE (Missing dietary tags, prep time, calories)
alter table if exists menu_items add column if not exists dietary text;
alter table if exists menu_items add column if not exists ingredients text;
alter table if exists menu_items add column if not exists calories int;
alter table if exists menu_items add column if not exists prep_time text default '15-20 min';
alter table if exists menu_items add column if not exists rating numeric(2,1) default 5.0;
alter table if exists menu_items add column if not exists is_available boolean default true;

-- 3. RESERVATIONS TABLE (Missing section, packages, qr_code)
alter table if exists reservations add column if not exists section text;
alter table if exists reservations add column if not exists package_type text default 'standard';
alter table if exists reservations add column if not exists package_name text default 'Standard VIP Dining';
alter table if exists reservations add column if not exists package_price numeric(10,2) default 0.00;
alter table if exists reservations add column if not exists booking_type text default 'table_reservation';
alter table if exists reservations add column if not exists qr_code text;
alter table if exists reservations add column if not exists reminder_opt_in boolean default true;
alter table if exists reservations add column if not exists waitlist_position int;

-- 4. RESTAURANT TABLES (Missing floor plan sitting time & notes)
alter table if exists restaurant_tables add column if not exists sitting_time text;
alter table if exists restaurant_tables add column if not exists notes text;
alter table if exists restaurant_tables add column if not exists updated_at timestamptz default now();

-- 5. PROFILES TABLE (Missing email & phone)
alter table if exists profiles add column if not exists email text;
alter table if exists profiles add column if not exists phone text;
alter table if exists profiles add column if not exists avatar_url text;
alter table if exists profiles add column if not exists created_at timestamptz default now();

-- 6. NEW TABLES IF NOT CREATED YET
create table if not exists coupons (
  code text primary key,
  title text not null,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_spend_usd numeric(10,2) not null default 0.00,
  description text,
  badge text,
  expiry_date text default 'Dec 31, 2027',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists branches (
  id text primary key,
  name text not null,
  tagline text,
  address text not null,
  city_district text,
  phone text,
  email text,
  head_chef text,
  sommelier text,
  table_count int default 18,
  seating_capacity int default 72,
  operating_hours text,
  status text default 'Open' check (status in ('Open', 'Near Capacity', 'Private Buyout', 'Closed')),
  image_url text,
  features text[],
  lat numeric(10,6),
  lng numeric(10,6),
  created_at timestamptz default now()
);

create table if not exists couriers (
  id text primary key,
  name text not null,
  phone text not null,
  avatar text,
  vehicle_type text default 'Motorcycle',
  vehicle_plate text,
  status text default 'Available' check (status in ('Available', 'On Delivery', 'On Break', 'Off Duty')),
  rating numeric(2,1) default 4.9,
  total_deliveries int default 0,
  current_lat numeric(10,6),
  current_lng numeric(10,6),
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- Disable RLS for seamless operation
alter table if exists profiles disable row level security;
alter table if exists categories disable row level security;
alter table if exists menu_items disable row level security;
alter table if exists orders disable row level security;
alter table if exists order_items disable row level security;
alter table if exists reservations disable row level security;
alter table if exists restaurant_tables disable row level security;
alter table if exists reviews disable row level security;
alter table if exists favorites disable row level security;
alter table if exists coupons disable row level security;
alter table if exists branches disable row level security;
alter table if exists couriers disable row level security;

-- Ensure realtime updates work
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'reservations') then
    alter publication supabase_realtime add table reservations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'menu_items') then
    alter publication supabase_realtime add table menu_items;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'categories') then
    alter publication supabase_realtime add table categories;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'reviews') then
    alter publication supabase_realtime add table reviews;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'restaurant_tables') then
    alter publication supabase_realtime add table restaurant_tables;
  end if;
end $$;
