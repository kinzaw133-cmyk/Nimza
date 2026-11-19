-- NIMZA RESTAURANT MANAGEMENT SUPABASE SCHEMA
-- Roles: customer (default), chef, admin

-- 1. Profiles Table with role: customer (default), chef, admin
create table if not exists profiles(
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text default 'customer' check (role in ('customer', 'chef', 'admin'))
);

-- Update check constraint if table already exists
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('customer', 'chef', 'admin'));
alter table profiles alter column role set default 'customer';

-- 2. Categories Table
create table if not exists categories(
  id serial primary key,
  name text unique not null
);

-- 3. Menu Items Table
create table if not exists menu_items(
  id serial primary key,
  category_id int references categories on delete set null,
  name text not null,
  description text,
  price numeric(8,2) not null,
  image_url text,
  badge text,
  ingredients text,
  is_available boolean default true
);

alter table menu_items add column if not exists ingredients text;
alter table menu_items add column if not exists is_available boolean default true;

-- 4. Orders Table
create table if not exists orders(
  id serial primary key,
  user_id uuid references auth.users,
  status text default 'Pending' check(status in ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled')),
  total numeric(10,2),
  table_no int,
  payment_method text,
  payment_status text default 'Pending',
  notes text,
  created_at timestamptz default now()
);

-- Ensure check constraint includes 'Cancelled' and column payment_status exists
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'));
alter table orders add column if not exists payment_status text default 'Pending';

-- 5. Order Items Table
create table if not exists order_items(
  id serial primary key,
  order_id int references orders on delete cascade,
  menu_item_id int references menu_items on delete set null,
  quantity int not null,
  customizations text
);

alter table order_items add column if not exists customizations text;

-- 6. Reservations & Dining Packages Table
create table if not exists reservations(
  id serial primary key,
  user_id uuid references auth.users,
  name text,
  phone text,
  email text,
  table_no int,
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

-- 6b. Restaurant Table Availability Floor Table
create table if not exists restaurant_tables(
  table_no int primary key,
  seats int not null default 4,
  section text not null,
  status text not null default 'Available' check (status in ('Available', 'Occupied', 'Reserved', 'Cleaning', 'Blocked')),
  current_guest text,
  updated_at timestamptz default now()
);

alter table restaurant_tables disable row level security;

-- 7. Customer Reviews Table
create table if not exists reviews(
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

-- Initial seed reviews matching guest experiences
insert into reviews (author, role_or_tag, avatar_url, rating, quote, is_featured, status)
values
  ('Sarah Johnson', 'Anniversary Dinner', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', 5.0, 'The truffle pasta was absolutely divine! The ambiance was perfect for our anniversary dinner. We''ll definitely be back.', true, 'Approved'),
  ('Mike Chen', 'Food Blogger', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 5.0, 'As a food blogger, I''ve dined at hundreds of restaurants. Savory Delights stands out for its innovative flavors and impeccable service.', true, 'Approved'),
  ('Emma Davis', 'Corporate Event', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', 4.5, 'We hosted our company holiday party here and everything was perfect. The staff went above and beyond to make our event special.', true, 'Approved')
on conflict do nothing;

-- 6b. Customer Wishlist / Favorites
create table if not exists favorites(
  id serial primary key,
  user_id uuid references auth.users on delete cascade,
  menu_item_id int references menu_items on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, menu_item_id)
);

alter table favorites disable row level security;

-- 7. Trigger to automatically create profile on signup
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_signup on auth.users;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

-- 8. Row Level Security: DISABLED as per instructions ("Don't add RLS policies")
alter table profiles disable row level security;
alter table categories disable row level security;
alter table menu_items disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table reservations disable row level security;
alter table reviews disable row level security;

-- 9. Supabase Realtime Publications
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table reservations;
alter publication supabase_realtime add table menu_items;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table restaurant_tables;

-- 10. Initial Culinary Catalog Data (Seed)
insert into categories(name) values('Starters'), ('Mains'), ('Desserts'), ('Drinks') on conflict do nothing;

insert into menu_items(category_id, name, description, price, image_url, badge)
select c.id, v.n, v.d, v.p, v.i, v.b from (values
  ('Starters', 'Garden Harvest Bowl', 'Seasonal tender leaves, herbs, shaved radishes, and cold-pressed citrus dressing.', 11.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', 'Organic'),
  ('Starters', 'Burrata Pugliese', 'Creamy artisanal burrata, heirloom confit tomatoes, basil oil, toasted sourdough.', 14.00, 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?w=800&q=80', 'Chef pick'),
  ('Mains', 'Truffle Tagliatelle', 'Hand-rolled tagliatelle, black winter truffle emulsion, 36-month aged Parmigiano.', 18.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80', 'Top pick'),
  ('Mains', 'Grilled Ribeye Prime', '300g heritage dry-aged beef, bone marrow glaze, roasted vegetables, thyme jus.', 29.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', 'Wood-fired'),
  ('Mains', 'Pan-Seared Herb Salmon', 'Wild Scottish salmon, champagne beurre blanc, braised fennel, sea greens.', 22.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80', 'Wild Catch'),
  ('Mains', 'Wood-Fired Margherita', 'San Marzano D.O.P. tomatoes, buffalo mozzarella, fresh sweet basil, extra virgin olive oil.', 15.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', 'Classic'),
  ('Desserts', 'Tiramisu al Mascarpone', 'Savoiardi soaked in single-origin espresso, sweet mascarpone foam, Valrhona cocoa.', 9.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80', 'Chef pick'),
  ('Desserts', 'Molten Valrhona Sphere', 'Warm dark chocolate ganache cake, Madagascar bourbon vanilla ice cream, golden lace.', 10.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80', 'Signature'),
  ('Drinks', 'Citrus Amalfi Spritz', 'Blood orange, rosemary infusion, Mediterranean soda, prosecco bubbles.', 7.00, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80', 'Refresher')
) as v(cat, n, d, p, i, b) join categories c on c.name = v.cat
on conflict do nothing;

-- 11. STORAGE BUCKET FOR MENU ASSETS
insert into storage.buckets(id, name, public) values('menu', 'menu', true) on conflict do nothing;

-- 12. INVENTORY & INGREDIENT MANAGEMENT TABLES
create table if not exists inventory_items(
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

-- 13. Recipe Ingredients Mapping (Associating dishes with required inventory)
create table if not exists recipe_ingredients(
  id serial primary key,
  menu_item_id int references menu_items on delete cascade,
  inventory_item_id int references inventory_items on delete cascade,
  quantity_required numeric(10,2) not null default 1.0,
  created_at timestamptz default now(),
  unique(menu_item_id, inventory_item_id)
);

alter table recipe_ingredients disable row level security;

-- 14. Inventory Audit & Transaction Ledger
create table if not exists inventory_transactions(
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

-- ============================================================================
-- SQL TO SET YOUR ACCOUNTS IN SUPABASE DASHBOARD:
-- Run these statements in your Supabase SQL Editor:
-- ============================================================================

-- 1. Set your account to administrator:
-- UPDATE profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM');

-- 2. Set the chef account to chef:
-- UPDATE profiles SET role = 'chef' WHERE id IN (SELECT id FROM auth.users WHERE email = 'CHEF_EMAIL@EXAMPLE.COM');
