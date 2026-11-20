import Link from "next/link";
import styles from "./page.module.css";

const conversations = [
  { id: "amaya", name: "Amaya", message: "Jeg sender pakken i morgen", time: "28 min siden", unread: 2, type: "Sælger" },
  { id: "laura", name: "Laura 84", message: "Tak for hurtig betaling", time: "1 t siden", unread: 0, type: "Køber" },
  { id: "malene", name: "Malene X", message: "Hej! Er jakken stadig til salg?", time: "3 t siden", unread: 1, type: "Sælger" },
  { id: "ida", name: "Ida", message: "Hvilken størrelse er den?", time: "I går", unread: 0, type: "Køber" },
];

export const metadata = {
  title: "Indbakke",
};

export default function InboxPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Indbakke</h1>

      <label className={styles.search}>
        <span className={styles.searchIcon} aria-hidden="true">⌕</span>
        <span className={styles.visuallyHidden}>Søg i indbakke</span>
        <input type="search" placeholder="Søg i indbakke" />
      </label>

      <nav className={styles.tabs} aria-label="Indbakke typer">
        <button type="button" className={styles.activeTab}>Samtaler</button>
        <button type="button">Opdateringer</button>
      </nav>

      <section className={styles.list} aria-label="Samtaler">
        {conversations.map((conversation) => (
          <Link
            href={`/inbox/${conversation.id}`}
            className={styles.conversation}
            key={conversation.id}
          >
            <span className={styles.avatar} aria-hidden="true">{conversation.name.charAt(0)}</span>
            <span className={styles.conversationInfo}>
              <span className={styles.nameRow}>
                <strong>{conversation.name}</strong>
                <small>{conversation.time}</small>
              </span>
              <span className={styles.messageRow}>
                <span>{conversation.message}</span>
                {conversation.unread > 0 && (
                  <span className={styles.unread}>{conversation.unread}</span>
                )}
              </span>
              <small className={styles.type}>{conversation.type}</small>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
