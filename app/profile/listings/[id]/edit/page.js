import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateListing } from "@/app/actions/listings";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/listing-access";
import styles from "./page.module.css";

const categories = ["Kvinder", "Mænd", "Designerartikler", "Børn", "Bolig", "Elektronik", "Bøger og medier", "Hobby og samleobjekter", "Sport"];

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=%2Fprofile%2Flistings");
  let query = supabase.from("listings").select("id,seller_id,title,description,price,status,category,brand,size,condition").eq("id", id);
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data: listing, error } = await query.maybeSingle();
  if (error || !listing) notFound();
  const { data: images } = await supabase.from("product_images").select("image_url").eq("listing_id", id).order("created_at");

  return (
    <main className={styles.page}>
      <header className={styles.header}><Link href={`/profile/listings/${id}`} aria-label="Luk">×</Link><h1>Rediger</h1><span /></header>
      <form action={updateListing} className={styles.form}>
        <input type="hidden" name="id" value={listing.id} />
        <h2>Billeder</h2>
        <div className={styles.images}>{(images || []).map((image) => <img key={image.image_url} src={image.image_url} alt="Annoncefoto" />)}<span className={styles.addImage}>＋</span></div>
        <h2>Om din artikel</h2>
        <label htmlFor="title">Titel</label><input id="title" name="title" defaultValue={listing.title} maxLength={120} required />
        <label htmlFor="description">Beskrivelse</label><textarea id="description" name="description" defaultValue={listing.description} rows={5} maxLength={3000} required />
        <h2>Oplysninger om artikel</h2>
        <label htmlFor="category">Kategori</label><select id="category" name="category" defaultValue={listing.category || ""} required>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <label htmlFor="brand">Varemærke</label><input id="brand" name="brand" defaultValue={listing.brand || ""} />
        <label htmlFor="size">Størrelse</label><input id="size" name="size" defaultValue={listing.size || ""} />
        <label htmlFor="condition">Artiklens stand</label><select id="condition" name="condition" defaultValue={listing.condition || ""}><option value="">Vælg stand</option>{["Ny med mærke", "Ny uden mærke", "Meget god", "God", "Acceptabel"].map((item) => <option key={item}>{item}</option>)}</select>
        <h2>Prissætning</h2>
        <label htmlFor="price">Pris</label><input id="price" name="price" type="number" min="0.01" step="0.01" defaultValue={listing.price} required />
        <input type="hidden" name="status" value={listing.status} />
        <button type="submit">Gem</button>
      </form>
    </main>
  );
}
