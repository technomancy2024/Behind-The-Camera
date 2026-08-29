"use client";

import { useRouter } from "next/navigation";
import styles from "../booth.module.css";
import { clearBooth } from "../../lib/booth";

export default function BoothShell({ background, bgColor, align = "center", showHome = false, children }) {
  const router = useRouter();

  function goHome() {
    clearBooth();
    router.push("/");
  }

  return (
    <div className={styles.page}>
      <main
        className={styles.booth}
        style={{ backgroundImage: background ? `url(${background})` : undefined, backgroundColor: bgColor }}
      >
        <div className={align === "left" ? styles.topBarLeft : styles.topBar}>
          {showHome && (
            <button
              type="button"
              className={styles.homeButton}
              onClick={goHome}
              aria-label="Back to home"
            >
              <img src="/figma/icon-home.svg" alt="" />
            </button>
          )}
          <img className={styles.logo} src="/figma/logo.png" alt="IFFJK" />
        </div>
        <section className={align === "left" ? styles.screenLeft : styles.screen}>
          {children}
        </section>
      </main>
    </div>
  );
}
