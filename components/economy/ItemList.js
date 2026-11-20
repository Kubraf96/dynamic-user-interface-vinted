import Link from "next/link";
import { formatKr } from "@/lib/economy";
import styles from "./ItemList.module.css";

const copy = {
  solgt: { total: "Samlet salg", heading: "Dine salg" },
  kobt: { total: "Samlet køb", heading: "Dine køb" },
};

// "Solgte varer" / "Købte varer": month banner followed by the list of items.
export default function ItemList({ type, month, items }) {
  const isSold = type === "solgt";
  const total = isSold ? month.sold : month.bought;

  return (
    <main className={styles.page}>
      <section className={`${styles.banner} ${isSold ? styles.bannerSold : styles.bannerBought}`}>
        <div className={styles.stat}>
          <span>{copy[type].total}</span>
          <strong>{formatKr(total)}</strong>
        </div>
        <span className={styles.statDivider} aria-hidden="true">
          <img src="/economy/divider-line.svg" alt="" width="48" height="1" />
        </span>
        <div className={styles.stat}>
          <span>Antal varer</span>
          <strong>{items.length}</strong>
        </div>
      </section>

      <div className={styles.divider} />

      <h2 className={styles.heading}>{copy[type].heading}</h2>

      {items.length === 0 ? (
        <p className={styles.empty}>Detaljer for denne måned er ikke tilgængelige endnu.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/profile/balance/${month.slug}/${type}/${item.id}`} className={styles.item}>
                <span className={styles.itemInfo}>
                  <img className={styles.thumb} src={item.image} alt="" width="50" height="70" />
                  <span className={styles.itemText}>
                    <strong>{item.title}</strong>
                    <small>{item.date}</small>
                  </span>
                </span>
                <span className={styles.itemTrailing}>
                  <span className={isSold ? styles.priceSold : styles.priceBought}>
                    {formatKr(isSold ? item.price : -item.price)}
                  </span>
                  <img src="/economy/chevron-right.svg" alt="" width="20" height="20" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
