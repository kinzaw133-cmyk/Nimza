create table profiles(id uuid primary key references auth.users on delete cascade,full_name text,role text default 'customer' check(role in('customer','admin')));
create table categories(id serial primary key,name text unique not null);
create table menu_items(id serial primary key,category_id int references categories on delete set null,name text not null,description text,price numeric(8,2) not null,image_url text,badge text);
create table orders(id serial primary key,user_id uuid references auth.users,status text default 'Pending' check(status in('Pending','Preparing','Ready','Delivered')),total numeric(10,2),created_at timestamptz default now());
create table order_items(id serial primary key,order_id int references orders on delete cascade,menu_item_id int references menu_items on delete set null,quantity int not null);
create table reservations(id serial primary key,user_id uuid references auth.users,name text,phone text,table_no int,reserved_at timestamptz,guests int);
create or replace function is_admin() returns boolean language sql security definer as $$select exists(select 1 from profiles where id=auth.uid() and role='admin')$$;
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$begin insert into profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name');return new;end$$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();
alter table profiles enable row level security;alter table categories enable row level security;alter table menu_items enable row level security;alter table orders enable row level security;alter table order_items enable row level security;alter table reservations enable row level security;
create policy p1 on profiles for select using(id=auth.uid() or is_admin());
create policy c1 on categories for select using(true);create policy c2 on categories for all using(is_admin()) with check(is_admin());
create policy m1 on menu_items for select using(true);create policy m2 on menu_items for all using(is_admin()) with check(is_admin());
create policy o1 on orders for select using(user_id=auth.uid() or is_admin());create policy o2 on orders for insert with check(user_id=auth.uid());create policy o3 on orders for update using(is_admin());
create policy oi1 on order_items for select using(exists(select 1 from orders o where o.id=order_id and(o.user_id=auth.uid() or is_admin())));
create policy oi2 on order_items for insert with check(exists(select 1 from orders o where o.id=order_id and o.user_id=auth.uid()));
create policy r1 on reservations for select using(user_id=auth.uid() or is_admin());create policy r2 on reservations for insert with check(user_id=auth.uid());
alter publication supabase_realtime add table orders;
insert into categories(name) values('Starters'),('Mains'),('Desserts'),('Drinks');
insert into menu_items(category_id,name,description,price,image_url,badge) select c.id,v.n,v.d,v.p,v.i,v.b from (values
('Starters','Garden Bowl','Seasonal leaves, herbs and citrus dressing.',11,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',null),
('Mains','Truffle Tagliatelle','Hand-cut pasta, cream, black truffle, parmesan.',18,'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80','Top pick'),
('Mains','Grilled Ribeye','300g ribeye, garlic butter, roasted vegetables.',29,'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',null),
('Mains','Herb Salmon','Salmon, lemon beurre blanc and greens.',22,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',null),
('Mains','Margherita','Tomato, buffalo mozzarella, basil.',15,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',null),
('Desserts','Tiramisu','Espresso sponge, mascarpone, cocoa.',9,'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80','Chef pick'),
('Desserts','Molten Chocolate','Warm dark chocolate, vanilla cream.',10,'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',null),
('Drinks','Citrus Spritz','Blood orange, rosemary and soda.',7,'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',null)
) as v(cat,n,d,p,i,b) join categories c on c.name=v.cat;
insert into storage.buckets(id,name,public) values('menu','menu',true) on conflict do nothing;
create policy s1 on storage.objects for select using(bucket_id='menu');create policy s2 on storage.objects for all using(bucket_id='menu' and is_admin());
-- After registering, make yourself admin:
-- update profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');
