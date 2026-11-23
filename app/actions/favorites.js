"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(listingId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, loginRequired: true };
  if (typeof listingId !== "string" || !/^[0-9a-f-]{36}$/i.test(listingId)) return { ok: false, message: "Ugyldigt annonce-ID." };

  const { data: listing, error: listingError } = await supabase.from("listings").select("seller_id,status").eq("id", listingId).maybeSingle();
  if (listingError || !listing) return { ok: false, message: "Annoncen kunne ikke findes. Kontrollér annonces RLS." };
  if (listing.seller_id === user.id) return { ok: false, message: "Du kan ikke gemme din egen annonce som favorit." };

  const { data: existing, error: lookupError } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle();
  if (lookupError) return { ok: false, message: "Favoritter kunne ikke hentes. Kør favorites-rls.sql i Supabase." };
  let error;
  if (existing) ({ error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId));
  else {
    if (listing.status !== "active") return { ok: false, message: "Kun aktive annoncer kan gemmes." };
    ({ error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId }));
  }
  if (error) {
    console.error("Favorite update failed:", error.code, error.message);
    return { ok: false, message: `Favoritten kunne ikke gemmes (${error.code || "databasefejl"}). Kontrollér favorites RLS.` };
  }

  revalidatePath("/");
  revalidatePath("/profile/favorites");
  const { data: counts } = await supabase.rpc("get_listing_favorite_counts", { listing_ids: [listingId] });
  return { ok: true, isFavorite: !existing, count: counts?.[0]?.favorite_count ?? null };
}
