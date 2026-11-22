-- Run this in the Supabase SQL Editor for the Vinted project.
-- The admin UUID below is Maria's Auth user ID from the supplied screenshot.
-- RLS is intentionally enabled; the app's publishable key must never bypass it.

begin;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.product_images enable row level security;

-- Profiles: public seller names are visible; each user can manage only their own row.
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles for select to anon, authenticated
using (true);

drop policy if exists "Users create their own profile" on public.profiles;
create policy "Users create their own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Ensure Maria's existing Auth user has a profile row.
insert into public.profiles (id)
values ('ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid)
on conflict (id) do nothing;

-- Listings: everyone can see active ads. Sellers see/manage their own rows;
-- Maria can manage every row. All inserts must be owned by the signed-in user.
drop policy if exists "Anyone can read active listings" on public.listings;
create policy "Anyone can read active listings"
on public.listings for select to anon, authenticated
using (
  status = 'active'
  or seller_id = (select auth.uid())
  or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
);

drop policy if exists "Users create their own listings" on public.listings;
create policy "Users create their own listings"
on public.listings for insert to authenticated
with check (seller_id = (select auth.uid()));

drop policy if exists "Sellers and admin update listings" on public.listings;
create policy "Sellers and admin update listings"
on public.listings for update to authenticated
using (
  seller_id = (select auth.uid())
  or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
)
with check (
  seller_id = (select auth.uid())
  or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
);

drop policy if exists "Sellers and admin delete listings" on public.listings;
create policy "Sellers and admin delete listings"
on public.listings for delete to authenticated
using (
  seller_id = (select auth.uid())
  or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
);

-- Images follow the visibility and ownership of their parent listing.
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
      )
  )
);

drop policy if exists "Sellers and admin add listing images" on public.product_images;
create policy "Sellers and admin add listing images"
on public.product_images for insert to authenticated
with check (
  exists (
    select 1 from public.listings l
    where l.id = product_images.listing_id
      and (
        l.seller_id = (select auth.uid())
        or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
      )
  )
);

drop policy if exists "Sellers and admin delete listing images" on public.product_images;
create policy "Sellers and admin delete listing images"
on public.product_images for delete to authenticated
using (
  exists (
    select 1 from public.listings l
    where l.id = product_images.listing_id
      and (
        l.seller_id = (select auth.uid())
        or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
      )
  )
);

-- Public read for product photos; uploads/deletes are limited to the owner's folder.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Listing images are publicly readable" on storage.objects;
create policy "Listing images are publicly readable"
on storage.objects for select to anon, authenticated
using (bucket_id = 'listing-images');

drop policy if exists "Users upload listing images to own folder" on storage.objects;
create policy "Users upload listing images to own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users and admin delete listing images from own folder" on storage.objects;
create policy "Users and admin delete listing images from own folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'listing-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select auth.uid()) = 'ba74304a-d99e-4055-b1f2-bf55a9a94270'::uuid
  )
);

commit;
