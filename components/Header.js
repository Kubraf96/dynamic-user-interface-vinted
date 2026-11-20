"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header({
  title = "Mine ordrer",
  showArrow = true,
  backHref = "/",
}) {
  const pathname = usePathname();

  if (pathname === "/") return null;

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
