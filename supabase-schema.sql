-- ============================================================================
-- NIMZA RESTAURANT MANAGEMENT SYSTEM - COMPLETE PROFESSIONAL SCHEMA
-- Safe & Idempotent: Run this in Supabase SQL Editor.
-- Covers all missing tables & columns for a 100% complete professional setup.
-- ============================================================================

-- 1. PROFILES TABLE (Customers, Chefs, Admins)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'chef', 'admin')),
  created_at timestamptz default now()
);

alter table profiles add column if not exists email text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists created_at timestamptz default now();

-- Update role constraint if needed
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('customer', 'chef', 'admin'));
alter table profiles alter column role set default 'customer';
alter table profiles disable row level security;

-- 2. CATEGORIES TABLE
create table if not exists categories (
  id serial primary key,
  name text unique not null,
  created_at timestamptz default now()
);

alter table categories add column if not exists created_at timestamptz default now();
alter table categories disable row level security;

-- 3. MENU ITEMS TABLE
create table if not exists menu_items (
  id serial primary key,
  category_id int references categories on delete set null,
  name text not null,
  description text,
  price numeric(8,2) not null,
  image_url text,
  badge text,
  dietary text,
  ingredients text,
  calories int,
  prep_time text default '15-20 min',
  rating numeric(2,1) default 5.0,
  is_available boolean default true,
  created_at timestamptz default now()
);

alter table menu_items add column if not exists dietary text;
alter table menu_items add column if not exists ingredients text;
alter table menu_items add column if not exists calories int;
alter table menu_items add column if not exists prep_time text default '15-20 min';
alter table menu_items add column if not exists rating numeric(2,1) default 5.0;
alter table menu_items add column if not exists is_available boolean default true;
alter table menu_items add column if not exists created_at timestamptz default now();
alter table menu_items disable row level security;

-- 4. ORDERS TABLE (Delivery, Dine-In & Takeaway)
create table if not exists orders (
  id serial primary key,
  user_id uuid references auth.users on delete set null,
  status text default 'Pending' check (status in ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled')),
  total numeric(10,2) not null default 0.00,
  table_no int,
  order_type text default 'dine_in' check (order_type in ('dine_in', 'takeaway', 'delivery')),
  delivery_address text,
  delivery_phone text,
  customer_name text,
  payment_method text default 'Cash at Table',
  payment_status text default 'Pending',
  notes text,
  discount_code text,
  discount_amount numeric(10,2) default 0.00,
  created_at timestamptz default now()
);

alter table orders add column if not exists order_type text default 'dine_in';
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists delivery_phone text;
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists payment_status text default 'Pending';
alter table orders add column if not exists discount_code text;
alter table orders add column if not exists discount_amount numeric(10,2) default 0.00;

alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'));
alter table orders disable row level security;

-- 5. ORDER ITEMS TABLE
create table if not exists order_items (
  id serial primary key,
  order_id int references orders on delete cascade,
  menu_item_id int references menu_items on delete set null,
  quantity int not null default 1,
  price numeric(10,2),
  customizations text,
  created_at timestamptz default now()
);

alter table order_items add column if not exists price numeric(10,2);
alter table order_items add column if not exists customizations text;
alter table order_items add column if not exists created_at timestamptz default now();
alter table order_items disable row level security;

-- 6. RESERVATIONS & DINING PACKAGES TABLE
create table if not exists reservations (
  id serial primary key,
  user_id uuid references auth.users on delete set null,
  name text,
  phone text,
  email text,
  table_no int,
  section text,
  reserved_at timestamptz,
  guests int default 2,
  notes text,
  package_type text default 'standard',
  package_name text default 'Standard VIP Dining',
  package_price numeric(10,2) default 0.00,
  status text default 'Confirmed' check (status in ('Confirmed', 'Waitlisted', 'Completed', 'Cancelled')),
  booking_type text default 'table_reservation' check (booking_type in ('table_reservation', 'event_booking')),
  qr_code text,
  reminder_opt_in boolean default true,
  waitlist_position int,
  created_at timestamptz default now()
);

alter table reservations add column if not exists section text;
alter table reservations add column if not exists package_type text default 'standard';
alter table reservations add column if not exists package_name text default 'Standard VIP Dining';
alter table reservations add column if not exists package_price numeric(10,2) default 0.00;
alter table reservations add column if not exists booking_type text default 'table_reservation';
alter table reservations add column if not exists qr_code text;
alter table reservations add column if not exists reminder_opt_in boolean default true;
alter table reservations add column if not exists waitlist_position int;
alter table reservations add column if not exists created_at timestamptz default now();

alter table reservations drop constraint if exists reservations_status_check;
alter table reservations add constraint reservations_status_check check (status in ('Confirmed', 'Waitlisted', 'Completed', 'Cancelled'));
alter table reservations disable row level security;

-- 7. RESTAURANT TABLES FLOOR PLAN
create table if not exists restaurant_tables (
  table_no int primary key,
  seats int not null default 4,
  section text not null,
  status text not null default 'Available' check (status in ('Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked')),
  current_guest text,
  sitting_time text,
  notes text,
  updated_at timestamptz default now()
);

alter table restaurant_tables add column if not exists sitting_time text;
alter table restaurant_tables add column if not exists notes text;
alter table restaurant_tables add column if not exists updated_at timestamptz default now();
alter table restaurant_tables disable row level security;

-- 8. CUSTOMER REVIEWS TABLE
create table if not exists reviews (
  id serial primary key,
  user_id uuid references auth.users on delete set null,
  author text not null,
  role_or_tag text,
  avatar_url text,
  rating numeric(2,1) not null default 5.0,
  quote text not null,
  is_featured boolean default true,
  status text default 'Approved' check (status in ('Approved', 'Pending', 'Hidden')),
  created_at timestamptz default now()
);

alter table reviews add column if not exists is_featured boolean default true;
alter table reviews add column if not exists status text default 'Approved';
alter table reviews add column if not exists created_at timestamptz default now();
alter table reviews disable row level security;

-- 9. FAVORITES / WISHLIST TABLE
create table if not exists favorites (
  id serial primary key,
  user_id uuid references auth.users on delete cascade,
  menu_item_id int references menu_items on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, menu_item_id)
);

alter table favorites disable row level security;

-- 10. STORAGE BUCKET FOR MENU ASSETS
insert into storage.buckets(id, name, public) values('menu', 'menu', true) on conflict do nothing;

-- 11. INVENTORY ITEMS TABLE
create table if not exists inventory_items (
  id serial primary key,
  name text not null,
  category text not null default 'Pantry & Dry Goods',
  quantity numeric(10,2) not null default 0.0,
  unit text not null default 'units',
  min_threshold numeric(10,2) not null default 5.0,
  unit_cost numeric(10,2) default 0.0,
  supplier text,
  storage_location text,
  last_restocked_at timestamptz,
  created_at timestamptz default now()
);

alter table inventory_items disable row level security;

-- 12. RECIPE INGREDIENTS MAPPING
create table if not exists recipe_ingredients (
  id serial primary key,
  menu_item_id int references menu_items on delete cascade,
  inventory_item_id int references inventory_items on delete cascade,
  quantity_required numeric(10,2) not null default 1.0,
  created_at timestamptz default now(),
  unique(menu_item_id, inventory_item_id)
);

alter table recipe_ingredients disable row level security;

-- 13. INVENTORY AUDIT / TRANSACTION LEDGER
create table if not exists inventory_transactions (
  id serial primary key,
  inventory_item_id int references inventory_items on delete cascade,
  type text not null check(type in ('Restock', 'Order Consumption', 'Waste', 'Manual Adjustment')),
  quantity_delta numeric(10,2) not null,
  previous_quantity numeric(10,2) not null,
  new_quantity numeric(10,2) not null,
  reason text,
  created_by text,
  created_at timestamptz default now()
);

alter table inventory_transactions disable row level security;

-- 14. PROMOTIONAL COUPONS & VOUCHERS TABLE
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

alter table coupons disable row level security;

-- 15. MULTI-BRANCH LOCATIONS TABLE
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

alter table branches disable row level security;

-- 16. COURIERS & DRIVER FLEET TABLE
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

alter table couriers disable row level security;

-- 17. AUTO-CREATE / SYNC PROFILE ON SIGNUP TRIGGER
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_signup on auth.users;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- 18. REALTIME REPLICATION (For instant kitchen order updates, live tables & menu changes)
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
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'inventory_items') then
    alter publication supabase_realtime add table inventory_items;
  end if;
end $$;

-- 19. INITIAL SEED DATA
-- Categories
insert into categories(name) values('Starters'), ('Mains'), ('Desserts'), ('Drinks') on conflict do nothing;

-- Culinary Menu Items
insert into menu_items(category_id, name, description, price, image_url, badge, dietary, ingredients)
select c.id, v.n, v.d, v.p, v.i, v.b, v.diet, v.ing from (values
  ('Starters', 'Garden Harvest Bowl', 'Seasonal tender leaves, herbs, shaved radishes, and cold-pressed citrus dressing.', 11.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', 'Organic', 'Vegan', 'Baby spinach, wild arugula, heirloom radishes, cold-pressed Amalfi lemon, extra virgin olive oil'),
  ('Starters', 'Burrata Pugliese', 'Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.', 14.00, 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80', 'Chef pick', 'Vegetarian', 'Artisanal buffalo burrata, heirloom confit tomatoes, basil oil, grilled sourdough'),
  ('Mains', 'Truffle Tagliatelle', 'Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.', 18.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', 'Top pick', 'Hand-Crafted', 'Handmade semolina pasta, Umbrian black winter truffles, 36-month aged Parmigiano-Reggiano, churned butter'),
  ('Mains', 'Grilled Ribeye Prime', '300g heritage dry-aged beef, bone marrow glaze, roasted vegetables, thyme jus.', 29.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', 'Wood-fired', 'Gluten-Free', '45-day dry-aged beef, roasted bone marrow glaze, glazed heritage carrots, fresh thyme jus'),
  ('Mains', 'Pan-Seared Herb Salmon', 'Wild Scottish salmon, champagne beurre blanc, braised fennel, sea greens.', 22.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80', 'Wild Catch', 'Gluten-Free', 'Wild Scottish salmon, champagne beurre blanc, braised Florence fennel, sea samphire'),
  ('Mains', 'Wood-Fired Margherita', 'San Marzano D.O.P. tomatoes, buffalo mozzarella, fresh sweet basil, extra virgin olive oil.', 15.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', 'Classic', 'Vegetarian', 'San Marzano D.O.P. tomatoes, fresh Fior di Latte mozzarella, sweet Genovese basil, organic olive oil'),
  ('Desserts', 'Tiramisu al Mascarpone', 'Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.', 9.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80', 'Chef pick', 'Vegetarian', 'Single-origin espresso, Savoiardi ladyfingers, sweet mascarpone cream, Valrhona cocoa'),
  ('Desserts', 'Molten Valrhona Sphere', 'Warm dark chocolate ganache cake, Madagascar bourbon vanilla ice cream, golden lace.', 10.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80', 'Signature', 'Vegetarian', '70% Guanaja chocolate, Madagascar bourbon vanilla bean ice cream, caramel spun lace'),
  ('Drinks', 'Citrus Amalfi Spritz', 'Blood orange, rosemary infusion, Mediterranean soda, prosecco bubbles.', 7.00, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', 'Refresher', 'Vegan', 'Fresh Sicilian blood orange juice, wild garden rosemary sprig, sparkling water, herbal bitters')
) as v(cat, n, d, p, i, b, diet, ing) join categories c on c.name = v.cat
on conflict do nothing;

-- Floor Plan Tables
insert into restaurant_tables (table_no, seats, section, status, current_guest, sitting_time) values
  (1, 2, 'Window Terrace', 'Occupied', 'Lord Sterling (2p)', '19:30'),
  (2, 2, 'Window Terrace', 'Reserved', 'Sophia Delacroix (2p)', '20:00'),
  (3, 4, 'Window Terrace', 'Occupied', 'Countess Elena (4p)', '19:00'),
  (4, 4, 'Grand Dining Hall', 'Available', 'Ready for Seating', null),
  (5, 6, 'Grand Dining Hall', 'Available', 'Ready for Seating', null),
  (6, 6, 'Grand Dining Hall', 'Reserved', 'Dr. Alistair (5p)', '20:30'),
  (7, 4, 'Garden Veranda', 'Cleaning', 'Table Turnover in Progress', null),
  (8, 6, 'Garden Veranda', 'Available', 'Ready for Seating', null),
  (9, 6, 'Private Wine Vault', 'Reserved', 'Baron Von Essen (6p)', '20:00'),
  (10, 8, 'Private Wine Vault', 'Available', 'Ready for Seating', null),
  (11, 4, 'Chef''s Counter VIP', 'Occupied', 'Ambassador Vance (4p)', '19:30'),
  (12, 12, 'Royal Salon', 'Reserved', 'Diplomatic Suite (10p)', '20:30')
on conflict (table_no) do update set
  seats = excluded.seats,
  section = excluded.section;

-- Customer Reviews
insert into reviews (author, role_or_tag, avatar_url, rating, quote, is_featured, status) values
  ('Sarah Johnson', 'Anniversary Dinner', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', 5.0, 'The truffle pasta was absolutely divine! The ambiance was perfect for our anniversary dinner. We''ll definitely be back.', true, 'Approved'),
  ('Mike Chen', 'Food Blogger', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 5.0, 'As a food blogger, I''ve dined at hundreds of restaurants. Savory Delights stands out for its innovative flavors and impeccable service.', true, 'Approved'),
  ('Emma Davis', 'Corporate Event', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', 4.5, 'We hosted our company holiday party here and everything was perfect. The staff went above and beyond to make our event special.', true, 'Approved')
on conflict do nothing;

-- Promotional Coupons
insert into coupons (code, title, discount_type, discount_value, min_spend_usd, description, badge, expiry_date, is_active) values
  ('NIMZA10', '10% VIP Welcome Privilege', 'percentage', 10.00, 0.00, 'Enjoy 10% off your artisanal culinary experience.', '10% OFF', 'Dec 31, 2027', true),
  ('TASTE20', '20% Grand Gastronomy Tasting', 'percentage', 20.00, 60.00, '20% reduction on fine dining orders exceeding $60 USD.', '20% OFF', 'Ongoing', true),
  ('VIP10OFF', '$10 Loyalty Dining Certificate', 'fixed', 10.00, 30.00, 'Redeemed via loyalty points. $10 instant ticket deduction.', '$10 OFF', 'Valid 30 Days', true),
  ('VIP25OFF', '$25 Epicurean Master Voucher', 'fixed', 25.00, 80.00, 'Exclusive $25 coupon for orders of $80 or more.', '$25 OFF', 'Valid 60 Days', true),
  ('CHEFSPECIAL', '$15 Chef Elias Degustation Credit', 'fixed', 15.00, 50.00, 'Complimentary credit towards signature courses and grilled cuts.', '$15 OFF', 'Limited Reserve', true)
on conflict (code) do nothing;

-- Multi-Branch Locations
insert into branches (id, name, tagline, address, city_district, phone, email, head_chef, sommelier, table_count, seating_capacity, operating_hours, status, image_url, features, lat, lng) values
  ('branch-downtown', 'Nimza Capital Flagship', 'The original culinary hearth & wood-fire pass', '12 Garden Road, Capital Enclave, Luxury Quarter', 'Downtown Capital', '+1 (555) 392-1049', 'flagship@nimza.example', 'Chef Elias Vance (Brigade Leader)', 'Matteo Laurent', 18, 72, '12:00 PM – 11:30 PM Daily', 'Open', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', array['Open Flame Tuscan Wood Grill', 'Private Salon (16 Guests)', 'White-Glove Valet Parking', 'Cellar Wine Vault'], 45.4642, 9.1900),
  ('branch-marina', 'Nimza Marina Waterfront', 'Panoramic coastal terrace & Mediterranean raw bar', 'Pier 7, The Grand Promenade, Marina Boardwalk', 'Waterfront Harbour', '+1 (555) 749-8201', 'marina@nimza.example', 'Chef Clara Moretti', 'Guillaume Roche', 24, 96, '1:00 PM – 12:00 AM (Tue-Sun)', 'Open', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', array['Open-Air Sea View Terrace', 'Wild Oyster & Crudo Raw Bar', 'Private Yacht Tender Docking', 'Sunset Cocktail Lounge'], 45.4780, 9.2150)
on conflict (id) do nothing;

-- Couriers Fleet
insert into couriers (id, name, phone, vehicle_type, vehicle_plate, status, rating, total_deliveries, current_lat, current_lng, is_active) values
  ('cour-01', 'Tariq Al-Mansoor', '+92 300 5551234', 'Motorcycle', 'LE-24-9102', 'Available', 4.9, 142, 45.4650, 9.1890, true),
  ('cour-02', 'Zayn Malik', '+92 321 8884321', 'Electric Scooter', 'EV-88-3310', 'Available', 4.8, 98, 45.4670, 9.1920, true)
on conflict (id) do nothing;

-- ============================================================================
-- SQL TO GRANT ADMIN / CHEF ROLES TO SPECIFIC USERS:
-- Run in Supabase SQL editor replacing your email:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your_email@gmail.com';
-- UPDATE profiles SET role = 'chef' WHERE email = 'chef_email@gmail.com';
-- ============================================================================
