"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

export const bottomNavItems = [
  { label: "Hjem", href: "/", icon: "/icons/home.svg", activeIcon: "/icons/home-filled.svg" },
  { label: "Søg", href: "/search", icon: "/icons/browse.svg" },
  { label: "Sælg", href: "/sell", icon: "/icons/sell.svg" },
  { label: "Indbakke", href: "/inbox", icon: "/icons/inbox.svg", activeIcon: "/icons/inbox-filled.svg" },
  { label: "Profil", href: "/profile", icon: "/icons/profile.svg", activeIcon: "/icons/profile-filled.svg" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Full-screen flows (story slides and order confirmations) have no navbar in the design
  if (pathname === "/sell" || pathname.startsWith("/profile/year/") || pathname.startsWith("/confirmation/")) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Primær navigation">
      {bottomNavItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            href={item.href}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
            key={item.href}
          >
            <span className={styles.icon} aria-hidden="true">
              <img
                src={isActive && item.activeIcon ? item.activeIcon : item.icon}
                alt=""
              />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
