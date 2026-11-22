import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingProduct from "@/components/ListingProduct";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("listings").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ? `${data.title} | Vinted` : "Annonce | Vinted" };
}

export default async function ListingPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: { user } }, { data: listing, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("listings").select("id,seller_id,title,description,price,status,category,brand,size,condition,created_at").eq("id", id).eq("status", "active").maybeSingle(),
  ]);
  if (error || !listing) notFound();

  const [{ data: images }, { data: profile }, { data: otherRows }, { data: saved }] = await Promise.all([
    supabase.from("product_images").select("image_url").eq("listing_id", id).order("created_at"),
    supabase.from("profiles").select("username,full_name,avatar_url").eq("id", listing.seller_id).maybeSingle(),
    supabase.from("listings").select("id,seller_id,title,description,price,status,category,brand,size,condition,created_at").eq("seller_id", listing.seller_id).eq("status", "active").neq("id", id).order("created_at", { ascending: false }),
    user ? supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const relatedRows = otherRows || [];
  const relatedIds = relatedRows.map(({ id: relatedId }) => relatedId);
  const [relatedImagesResult, relatedFavoritesResult, countsResult] = await Promise.all([
    relatedIds.length ? supabase.from("product_images").select("listing_id,image_url").in("listing_id", relatedIds) : Promise.resolve({ data: [] }),
    user && relatedIds.length ? supabase.from("favorites").select("listing_id").eq("user_id", user.id).in("listing_id", relatedIds) : Promise.resolve({ data: [] }),
    supabase.rpc("get_listing_favorite_counts", { listing_ids: [id, ...relatedIds] }),
  ]);

  const imagesById = new Map();
  for (const item of relatedImagesResult.data || []) {
    const current = imagesById.get(item.listing_id) || [];
    current.push({ image_url: item.image_url });
    imagesById.set(item.listing_id, current);
  }
  const relatedListings = relatedRows.map((row) => ({ ...row, product_images: imagesById.get(row.id) || [] }));
  const favoriteCounts = Object.fromEntries((countsResult.data || []).map(({ listing_id, favorite_count }) => [listing_id, Number(favorite_count)]));

  return <ListingProduct listing={{ ...listing, imageUrls: (images || []).map(({ image_url }) => image_url) }} seller={profile} sellerListings={relatedListings} favoriteIds={[...(saved?.listing_id ? [saved.listing_id] : []), ...(relatedFavoritesResult.data || []).map(({ listing_id }) => listing_id)]} favoriteCounts={favoriteCounts} currentUserId={user?.id || null} />;
}
