import Link from "next/link";
import { formatKr } from "@/lib/economy";
import styles from "./PeriodSummary.module.css";

function SummaryRow({ href, children }) {
  if (!href) return <div className={styles.row}>{children}</div>;

  return (
    <Link href={href} className={styles.row}>
      {children}
      <img src="/economy/chevron-small.svg" alt="" width="17.519" height="17.519" />
    </Link>
  );
}

// "Måneds økonomi" card: sold, bought and the difference for one month or year.
// When soldHref/boughtHref are given, the rows link on to the item lists.
export default function PeriodSummary({ label, sold, bought, soldHref, boughtHref, dimmed = false }) {
  return (
    <section className={`${styles.card} ${dimmed ? styles.dimmed : ""}`} aria-label={`Økonomi for ${label}`}>
      <h2 className={styles.title}>{label}</h2>

      <div className={styles.rows}>
        <SummaryRow href={soldHref}>
          <span className={styles.rowLabel}>Solgt</span>
          <span className={styles.sold}>{formatKr(sold)}</span>
        </SummaryRow>
        <SummaryRow href={boughtHref}>
          <span className={styles.rowLabel}>Købt</span>
          <span className={styles.bought}>{formatKr(bought)}</span>
        </SummaryRow>
      </div>

      <div className={`${styles.row} ${soldHref ? styles.alignWithChevron : ""}`}>
        <span>Forskel</span>
        <span>{formatKr(sold - bought)}</span>
      </div>

      <div className={styles.divider} />
    </section>
  );
}
