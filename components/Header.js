"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMonth } from "@/lib/economy";
import styles from "./Header.module.css";

// Routes that render their own full-screen layout without the shared header
function isHeaderless(pathname) {
  return pathname === "/" || pathname.startsWith("/listing/") || pathname.startsWith("/inbox/") || pathname.startsWith("/profile/year/") || pathname.startsWith("/profile/listings");
}

function isKnownRoute(pathname) {
  return [
    /^\/(?:login|signup|profile|inbox|confirmation\/(?:purchase|sale))$/,
    /^\/profile\/(?:orders(?:\/[^/]+)?|balance(?:\/.*)?|year)$/,
  ].some((route) => route.test(pathname));
}

export default function Header({
  title = "",
  showArrow = true,
  backHref = "/",
}) {
  const pathname = usePathname();

  if (isHeaderless(pathname)) return null;

  if (!isKnownRoute(pathname)) {
    title = "";
  }

  const balanceMatch = pathname.match(/^\/profile\/balance\/([^/]+)(?:\/(solgt|kobt)(?:\/([^/]+))?)?$/);

  if (pathname.startsWith("/profile/orders")) {
    title = "Mine ordrer";
    backHref = pathname === "/profile/orders" ? "/profile" : "/profile/orders";
  } else if (pathname.startsWith("/profile/listings")) {
    title = "Mine annoncer";
    backHref = "/profile";
  } else if (pathname.startsWith("/profile/favorites")) {
    title = "Favoritartikler";
    backHref = "/profile";
  } else if (pathname === "/sell") {
    title = "Sælg en artikel";
    backHref = "/";
    showArrow = false;
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
  } else if (pathname === "/inbox") {
    title = "Indbakke";
    showArrow = false;
  } else if (pathname === "/login") {
    title = "Log ind";
    showArrow = false;
  } else if (pathname === "/signup") {
    title = "Opret konto";
    showArrow = false;
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {pathname === "/sell" ? (
          <Link href="/" className={styles.sellClose} aria-label="Luk">
            <span aria-hidden="true">×</span>
          </Link>
        ) : showArrow ? (
          <Link href={backHref} className={styles.backButton} aria-label="Gå tilbage">
            <img src="/arrow-icon.svg" alt="" />
          </Link>
        ) : (
          <span className={styles.backPlaceholder} aria-hidden="true" />
        )}

        <h1 className={styles.title}>{title}</h1>
        {pathname.startsWith("/profile/favorites") ? (
          <Link href="/?search=" className={styles.headerSearch} aria-label="Søg efter annoncer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
          </Link>
        ) : <span className={styles.trailingPlaceholder} aria-hidden="true" />}
      </div>
    </header>
  );
}
