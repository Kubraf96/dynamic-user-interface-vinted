import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export const metadata = {
  title: "Profil",
};

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}

export default async function ProfilePage() {
  // A Server Component: the check runs on the server, before any HTML is sent
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.sub)
    .maybeSingle();
  const username = profile?.username || user.user_metadata?.username || "Brugernavn mangler";

  return (
    <main className={styles.page}>
      <section className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">{username.charAt(0).toUpperCase()}</div>
        <h1>@{username}</h1>
        <p>{user.email}</p>
      </section>
      <nav className={styles.menu} aria-label="Din profil">
        <a href="/profile/listings"><span>Mine annoncer</span><span aria-hidden="true">›</span></a>
        <a href="/profile/favorites"><span>Favoritartikler</span><span aria-hidden="true">›</span></a>
      </nav>
      <form action={signOut} className={styles.form}>
        <button type="submit">Log ud</button>
      </form>
    </main>
  );
}
