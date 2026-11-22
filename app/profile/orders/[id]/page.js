"use client";

import { use } from "react";
import styles from "./page.module.css";

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const activeStep = 2;

  const steps = [
    { title: "Betaling", detail: "Betaling gennemført", icon: "/order-status/payment.png" },
    { title: "Afleveret til sælger", detail: "Pakken er modtaget", icon: "/order-status/handing-package.png" },
    { title: "Under forsendelse", detail: "Pakken er på vej", icon: "/order-status/shipping.png" },
    { title: "Klar til afhentning", detail: "Afventer pakkeshop", icon: "/order-status/ready-pickup.png" },
    { title: "Leveret", detail: "Afventer levering", icon: "/order-status/delivered.png" },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.orderHeader}>
        <span className={styles.articleImage} aria-hidden="true" />
        <div>
          <strong>Blå blazer</strong>
          <small>Ordre {id}</small>
          <span>350 kr.</span>
        </div>
      </section>

      <section className={styles.statusCard}>
        <h1>Pakkestatus</h1>
        <ol className={styles.timeline}>
          {steps.map((step, index) => {
            const state = index < activeStep
              ? styles.complete
              : index === activeStep
                ? styles.current
                : styles.pending;

            return (
              <li className={state} key={step.title}>
                <div className={styles.timelineItem}>
                  <span className={styles.marker} aria-hidden="true">
                    <img src={step.icon} alt="" />
                  </span>
                  {index < steps.length && (
                    <img
                      className={styles.stroke}
                      src={
                        index < 2
                          ? "/order-status/default-stroke.svg"
                          : index === 2
                            ? "/order-status/true-stroke.gif"
                            : "/order-status/false-stroke.svg"
                      }
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                  <span className={styles.stepText}>
                    <strong>{step.title}</strong>
                    <small>{step.detail}</small>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.details}>
        <h2>Ordreoplysninger</h2>
        <dl>
          <div>
            <dt>Ordrenummer</dt>
            <dd>{id}</dd>
          </div>
          <div>
            <dt>Leveringsmetode</dt>
            <dd>PostNord Pakkeshop</dd>
          </div>
          <div>
            <dt>Leveringsadresse</dt>
            <dd>Supabase brugerprofil</dd>
          </div>
        </dl>
      </section>

      <button type="button" className={styles.supportButton}>
        Kontakt support
      </button>
    </main>
  );
}
