begin;

-- Admin membership is provisioned in the SQL editor, never by a customer.
drop policy if exists "Admins can insert their own record" on public.admin_users;
revoke insert, update, delete on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders
  for select to authenticated using (
    exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );
drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status" on public.orders
  for update to authenticated
  using (exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email')))
  with check (exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email')));
grant select on public.orders to authenticated;
revoke update on public.orders from anon, authenticated;
grant update (status) on public.orders to authenticated;

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );
grant select on public.order_items to authenticated;

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null check (length(trim(name)) between 1 and 120),
  weight text not null check (length(trim(weight)) between 1 and 40),
  price numeric(12,2) not null check (price >= 0),
  category text not null check (category in ('Chicken', 'Beef', 'Mutton', 'Ready to Cook')),
  image text not null default '/products/chicken-curry-cut.svg',
  accent text not null default '#f6eee1',
  description text not null default '',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products add column if not exists description text not null default '';
alter table public.products add column if not exists stock_quantity integer not null default 0;
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
grant insert, update on public.products to authenticated;

insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do update set public = true;
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'products' and exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );
drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select to public using (bucket_id = 'products');
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update to authenticated using (
    bucket_id = 'products' and exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );

drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products" on public.products
  for select to anon, authenticated using (is_active);
drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products" on public.products
  for select to authenticated using (
    exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );
drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products
  for insert to authenticated with check (
    exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email'))
  );
drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products
  for update to authenticated
  using (exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email')))
  with check (exists (select 1 from public.admin_users where email = (select auth.jwt() ->> 'email')));

insert into public.products (id, name, weight, price, category, image, accent) values
  ('chicken-curry-cut', 'Chicken Curry Cut', '1 kg', 210, 'Chicken', '/products/chicken-curry-cut.svg', '#f6eee1'),
  ('chicken-chilli-cut', 'Chicken Chilli Cut', '1 kg', 210, 'Chicken', '/products/chicken-chilli-cut.svg', '#eaf1df'),
  ('chicken-biryani-cut', 'Chicken Biryani Cut', '1 kg', 220, 'Chicken', '/products/chicken-biryani-cut.svg', '#f8eadc'),
  ('boneless-chicken-breast', 'Boneless Chicken Breast', '500 g', 220, 'Chicken', '/products/boneless-chicken-breast.svg', '#e3f0ea')
on conflict (id) do nothing;

commit;
