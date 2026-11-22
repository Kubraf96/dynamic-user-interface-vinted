import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "./ListingForm";
import styles from "./page.module.css";

export const metadata = { title: "Opret annonce | Vinted" };

const messages = {
  fields: "Udfyld titel, beskrivelse, kategori og en pris over 0 kr.",
  image: "Vælg et JPG-, PNG-, WebP- eller AVIF-billede på højst 8 MB.",
  save: "Annoncen kunne ikke gemmes. Kontrollér RLS-politikkerne for listings og product_images.",
};

export default async function SellPage({ searchParams }) {
  const { error, detail } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnTo=%2Fsell");

  return (
    <main className={styles.page}>
      <h1>Opret en annonce</h1>
      <p className={styles.intro}>Annoncen bliver knyttet til din konto og vist på forsiden.</p>
      {error && <p className={styles.error} role="alert">{messages[error] || "Noget gik galt. Prøv igen."}</p>}
      {detail && process.env.NODE_ENV === "development" && <pre className={styles.debug}>{detail}</pre>}
      <ListingForm />
      <Link className={styles.back} href="/">Tilbage til forsiden</Link>
    </main>
  );
}
