import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/listing-access";
import ListingDetail from "@/components/ListingDetail";

export const metadata = { title: "Annonce | Vinted" };

export default async function MyListingDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=%2Fprofile%2Flistings");
  let query = supabase.from("listings").select("id,seller_id,title,description,price,status,category,brand,size,condition").eq("id", id);
  if (!isAdmin(user.id)) query = query.eq("seller_id", user.id);
  const { data: listing, error } = await query.maybeSingle();
  if (error || !listing) notFound();
  const { data: images } = await supabase.from("product_images").select("image_url").eq("listing_id", id).order("created_at");
  return <ListingDetail listing={{ ...listing, imageUrls: (images || []).map(({ image_url }) => image_url) }} />;
}
