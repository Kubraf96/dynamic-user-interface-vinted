import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingProduct from "../../../components/ListingProduct.js";

export default async function ListingPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: { user } }, { data: listing, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("listings").select("id,seller_id,title,description,price,status,brand,size,condition,category").eq("id", id).eq("status", "active").maybeSingle(),
  ]);
  if (error || !listing) notFound();

  const [imagesResult, profileResult, otherResult, favoriteResult] = await Promise.all([
    supabase.from("product_images").select("image_url").eq("listing_id", id).order("created_at"),
    supabase.from("profiles").select("username,full_name,avatar_url").eq("id", listing.seller_id).maybeSingle(),
    supabase.from("listings").select("id,seller_id,title,description,price,status,brand,size,condition,category").eq("seller_id", listing.seller_id).eq("status", "active").neq("id", id).order("created_at", { ascending: false }),
    user ? supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const relatedRows = otherResult.data || [];
  const relatedIds = relatedRows.map(({ id: otherId }) => otherId);
  const [relatedImages, relatedFavorites, countResult] = await Promise.all([
    relatedIds.length ? supabase.from("product_images").select("listing_id,image_url").in("listing_id", relatedIds) : Promise.resolve({ data: [] }),
    user && relatedIds.length ? supabase.from("favorites").select("listing_id").eq("user_id", user.id).in("listing_id", relatedIds) : Promise.resolve({ data: [] }),
    supabase.rpc("get_listing_favorite_counts", { listing_ids: [id, ...relatedIds] }),
  ]);
  const imageMap = new Map();
  for (const image of relatedImages.data || []) {
    const current = imageMap.get(image.listing_id) || [];
    current.push({ image_url: image.image_url });
    imageMap.set(image.listing_id, current);
  }
  const sellerListings = relatedRows.map((row) => ({ ...row, product_images: imageMap.get(row.id) || [] }));
  const favoriteIds = [...(favoriteResult.data?.listing_id ? [favoriteResult.data.listing_id] : []), ...(relatedFavorites.data || []).map(({ listing_id }) => listing_id)];
  const favoriteCounts = Object.fromEntries((countResult.data || []).map(({ listing_id, favorite_count }) => [listing_id, Number(favorite_count)]));

  return <ListingProduct
    listing={{ ...listing, imageUrls: (imagesResult.data || []).map(({ image_url }) => image_url) }}
    seller={profileResult.data}
    sellerListings={sellerListings}
    favoriteIds={favoriteIds}
    favoriteCounts={favoriteCounts}
    currentUserId={user?.id || null}
  />;
}
