import styles from "./CtaButton.module.css";

export default function CtaButton({
  children = "Følg din pakke",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${className}`.trim()}
      {...props}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
}
