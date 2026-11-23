import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileMenuItem from "@/components/ProfileMenuItem";
import styles from "./page.module.css";

export const metadata = {
  title: "Profile",
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
  const { data: { user: authUser }, error: authUserError } = await supabase.auth.getUser();
  if (authUserError || !authUser) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", authUser.id)
    .maybeSingle();
  if (profileError) {
    console.error("Profile card could not read profiles.username:", profileError.message);
  }
  const displayName = profile?.username || authUser.user_metadata?.username || authUser.user_metadata?.name || "Medlem";

  return (
    <main className={styles.page}>
      <section className={styles.profileCard}>
        <div className={styles.avatar} aria-hidden="true" />
        <div>
          <h1>{displayName}</h1>
          <p>Se mine opslag</p>
        </div>
      </section>

      <section className={styles.badgeCard}>
        <div className={styles.badgeTitle}>
          <span className={styles.badgeIcon} aria-hidden="true">✓</span>
          <strong>Opnåede badges</strong>
          <span className={styles.badgeCount}>0 af 2</span>
        </div>
        <div className={styles.badgeProgress} aria-label="0 af 2 badges opnået">
          <span />
        </div>
      </section>

      <nav className={styles.menu} aria-label="Profilmenu">
        <ProfileMenuItem
          label="Mine annoncer"
          icon="/profile-icons/order-icon.svg"
          href="/profile/listings"
        />
        <ProfileMenuItem
          label="Favoritartikler"
          icon="/profile-icons/main-icon.svg"
          href="/profile/favorites"
          rightText=""
        />
        <ProfileMenuItem
          label="Henvis og tjen 115 kr."
          icon="/profile-icons/campaign-icon.svg"
          href="/profile/referrals"
        />
        <ProfileMenuItem
          label="Saldo"
          icon="/profile-icons/saldo-icon.svg"
          href="/profile/balance"
          rightText="317,10 kr."
        />
        <ProfileMenuItem
          label="Mine ordrer"
          icon="/profile-icons/order-icon.svg"
          href="/profile/orders"
        />
        <ProfileMenuItem
          label="Året der gik"
          icon="/profile-icons/year-icon.svg"
          href="/profile/year"
        />
        <ProfileMenuItem
          label="Kampagneværktøj"
          icon="/profile-icons/campaign-icon.svg"
          href="/profile/campaign"
        />
        <ProfileMenuItem
          label="Brugertilpasning"
          icon="/profile-icons/user-filter-icon.svg"
          href="/profile/settings"
        />
        <ProfileMenuItem
          label="Bundtrabat"
          icon="/profile-icons/discount-icon.svg"
          href="/profile/discount"
          rightText="Rabat"
        />
        <ProfileMenuItem
          label="Ferietilstand"
          icon="/profile-icons/vacation-icon.svg"
          href="/profile/vacation"
        />
      </nav>

      <form action={signOut} className={styles.signOutForm}>
        <button type="submit">Log ud</button>
      </form>
    </main>
  );
}
