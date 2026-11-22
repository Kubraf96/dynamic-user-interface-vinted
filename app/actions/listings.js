"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/listing-access";

const BUCKET = "listing-images";

async function getUserOrRedirect(supabase) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return user;
}

function readText(formData, name, maxLength) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function createListing(formData) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const title = readText(formData, "title", 120);
  const description = readText(formData, "description", 3000);
  const brand = readText(formData, "brand", 100);
  const size = readText(formData, "size", 40);
  const condition = readText(formData, "condition", 60);
  const category = readText(formData, "category", 80);
  const price = Number(readText(formData, "price", 20).replace(",", "."));
  const imagePath = readText(formData, "imagePath", 240);

  if (!title || !description || !category || !Number.isFinite(price) || price <= 0) {
    redirect("/sell?error=fields");
  }
  if (!new RegExp(`^${user.id}/[A-Za-z0-9-]+\\.(jpg|jpeg|png|webp|avif)$`, "i").test(imagePath)) {
    redirect("/sell?error=image");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      brand: brand || null,
      size: size || null,
      condition: condition || null,
      category,
      status: "active",
    })
    .select("id")
    .single();

  if (listingError) {
    await supabase.storage.from(BUCKET).remove([imagePath]);
    console.error("Listing creation failed:", listingError.message);
    redirect(`/sell?error=save&detail=${encodeURIComponent(listingError.message)}`);
  }

  const { data: publicImage } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
  const { error: imageRowError } = await supabase.from("product_images").insert({
    listing_id: listing.id,
    image_url: publicImage.publicUrl,
  });

  if (imageRowError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    await supabase.storage.from(BUCKET).remove([imagePath]);
    console.error("Listing image record failed:", imageRowError.message);
    redirect(`/sell?error=save&detail=${encodeURIComponent(imageRowError.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/profile/listings");
  redirect("/");
}

export async function updateListing(formData) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  const id = readText(formData, "id", 80);
  const title = readText(formData, "title", 120);
  const description = readText(formData, "description", 3000);
  const price = Number(readText(formData, "price", 20).replace(",", "."));
  const status = readText(formData, "status", 20);

  if (!id || !title || !description || !Number.isFinite(price) || price <= 0 || !["active", "sold"].includes(status)) {
    redirect("/profile/listings?error=fields");
  }

  let query = supabase.from("listings").update({ title, description, price, status }).eq("id", id);
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { error } = await query;
  if (error) {
    console.error("Listing update failed:", error.message);
    redirect("/profile/listings?error=save");
  }
  revalidatePath("/");
  revalidatePath("/profile/listings");
  redirect("/profile/listings?saved=1");
}

export async function deleteListing(id) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);

  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return { ok: false, message: "Ugyldigt annonce-ID." };
  }

  let imageQuery = supabase.from("product_images").select("image_url").eq("listing_id", id);
  if (!isAdmin(user.id)) {
    const { data: ownedListing } = await supabase.from("listings").select("id").eq("id", id).eq("seller_id", user.id).maybeSingle();
    if (!ownedListing) return { ok: false, message: "Du kan kun slette dine egne annoncer." };
  }
  const { data: images } = await imageQuery;
  const publicPrefix = "/storage/v1/object/public/listing-images/";
  const paths = (images || []).map(({ image_url }) => {
    const index = image_url.indexOf(publicPrefix);
    return index >= 0 ? decodeURIComponent(image_url.slice(index + publicPrefix.length)) : null;
  }).filter((path) => path && (isAdmin(user.id) || path.startsWith(`${user.id}/`)));

  const { error: imagesError } = await supabase.from("product_images").delete().eq("listing_id", id);
  if (imagesError) {
    console.error("Listing image cleanup failed:", imagesError.message);
    return { ok: false, message: "Billederne kunne ikke fjernes. Annoncen er ikke slettet." };
  }
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

  let query = supabase.from("listings").delete().eq("id", id).select("id").maybeSingle();
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data: deleted, error } = await query;
  if (error) {
    console.error("Listing deletion failed:", error.message);
    return { ok: false, message: "Annoncen kunne ikke slettes. Kontrollér RLS-politikken." };
  }
  if (!deleted) return { ok: false, message: "Annoncen blev ikke fundet eller kunne ikke slettes." };
  revalidatePath("/");
  revalidatePath("/profile/listings");
  return { ok: true };
}
