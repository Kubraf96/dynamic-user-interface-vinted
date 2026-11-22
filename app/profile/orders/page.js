"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const soldOrders = [
  { id: "ORD-1001", title: "Blå blazer", status: "Sendt", date: "20. nov.", price: "350 kr." },
  { id: "ORD-1002", title: "Beige kjole", status: "Betalt", date: "18. nov.", price: "220 kr." },
  { id: "ORD-1003", title: "Nike sneakers", status: "Afsluttet", date: "12. nov.", price: "480 kr." },
];

const boughtOrders = [
  { id: "ORD-2001", title: "Hvid skjorte", status: "Undervejs", date: "19. nov.", price: "175 kr." },
  { id: "ORD-2002", title: "Levis jeans", status: "Modtaget", date: "15. nov.", price: "290 kr." },
];

export default function OrdersPage() {
  const [tab, setTab] = useState("sold");
  const orders = tab === "sold" ? soldOrders : boughtOrders;

  return (
    <main className={styles.page}>
      <nav className={styles.tabs} aria-label="Vælg ordretype">
        <button
          type="button"
          className={tab === "bought" ? styles.active : ""}
          onClick={() => setTab("bought")}
          aria-current={tab === "bought" ? "page" : undefined}
        >
          Købt
        </button>
        <button
          type="button"
          className={tab === "sold" ? styles.active : ""}
          onClick={() => setTab("sold")}
          aria-current={tab === "sold" ? "page" : undefined}
        >
          Solgt
        </button>
      </nav>

      <section className={styles.list} aria-label="Ordrer">
        {orders.map((order) => (
          <Link href={`/profile/orders/${order.id}`} className={styles.order} key={order.id}>
            <span className={styles.articleImage} aria-hidden="true" />
            <span className={styles.orderInfo}>
              <span className={styles.orderTop}>
                <strong>{order.title}</strong>
                <small>{order.date}</small>
              </span>
              <span className={styles.status}>{order.status}</span>
              <span className={styles.orderBottom}>
                <small>{order.id}</small>
                <strong>{order.price}</strong>
              </span>
            </span>
            <span className={styles.chevron} aria-hidden="true">›</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
