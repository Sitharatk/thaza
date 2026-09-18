create extension if not exists pgcrypto;

create sequence if not exists public.thaza_order_number_seq
  start with 1001
  increment by 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  landmark text,
  city text not null,
  pincode text not null,
  subtotal numeric not null,
  delivery_charge numeric not null,
  grand_total numeric not null,
  payment_method text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  weight text,
  price numeric not null,
  quantity integer not null,
  line_total numeric not null,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_phone on public.orders (phone);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

create policy "Orders are insertable via API" on public.orders
  for insert with check (true);
create policy "Orders are not readable by public" on public.orders
  for select using (false);

create policy "Order items are insertable via API" on public.order_items
  for insert with check (true);
create policy "Order items are not readable by public" on public.order_items
  for select using (false);

create or replace function public.create_order_with_items(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_landmark text,
  p_city text,
  p_pincode text,
  p_subtotal numeric,
  p_delivery_charge numeric,
  p_grand_total numeric,
  p_payment_method text,
  p_items jsonb
)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_order_id uuid;
  new_order_number text;
  item jsonb;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  new_order_number := 'THZ-' || nextval('public.thaza_order_number_seq')::text;

  insert into public.orders (
    order_number,
    customer_name,
    phone,
    address,
    landmark,
    city,
    pincode,
    subtotal,
    delivery_charge,
    grand_total,
    payment_method
  ) values (
    new_order_number,
    p_customer_name,
    p_phone,
    p_address,
    nullif(p_landmark, ''),
    p_city,
    p_pincode,
    p_subtotal,
    p_delivery_charge,
    p_grand_total,
    p_payment_method
  ) returning id into new_order_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      weight,
      price,
      quantity,
      line_total
    ) values (
      new_order_id,
      item->>'product_id',
      item->>'product_name',
      item->>'weight',
      (item->>'price')::numeric,
      (item->>'quantity')::integer,
      (item->>'line_total')::numeric
    );
  end loop;

  return query select new_order_id, new_order_number;
end;
$$;

grant execute on function public.create_order_with_items(text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb) to anon, authenticated;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read their own record" on public.admin_users
  for select
  using (email = auth.jwt() ->> 'email');

create policy "Admins can insert their own record" on public.admin_users
  for insert
  with check (email = auth.jwt() ->> 'email');
