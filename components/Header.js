"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMonth } from "@/lib/economy";
import styles from "./Header.module.css";

// Routes that render their own full-screen layout without the shared header
function isHeaderless(pathname) {
  return pathname === "/" || pathname.startsWith("/inbox/") || pathname.startsWith("/profile/year/");
}

export default function Header({
  title = "Mine ordrer",
  showArrow = true,
  backHref = "/",
}) {
  const pathname = usePathname();

  if (isHeaderless(pathname)) return null;

  const balanceMatch = pathname.match(/^\/profile\/balance\/([^/]+)(?:\/(solgt|kobt)(?:\/([^/]+))?)?$/);

  if (pathname.startsWith("/profile/orders")) {
    title = "Mine ordrer";
    backHref = pathname === "/profile/orders" ? "/profile" : "/profile/orders";
  } else if (pathname === "/profile/balance") {
    title = "Saldo";
    backHref = "/profile";
  } else if (pathname === "/profile/balance/overview") {
    title = "Mit overblik";
    backHref = "/profile/balance";
  } else if (balanceMatch) {
    const [, monthSlug, type, itemId] = balanceMatch;
    if (itemId) {
      title = type === "solgt" ? "Salgsdetalje" : "Købsdetalje";
      backHref = `/profile/balance/${monthSlug}/${type}`;
    } else {
      title = getMonth(monthSlug)?.label ?? "Mit overblik";
      backHref = `/profile/balance/overview?month=${monthSlug}`;
    }
  } else if (pathname === "/profile/year") {
    title = "Året der gik";
    backHref = "/profile";
  } else if (pathname === "/confirmation/purchase") {
    title = "Købsbekræftelse";
    showArrow = false;
  } else if (pathname === "/confirmation/sale") {
    title = "Salgsbekræftelse";
    showArrow = false;
  } else if (pathname === "/profile") {
    title = "Profil";
    showArrow = false;
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {showArrow ? (
          <Link href={backHref} className={styles.backButton} aria-label="Gå tilbage">
            <img src="/arrow-icon.svg" alt="" />
          </Link>
        ) : (
          <span className={styles.backPlaceholder} aria-hidden="true" />
        )}

        <h1 className={styles.title}>{title}</h1>
        <span className={styles.trailingPlaceholder} aria-hidden="true" />
      </div>
    </header>
  );
}
