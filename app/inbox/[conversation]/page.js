import Link from "next/link";
import styles from "./page.module.css";

export function generateMetadata({ params }) {
  return { title: "Samtale" };
}

export default async function ConversationPage({ params }) {
  const { conversation } = await params;
  const name = conversation.charAt(0).toUpperCase() + conversation.slice(1).replace(/-.*/, "");

  return (
    <main className={styles.page}>
      <header className={styles.chatHeader}>
        <Link href="/inbox" aria-label="Tilbage til indbakke">‹</Link>
        <div>
          <strong>{name}</strong>
          <small>Aktiv nu</small>
        </div>
      </header>

      <section className={styles.messages} aria-label="Samtale">
        <div className={styles.itemPreview}>
          <span className={styles.itemImage} aria-hidden="true" />
          <div>
            <strong>Forretning</strong>
            <small>39 · Meget god stand</small>
          </div>
          <strong>250 kr.</strong>
        </div>

        <time className={styles.date}>I dag</time>
        <div className={`${styles.message} ${styles.received}`}>
          Hej! Er varen stadig til salg?
        </div>
        <div className={`${styles.message} ${styles.sent}`}>
          Ja, den er stadig til salg.
        </div>
        <div className={`${styles.message} ${styles.received}`}>
          Hvor lang tid tager levering?
        </div>
      </section>

      <form className={styles.composer}>
        <button type="button" aria-label="Tilføj billede">+</button>
        <label>
          <span className={styles.visuallyHidden}>Skriv en besked</span>
          <input type="text" placeholder="Skriv en besked..." />
        </label>
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
