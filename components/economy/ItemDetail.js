import { formatKr, formatKrDecimals } from "@/lib/economy";
import styles from "./ItemDetail.module.css";

// "Salgsdetalje" / "Købsdetalje"
export default function ItemDetail({ type, item }) {
  const isSold = type === "solgt";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <img className={styles.thumb} src={item.image} alt="" width="53" height="67" />
        <div className={styles.cardText}>
          <strong>{item.title}</strong>
          <span>{isSold ? `Solgt til ${item.buyer}` : `Købt af ${item.seller}`}</span>
          <span className={isSold ? styles.amountSold : styles.amountBought}>
            {formatKr(item.price)} inkl. Vinted gebyr
          </span>
        </div>
      </section>

      <div className={styles.divider} />

      <section className={styles.status}>
        <span className={styles.muted}>{item.date}</span>
        <strong>{isSold ? "Salget er gennemført" : "Købet er gennemført"}</strong>
        <small>
          {isSold
            ? "Din ordre er gennemført og registreret i dine salg"
            : "Din ordre er gennemført og registreret i dine køb"}
        </small>
      </section>

      <div className={styles.divider} />

      <section className={styles.payment}>
        <h2>Betalingsoplysninger</h2>
        <dl>
          {isSold ? (
            <>
              <div>
                <dt>Salgspris</dt>
                <dd>{formatKrDecimals(item.price)}</dd>
              </div>
              <div>
                <dt>Fragt</dt>
                <dd>Betalt af køber</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Varepris</dt>
                <dd>{formatKrDecimals(item.itemPrice)}</dd>
              </div>
              <div>
                <dt>Fragt</dt>
                <dd>{formatKrDecimals(item.shipping)}</dd>
              </div>
              <div>
                <dt>Vinted-gebyr</dt>
                <dd className={styles.fee}>
                  {formatKrDecimals(item.fee)}
                  <span className={styles.protection}>
                    <img src="/economy/buyer-protection.svg" alt="Køberbeskyttelse" width="12.2108" height="14.8752" />
                  </span>
                </dd>
              </div>
            </>
          )}
        </dl>
      </section>

      <div className={styles.divider} />

      <div className={styles.total}>
        <strong>{isSold ? "Du modtog i alt" : "I alt betalt"}</strong>
        <span className={isSold ? styles.amountSold : styles.amountBought}>{formatKr(item.price)}</span>
      </div>

      <p className={`${styles.muted} ${isSold ? styles.centered : ""}`}>Ordrenummer #{item.orderNumber}</p>

      <div className={styles.divider} />
    </main>
  );
}
