import Link from "next/link";
import styles from "./ProfileMenuItem.module.css";

export default function ProfileMenuItem({
  label,
  icon,
  href = "#",
  rightText,
  badge,
}) {
  return (
    <Link href={href} className={styles.row}>
      <span className={styles.labelGroup}>
        {icon && <img className={styles.icon} src={icon} alt="" />}
        <span className={styles.label}>{label}</span>
      </span>

      <span className={styles.trailing}>
        {rightText && <span className={styles.rightText}>{rightText}</span>}
        {badge && <span className={styles.badge}>{badge}</span>}
        <span className={styles.chevron} aria-hidden="true">›</span>
      </span>
    </Link>
  );
}
