-- Destiny Linktree schema (already applied to the destiny-linktree Supabase project on 2026-07-22)
-- Kept here for reference and disaster recovery. Safe to re-run (idempotent creates).

create table if not exists campuses (key text primary key, name text not null);
insert into campuses (key, name) values ('columbia', 'Columbia'), ('lewisburg', 'Lewisburg'), ('shelbyville', 'Shelbyville') on conflict (key) do nothing;

create table if not exists profiles (campus text primary key references campuses(key), avatar_url text, logo_url text, tagline text);

create table if not exists links (id uuid primary key default gen_random_uuid(), campus text references campuses(key) not null, title text not null, url text not null, active boolean not null default true, position integer not null default 0, section text not null default 'General', icon text, created_at timestamptz default now());

create table if not exists sermons (id uuid primary key default gen_random_uuid(), campus text references campuses(key) not null, title text not null, sermon_date date, file_path text not null, created_at timestamptz default now());

alter table campuses enable row level security;
alter table profiles enable row level security;
alter table links enable row level security;
alter table sermons enable row level security;

create policy "public read campuses" on campuses for select using (true);
create policy "public read profiles" on profiles for select using (true);
create policy "staff manage profiles" on profiles for insert with check (auth.role() = 'authenticated');
create policy "staff update profiles" on profiles for update using (auth.role() = 'authenticated');
create policy "public read active links" on links for select using (active = true);
create policy "staff read all links" on links for select using (auth.role() = 'authenticated');
create policy "staff manage links" on links for insert with check (auth.role() = 'authenticated');
create policy "staff update links" on links for update using (auth.role() = 'authenticated');
create policy "staff delete links" on links for delete using (auth.role() = 'authenticated');
create policy "public read sermons" on sermons for select using (true);
create policy "staff manage sermons" on sermons for insert with check (auth.role() = 'authenticated');
create policy "staff delete sermons" on sermons for delete using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('sermons', 'sermons', true) on conflict (id) do nothing;
create policy "public read sermon files" on storage.objects for select using (bucket_id = 'sermons');
create policy "staff upload sermon files" on storage.objects for insert with check (bucket_id = 'sermons' and auth.role() = 'authenticated');
create policy "staff delete sermon files" on storage.objects for delete using (bucket_id = 'sermons' and auth.role() = 'authenticated');

insert into storage.buckets (id, name, public) values ('branding', 'branding', true) on conflict (id) do nothing;
create policy "public read branding files" on storage.objects for select using (bucket_id = 'branding');
create policy "staff upload branding files" on storage.objects for insert with check (bucket_id = 'branding' and auth.role() = 'authenticated');
create policy "staff update branding files" on storage.objects for update using (bucket_id = 'branding' and auth.role() = 'authenticated');
create policy "staff delete branding files" on storage.objects for delete using (bucket_id = 'branding' and auth.role() = 'authenticated');
