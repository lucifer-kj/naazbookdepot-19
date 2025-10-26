-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create tables
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  full_name text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references public.categories(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  price decimal(10,2) not null,
  category_id uuid references public.categories(id),
  image_url text,
  stock_quantity integer not null default 0,
  is_featured boolean default false,
  is_published boolean default true,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  status text default 'pending',
  total_amount decimal(10,2) not null,
  shipping_address jsonb not null,
  payment_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  quantity integer not null,
  price_at_time decimal(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id),
  user_id uuid references public.users(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- User policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

-- Categories policies
create policy "Categories are viewable by everyone"
  on public.categories for select
  to authenticated, anon
  using (true);

-- Products policies
create policy "Products are viewable by everyone"
  on public.products for select
  to authenticated, anon
  using (is_published = true);

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Review policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  to authenticated, anon
  using (true);

create policy "Users can create reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);