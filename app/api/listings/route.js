import { createClient } from "@/lib/supabase/server";

const bucket = "listing-images";
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Log ind for at oprette en annonce." }, { status: 401 });

  let form;
  try { form = await request.formData(); }
  catch { return Response.json({ error: "Formularen kunne ikke læses." }, { status: 400 }); }

  const file = form.get("image");
  const title = String(form.get("title") || "").trim();
  const description = String(form.get("description") || "").trim();
  const category = String(form.get("category") || "").trim();
  const size = String(form.get("size") || "").trim();
  const condition = String(form.get("condition") || "").trim();
  const brand = String(form.get("brand") || "").trim();
  const price = Number(form.get("price"));

  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > maxBytes) {
    return Response.json({ error: "Vælg et JPG-, PNG-, WebP- eller AVIF-billede på højst 5 MB." }, { status: 400 });
  }
  if (!title || !description || !category || !condition || !Number.isFinite(price) || price <= 0) {
    return Response.json({ error: "Udfyld titel, beskrivelse, kategori, stand og en gyldig pris." }, { status: 400 });
  }

  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" })[file.type];
  const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    console.error("Listing image upload failed:", uploadError.code, uploadError.message);
    return Response.json({ error: "Billedet kunne ikke uploades. Kontrollér, at listing-images bucket og dens Storage-politikker er oprettet." }, { status: 500 });
  }

  const { data: listing, error: listingError } = await supabase.from("listings").insert({
    seller_id: user.id, title, description, category, size: size || null, condition,
    brand: brand || null, price, status: "active",
  }).select("id").single();
  if (listingError) {
    await supabase.storage.from(bucket).remove([objectPath]);
    console.error("Listing insert failed:", listingError.code, listingError.message);
    return Response.json({ error: `Annoncen kunne ikke gemmes (${listingError.code || "databasefejl"}). Kontrollér listings RLS-politikkerne.` }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const { error: imageRowError } = await supabase.from("product_images").insert({ listing_id: listing.id, image_url: publicUrl.publicUrl });
  if (imageRowError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    await supabase.storage.from(bucket).remove([objectPath]);
    console.error("Listing image row insert failed:", imageRowError.code, imageRowError.message);
    return Response.json({ error: `Annoncebilledet kunne ikke knyttes til annoncen (${imageRowError.code || "databasefejl"}). Kontrollér product_images RLS.` }, { status: 500 });
  }

  return Response.json({ id: listing.id }, { status: 201 });
}
