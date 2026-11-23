-- Run this in the Supabase SQL Editor for the same project as the app.
-- The favorites table must already have user_id, listing_id, and created_at.

alter table public.favorites enable row level security;

drop policy if exists "Users read their own favorites" on public.favorites;
create policy "Users read their own favorites"
on public.favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users add their own favorites" on public.favorites;
create policy "Users add their own favorites"
on public.favorites for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.listings l
    where l.id = listing_id
      and l.status = 'active'
      and l.seller_id <> (select auth.uid())
  )
);

drop policy if exists "Users remove their own favorites" on public.favorites;
create policy "Users remove their own favorites"
on public.favorites for delete to authenticated
using (user_id = (select auth.uid()));

grant select, insert, delete on public.favorites to authenticated;

create or replace function public.get_listing_favorite_counts(listing_ids uuid[])
returns table (listing_id uuid, favorite_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select requested.id, count(f.listing_id)::bigint
  from unnest(listing_ids) as requested(id)
  left join public.favorites f on f.listing_id = requested.id
  group by requested.id;
$$;

revoke all on function public.get_listing_favorite_counts(uuid[]) from public;
grant execute on function public.get_listing_favorite_counts(uuid[]) to anon, authenticated;
