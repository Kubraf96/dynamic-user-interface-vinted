-- Run in the Vinted project's Supabase SQL Editor before using Sælg.
-- Creates the public image bucket and the listing/image policies used by the app.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view listing images" on storage.objects;
create policy "Public can view listing images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'listing-images');

drop policy if exists "Members upload their own listing images" on storage.objects;
create policy "Members upload their own listing images"
on storage.objects for insert to authenticated
with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Members delete their own listing images" on storage.objects;
create policy "Members delete their own listing images"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter table public.listings enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Anyone can view active listings" on public.listings;
create policy "Anyone can view active listings"
on public.listings for select to anon, authenticated
using (status = 'active');

drop policy if exists "Sellers can view their listings" on public.listings;
create policy "Sellers can view their listings"
on public.listings for select to authenticated
using (seller_id = (select auth.uid()));

drop policy if exists "Maria can view all listings" on public.listings;
create policy "Maria can view all listings"
on public.listings for select to authenticated
using ((select auth.jwt() ->> 'email') = 'mariaskov12@gmail.com');

drop policy if exists "Members create their own listings" on public.listings;
create policy "Members create their own listings"
on public.listings for insert to authenticated
with check (seller_id = (select auth.uid()));

drop policy if exists "Sellers update their own listings" on public.listings;
create policy "Sellers update their own listings"
on public.listings for update to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));

drop policy if exists "Sellers delete their own listings" on public.listings;
create policy "Sellers delete their own listings"
on public.listings for delete to authenticated
using (seller_id = (select auth.uid()));

drop policy if exists "Maria can manage all listings" on public.listings;
create policy "Maria can manage all listings"
on public.listings for all to authenticated
using ((select auth.jwt() ->> 'email') = 'mariaskov12@gmail.com')
with check ((select auth.jwt() ->> 'email') = 'mariaskov12@gmail.com');

drop policy if exists "Anyone can view images for visible listings" on public.product_images;
create policy "Anyone can view images for visible listings"
on public.product_images for select to anon, authenticated
using (exists (
  select 1 from public.listings l
  where l.id = listing_id
    and (l.status = 'active' or l.seller_id = (select auth.uid())
      or (select auth.jwt() ->> 'email') = 'mariaskov12@gmail.com')
));

drop policy if exists "Sellers add images to their listings" on public.product_images;
create policy "Sellers add images to their listings"
on public.product_images for insert to authenticated
with check (exists (
  select 1 from public.listings l
  where l.id = listing_id and l.seller_id = (select auth.uid())
));

grant select on public.listings, public.product_images to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant insert on public.product_images to authenticated;
