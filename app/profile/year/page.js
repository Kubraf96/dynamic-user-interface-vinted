import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Året der gik",
};

const milestones = [
  {
    year: 2026,
    cta: "Se allerede nu",
    href: "/profile/year/2026",
    image: "/year/milestone-2026.jpg",
    check: "/year/check-light.svg",
    theme: styles.dark,
  },
  {
    year: 2025,
    cta: "Se sidste år",
    image: "/year/milestone-2025.png",
    check: "/year/check-dark.svg",
    theme: styles.orange,
  },
  {
    year: 2024,
    cta: "Se forrige år",
    image: "/year/milestone-2024.jpg",
    check: "/year/check-light.svg",
    theme: styles.lavender,
  },
];

export default function YearOverviewPage() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <p className={styles.intro}>Et tilbageblik på din rejse på Vinted</p>

        <section className={styles.section}>
          <h2>Opnåede indtil videre</h2>

          <ul className={styles.milestones}>
            {milestones.map((milestone) => (
              <li key={milestone.year} className={`${styles.milestone} ${milestone.theme}`}>
                <div className={styles.text}>
                  <div className={styles.titles}>
                    <strong>{milestone.year}</strong>
                    <span>Året der gik</span>
                  </div>
                  {milestone.href ? (
                    <Link href={milestone.href} className={styles.cta}>
                      {milestone.cta}
                    </Link>
                  ) : (
                    <span className={styles.cta} aria-disabled="true" title="Kommer snart">
                      {milestone.cta}
                    </span>
                  )}
                </div>

                <div className={styles.media}>
                  <img className={styles.photo} src={milestone.image} alt="" width="85" height="109" />
                  <img
                    className={styles.check}
                    src={milestone.check}
                    alt="Opnået"
                    width="18.9"
                    height="18.9"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
