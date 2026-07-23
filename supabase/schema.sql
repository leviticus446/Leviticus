-- ============================================
-- LEVITICUS 11 — Database Schema
-- Jalankan ini di Supabase SQL Editor
-- ============================================

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

-- Konten yang bisa diedit admin: teks Cerita Kita, galeri foto, video showcase, dll.
-- Disimpan sebagai key-value, value-nya JSON supaya fleksibel (array foto, teks panjang, dll).
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

create index if not exists idx_chat_messages_session on chat_messages(session_id);
create index if not exists idx_products_active on products(is_active);

alter table products enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table telegram_admins enable row level security;
alter table site_content enable row level security;

create policy "public read active products" on products
  for select using (is_active = true);

create policy "public read site content" on site_content
  for select using (true);

create policy "no direct public access to sessions" on chat_sessions
  for all using (false);

create policy "no direct public access to messages" on chat_messages
  for all using (false);

create policy "no direct public access to admins" on telegram_admins
  for all using (false);

create policy "no direct write to site content" on site_content
  for insert with check (false);
create policy "no direct update to site content" on site_content
  for update using (false);

-- Isi nilai default supaya website gak kosong sebelum admin pertama kali edit
insert into site_content (key, value) values
  ('cerita_title', '"We Serve You Clean Food"'),
  ('cerita_text_1', '"Nama Leviticus 11 diambil dari pasal Alkitab tentang makanan yang bersih — filosofi itu yang kami bawa ke setiap piring: bahan segar, proses yang jujur, dan rasa Indonesia-Asia yang otentik."'),
  ('cerita_text_2', '"Di ruang hijau yang teduh, dikelilingi tanaman rambat dan cahaya alami, kami ingin setiap tamu merasa seperti makan di rumah kaca milik keluarga sendiri — nyaman, tenang, dan penuh perhatian pada detail."'),
  ('cerita_image', '"/images/story.jpg"'),
  ('gallery_images', '["/images/gallery-1.jpg","/images/gallery-2.jpg","/images/gallery-3.jpg","/images/gallery-4.jpg","/images/gallery-5.jpg","/images/gallery-6.jpg"]'),
  ('showcase_video_url', 'null'),
  ('showcase_backdrop_image', '"/images/hero.jpg"')
on conflict (key) do nothing;
