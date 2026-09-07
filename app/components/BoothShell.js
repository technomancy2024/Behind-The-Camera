"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../booth.module.css";
import { clearBooth } from "../../lib/booth";

// Below this stage width the layout stays in its natural, fully fluid
// mobile mode (matches the design's own max-width) — no scaling applied.
const SCALE_BREAKPOINT = 481;

export default function BoothShell({
  background,
  bgOpacity = 1,
  bgColor,
  align = "center",
  showHome = false,
  children,
}) {
  const router = useRouter();
  const stageRef = useRef(null);
  const boothRef = useRef(null);

  function goHome() {
    clearBooth();
    router.push("/");
  }

  // Kiosk/tablet/desktop screens are far taller and wider than the mobile
  // design this app was built for. Rather than stretching the mobile layout
  // to fill that space (which blows up the gaps between elements), the
  // booth card keeps its natural mobile-shaped size and content, and is
  // uniformly scaled up as a single unit to fill the available screen —
  // exactly like zooming into the same composition. This keeps every
  // proportion (including font sizes, which scale right along with
  // everything else) identical to the mobile design at any screen size.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const booth = boothRef.current;
    if (!stage || !booth) return;

    function applyScale() {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;

      const naturalWidth = Math.max(booth.offsetWidth, booth.scrollWidth);
      const naturalHeight = Math.max(booth.offsetHeight, booth.scrollHeight, 1);
      const scale = Math.min(
        stageWidth / naturalWidth,
        stageHeight / naturalHeight,
        stageWidth < SCALE_BREAKPOINT ? 1 : Infinity,
      );
      booth.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    applyScale();
    const resizeObserver = new ResizeObserver(applyScale);
    resizeObserver.observe(stage);
    resizeObserver.observe(booth);
    window.addEventListener("resize", applyScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", applyScale);
    };
  }, []);

  return (
    <div className={styles.page} ref={stageRef} style={{ backgroundColor: bgColor }}>
      {background && (
        <img className={styles.bgPhoto} style={{ opacity: bgOpacity }} src={background} alt="" />
      )}
      <main className={styles.booth} ref={boothRef}>
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
