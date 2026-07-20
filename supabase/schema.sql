create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric,
  category text,
  image_urls text[] default '{}',
  video_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists telegram_admins (
  id uuid primary key default gen_random_uuid(),
  telegram_chat_id text unique not null,
  name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  buyer_name text,
  buyer_contact text,
  assigned_admin_chat_id text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  sender_type text not null,
  message text,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists idx_chat_messages_session on chat_messages(session_id);
create index if not exists idx_products_active on products(is_active);

alter table products enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table telegram_admins enable row level security;

create policy "public read active products" on products
  for select using (is_active = true);

create policy "no direct public access to sessions" on chat_sessions
  for all using (false);

create policy "no direct public access to messages" on chat_messages
  for all using (false);

create policy "no direct public access to admins" on telegram_admins
  for all using (false);
