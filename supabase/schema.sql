create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('superadmin', 'owner')),
  created_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  logo_url text,
  address text,
  currency text not null default 'USD',
  tax_percent numeric not null default 0,
  total_discount_percent numeric not null default 0,
  flat_discount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(restaurant_id, name)
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null default 'Mains',
  image_url text,
  discount_percent numeric not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number text not null,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'preparing', 'delivered', 'completed', 'cancelled')),
  special_notes text,
  receipt_token text,
  customer_email text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  quantity integer not null check (quantity > 0),
  price_at_order numeric not null check (price_at_order >= 0),
  item_name text not null
);

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create or replace function public.is_superadmin()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin');
end;
$$;

grant execute on function public.is_superadmin() to authenticated, anon;

create policy "Superadmin can manage all profiles"
  on public.profiles for all
  using (public.is_superadmin())
  with check (true);

create policy "Anyone can read restaurant profile for QR menus"
  on public.restaurants for select
  using (true);

create policy "Owners and superadmin can manage restaurants"
  on public.restaurants for all
  using (
    owner_id = auth.uid()
    or public.is_superadmin()
  )
  with check (
    owner_id = auth.uid()
    or public.is_superadmin()
  );

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Owners and superadmin can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  );

create policy "Anyone can read available menus"
  on public.menu_items for select
  using (is_available = true);

create policy "Owners and superadmin can manage menu items"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  );

create policy "Customers can create orders"
  on public.orders for insert
  with check (true);

create policy "Owners and superadmin can manage orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  );

create policy "Customers can create order items"
  on public.order_items for insert
  with check (true);

create policy "Owners and superadmin can view order items"
  on public.order_items for select
  using (
    exists (
      select 1
      from public.orders o
      join public.restaurants r on r.id = o.restaurant_id
      where o.id = order_items.order_id and r.owner_id = auth.uid()
    )
    or public.is_superadmin()
  );

create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.profiles;
  superadmin_emails text := current_setting('app.superadmin_emails', true);
begin
  select * into profile from public.profiles where id = auth.uid();
  if not found then
    insert into public.profiles (id, role)
    values (
      auth.uid(),
      case when superadmin_emails is not null and auth.email() = any(string_to_array(superadmin_emails, ','))
        then 'superadmin'
        else 'owner'
      end
    )
    returning * into profile;
  end if;
  return profile;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;

create or replace function public.set_order_receipt_email(
  p_order_id uuid,
  p_receipt_token text,
  p_customer_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set customer_email = p_customer_email
  where id = p_order_id
    and receipt_token = p_receipt_token;
end;
$$;

grant execute on function public.set_order_receipt_email(uuid, text, text) to anon, authenticated;

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
