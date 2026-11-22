"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(listingId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, loginRequired: true };
  if (typeof listingId !== "string" || !/^[0-9a-f-]{36}$/i.test(listingId)) {
    return { ok: false, message: "Ugyldigt annonce-ID." };
  }

  const { data: listing } = await supabase.from("listings").select("id,seller_id,status").eq("id", listingId).maybeSingle();
  if (!listing) return { ok: false, message: "Annoncen kunne ikke findes." };

  const { data: existing, error: lookupError } = await supabase
    .from("favorites").select("listing_id").eq("user_id", user.id).eq("listing_id", listingId).maybeSingle();
  if (lookupError) return { ok: false, message: "Favoritter kunne ikke hentes. Kontrollér RLS-politikken for favorites." };

  if (listing.seller_id === user.id && !existing) {
    return { ok: false, message: "Du kan ikke gemme din egen annonce som favorit." };
  }

  let error;
  if (existing) {
    ({ error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId));
  } else {
    if (listing.status !== "active") return { ok: false, message: "Denne annonce kan ikke gemmes som favorit." };
    ({ error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId }));
  }
  if (error) return { ok: false, message: "Favoritten kunne ikke gemmes. Kontrollér RLS-politikken for favorites." };

  revalidatePath("/");
  revalidatePath("/profile/favorites");
  const { data: counts } = await supabase.rpc("get_listing_favorite_counts", { listing_ids: [listingId] });
  return { ok: true, isFavorite: !existing, count: counts?.[0]?.favorite_count ?? null };
}
