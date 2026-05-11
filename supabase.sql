create table if not exists public.packing_lists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  categories jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.packing_lists enable row level security;

create policy "Users can read their own packing list"
on public.packing_lists
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own packing list"
on public.packing_lists
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own packing list"
on public.packing_lists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
