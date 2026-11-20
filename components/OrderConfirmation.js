import Link from "next/link";
import styles from "./OrderConfirmation.module.css";

// "Købsbekræftelse" / "Salgsbekræftelse"
export default function OrderConfirmation({ type }) {
  const isPurchase = type === "purchase";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.checkmark} aria-hidden="true">
          <img src="/confirmation/check-circle.svg" alt="" width="115.358" height="115.358" />
          <span className={styles.tick}>
            <img src="/confirmation/check-mark.svg" alt="" width="42.2333" height="28.5467" />
          </span>
        </div>
        <h2>{isPurchase ? "Dit køb er gennemført!" : "Din vare er solgt!"}</h2>
      </section>

      <section className={styles.order}>
        <h3>{isPurchase ? "Din ordre" : "Din solgte vare"}</h3>
        <div className={styles.item}>
          <span className={styles.thumb} aria-hidden="true">
            <img src="/confirmation/jeans.png" alt="" />
          </span>
          <div className={styles.itemText}>
            <strong>Jeans</strong>
            <span>{isPurchase ? "Solgt af mariaskov12" : "Købt af anne-louise0709"}</span>
            <span className={styles.price}>45,00 kr.</span>
          </div>
        </div>
      </section>

      <section className={styles.payment}>
        {isPurchase && (
          <div className={styles.row}>
            <span className={styles.muted}>Vinted-gebyr</span>
            <span className={styles.fee}>
              7,25kr.
              <span className={styles.protection}>
                <img src="/economy/buyer-protection.svg" alt="Køberbeskyttelse" width="12.2108" height="14.8752" />
              </span>
            </span>
          </div>
        )}
        <div className={styles.row}>
          <span>{isPurchase ? "I alt betalt" : "Du modtager i alt"}</span>
          <span className={styles.total}>{isPurchase ? "52,25 kr." : "45,00 kr."}</span>
        </div>
        <p className={styles.muted}>Ordrenummer #123456</p>
      </section>

      <Link
        href={isPurchase ? "/profile/orders/ORD-2001" : "/profile/orders/ORD-1001"}
        className={styles.cta}
      >
        {isPurchase ? "Følg din pakke" : "Gør din forsendelse klar"}
      </Link>

      <section className={styles.next}>
        <h3>Hvad sker der nu?</h3>
        <p>
          {isPurchase
            ? "Sælgeren skal nu sende din pakke. Vi giver besked når der sker noget nyt."
            : "Pak varen og send den inden forsendelsesfristen. Du får besked, når pakken er på vej."}
        </p>
      </section>

      <Link href="/" className={styles.home}>
        Tilbage til hjem
      </Link>
    </main>
  );
}
