-- Run once in Supabase SQL Editor to enable private saved items and public counts.
begin;

alter table public.favorites enable row level security;

create or replace function public.user_has_favorited_listing(listing_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.favorites f
    where f.listing_id = listing_uuid and f.user_id = auth.uid()
  );
$$;

revoke all on function public.user_has_favorited_listing(uuid) from public;
grant execute on function public.user_has_favorited_listing(uuid) to anon, authenticated;

drop policy if exists "Users read their own favorites" on public.favorites;
create policy "Users read their own favorites"
on public.favorites for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users save their own favorites" on public.favorites;
create policy "Users save their own favorites"
on public.favorites for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.listings l
    where l.id = favorites.listing_id
      and l.seller_id <> (select auth.uid())
      and l.status = 'active'
  )
);

drop policy if exists "Users remove their own favorites" on public.favorites;
create policy "Users remove their own favorites"
on public.favorites for delete to authenticated
using (user_id = (select auth.uid()));

-- Saved listings stay visible to their saver even after they are sold or hidden.
drop policy if exists "Anyone can read active listings" on public.listings;
create policy "Anyone can read active listings"
on public.listings for select to anon, authenticated
using (
  status = 'active'
  or seller_id = (select auth.uid())
  or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
  or public.user_has_favorited_listing(listings.id)
);

drop policy if exists "Listing images follow listing visibility" on public.product_images;
create policy "Listing images follow listing visibility"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = product_images.listing_id
      and (
        l.status = 'active'
        or l.seller_id = (select auth.uid())
        or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
        or public.user_has_favorited_listing(l.id)
      )
  )
);

create or replace function public.get_listing_favorite_counts(listing_ids uuid[])
returns table (listing_id uuid, favorite_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select f.listing_id, count(*)::bigint
  from public.favorites f
  join public.listings l on l.id = f.listing_id
  where f.listing_id = any(listing_ids)
    and (
      l.status = 'active'
      or l.seller_id = auth.uid()
      or auth.uid() = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
      or exists (
        select 1 from public.favorites own_favorite
        where own_favorite.listing_id = f.listing_id and own_favorite.user_id = auth.uid()
      )
    )
  group by f.listing_id;
$$;

revoke all on function public.get_listing_favorite_counts(uuid[]) from public;
grant execute on function public.get_listing_favorite_counts(uuid[]) to anon, authenticated;

commit;
