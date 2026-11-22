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
  let imagePaths = [];
  try {
    const parsedPaths = JSON.parse(readText(formData, "imagePaths", 1600));
    if (Array.isArray(parsedPaths)) imagePaths = parsedPaths.filter((path) => typeof path === "string").slice(0, 5);
  } catch {}

  if (!title || !description || !category || !Number.isFinite(price) || price <= 0) {
    redirect("/sell?error=fields");
  }
  const userImagePath = new RegExp(`^${user.id}/[A-Za-z0-9-]+\\.(jpg|jpeg|png|webp|avif)$`, "i");
  if (!imagePaths.length || imagePaths.length > 5 || imagePaths.some((path) => !userImagePath.test(path))) {
    redirect("/sell?error=image");
  }

  const { data: profile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileLookupError) {
    redirect(`/sell?error=profile&detail=${encodeURIComponent(profileLookupError.message)}`);
  }
  if (!profile) {
    const { error: profileInsertError } = await supabase.from("profiles").insert({ id: user.id });
    if (profileInsertError) {
      redirect(`/sell?error=profile&detail=${encodeURIComponent(profileInsertError.message)}`);
    }
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
    await supabase.storage.from(BUCKET).remove(imagePaths);
    console.error("Listing creation failed:", listingError.message);
    redirect(`/sell?error=save&detail=${encodeURIComponent(listingError.message)}`);
  }

  const imageRecords = imagePaths.map((imagePath) => ({
    listing_id: listing.id,
    image_url: supabase.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl,
  }));
  const { error: imageRowError } = await supabase.from("product_images").insert(imageRecords);

  if (imageRowError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    await supabase.storage.from(BUCKET).remove(imagePaths);
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
  const category = readText(formData, "category", 80);
  const brand = readText(formData, "brand", 100);
  const size = readText(formData, "size", 40);
  const condition = readText(formData, "condition", 60);
  const price = Number(readText(formData, "price", 20).replace(",", "."));
  const status = readText(formData, "status", 20);

  if (!id || !title || !description || !category || !Number.isFinite(price) || price <= 0 || !["active", "sold", "reserved", "hidden"].includes(status)) {
    redirect("/profile/listings?error=fields");
  }

  let query = supabase.from("listings").update({ title, description, price, status, category, brand: brand || null, size: size || null, condition: condition || null }).eq("id", id);
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

export async function updateListingStatus(id, status) {
  const supabase = await createClient();
  const user = await getUserOrRedirect(supabase);
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || !["active", "sold", "reserved", "hidden"].includes(status)) {
    return { ok: false, message: "Ugyldig ændring." };
  }
  let query = supabase.from("listings").update({ status }).eq("id", id);
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Annoncens status kunne ikke ændres." };
  revalidatePath("/");
  revalidatePath("/profile/listings");
  revalidatePath(`/profile/listings/${id}`);
  return { ok: true };
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
