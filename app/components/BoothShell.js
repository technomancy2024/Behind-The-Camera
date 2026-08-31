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
        <div className={styles.topBar}>
          <div className={styles.logoRow}>
            {showHome ? (
              <button
                type="button"
                className={styles.logoButton}
                onClick={goHome}
                aria-label="Back to home"
              >
                <img className={styles.logo} src="/figma/logo.png" alt="IFFJK" />
              </button>
            ) : (
              <img className={styles.logo} src="/figma/logo.png" alt="IFFJK" />
            )}
            <img
              className={styles.sealLogo}
              src="/figma/seal-logo.png"
              alt="Department of Information and Public Relations, Jammu and Kashmir"
            />
          </div>
        </div>
        <section className={align === "left" ? styles.screenLeft : styles.screen}>
          {children}
        </section>
      </main>
    </div>
  );
}
