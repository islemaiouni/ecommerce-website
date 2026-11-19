create extension if not exists pgcrypto;

create type public.order_status as enum (
  'new','calling','confirmed','sent_to_delivery','shipped','delivered',
  'no_answer','cancelled','returned'
);
create type public.admin_role as enum ('admin','agent');
create type public.delivery_type as enum ('home','bureau');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'agent',
  full_name text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  image_url text,
  active boolean not null default true,
  notes_top text[],
  notes_heart text[],
  notes_base text[],
  longevity_hours integer,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_ml integer not null check (size_ml > 0),
  price_dzd integer not null check (price_dzd >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  unique (product_id, size_ml)
);

create table public.wilayas (
  code smallint primary key check (code between 1 and 58),
  name_ar text not null,
  name_fr text not null
);

create table public.communes (
  id uuid primary key default gen_random_uuid(),
  wilaya_code smallint not null references public.wilayas(code),
  name_ar text not null,
  name_fr text not null,
  unique (wilaya_code, name_fr)
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  wilaya_code smallint not null references public.wilayas(code),
  delivery_type public.delivery_type not null,
  fee_dzd integer not null check (fee_dzd >= 0),
  estimated_days_min integer not null default 2,
  estimated_days_max integer not null default 3,
  unique (wilaya_code, delivery_type)
);

create table public.delivery_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  active boolean not null default true,
  webhook_secret text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  wilaya_code smallint not null references public.wilayas(code),
  commune text not null,
  address text not null,
  delivery_type public.delivery_type not null,
  status public.order_status not null default 'new',
  subtotal_dzd integer not null check (subtotal_dzd >= 0),
  shipping_dzd integer not null check (shipping_dzd >= 0),
  total_dzd integer not null check (total_dzd >= 0),
  delivery_provider_id uuid references public.delivery_providers(id),
  tracking_number text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status);
create index orders_phone_created_idx on public.orders(customer_phone, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  product_name text not null,
  size_ml integer not null,
  quantity integer not null check (quantity > 0),
  unit_price_dzd integer not null check (unit_price_dzd >= 0)
);

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid references auth.users(id),
  from_status public.order_status,
  to_status public.order_status not null,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger set_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.wilayas enable row level security;
alter table public.communes enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.delivery_providers enable row level security;

create policy "public reads active products" on public.products
for select to anon, authenticated using (active = true);
create policy "staff manages products" on public.products
for all to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
) with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "public reads active variants" on public.product_variants
for select to anon, authenticated using (active = true);
create policy "staff manages variants" on public.product_variants
for all to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
) with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "public reads wilayas" on public.wilayas for select to anon, authenticated using (true);
create policy "public reads communes" on public.communes for select to anon, authenticated using (true);
create policy "public reads shipping" on public.shipping_rates for select to anon, authenticated using (true);

create policy "staff reads orders" on public.orders
for select to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "staff updates orders" on public.orders
for update to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
) with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "staff reads order items" on public.order_items
for select to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "staff reads order events" on public.order_events
for select to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "staff writes order events" on public.order_events
for insert to authenticated with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid())
);
create policy "staff manages providers" on public.delivery_providers
for all to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "users read own profile" on public.admin_profiles
for select to authenticated using (id = auth.uid());
create policy "admins manage profiles" on public.admin_profiles
for all to authenticated using (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.admin_profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter publication supabase_realtime add table public.orders;
