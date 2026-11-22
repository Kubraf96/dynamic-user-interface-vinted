import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FavoritesGrid from "@/components/FavoritesGrid";
import styles from "./page.module.css";

export const metadata = { title: "Favoritartikler | Vinted" };

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=%2Fprofile%2Ffavorites");
  const { data: favoriteRows, error: favoriteError } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
  const ids = (favoriteRows || []).map(({ listing_id }) => listing_id);
  let listings = [];
  let error = favoriteError;
  let counts = {};

  if (!error && ids.length) {
    const [{ data: listingRows, error: listingError }, { data: imageRows, error: imageError }, { data: countRows }] = await Promise.all([
      supabase.from("listings").select("id,seller_id,title,description,price,status,brand,size,condition,category,created_at").in("id", ids).order("created_at", { ascending: false }),
      supabase.from("product_images").select("listing_id,image_url").in("listing_id", ids),
      supabase.rpc("get_listing_favorite_counts", { listing_ids: ids }),
    ]);
    error = listingError || imageError;
    if (!error) {
      const imagesByListing = new Map();
      for (const image of imageRows || []) {
        const current = imagesByListing.get(image.listing_id) || [];
        current.push({ image_url: image.image_url });
        imagesByListing.set(image.listing_id, current);
      }
      listings = (listingRows || []).filter((listing) => listing.seller_id !== user.id).map((listing) => ({ ...listing, product_images: imagesByListing.get(listing.id) || [] }));
      counts = Object.fromEntries((countRows || []).map(({ listing_id, favorite_count }) => [listing_id, Number(favorite_count)]));
    }
  }

  return (
    <main className={styles.page}>
      {error ? <p className={styles.error} role="alert">Favoritter kunne ikke hentes. Kør favorites-rls.sql i Supabase, og kontrollér RLS-politikkerne.</p>
        : <FavoritesGrid initialListings={listings} favoriteCounts={counts} currentUserId={user.id} />}
    </main>
  );
}
