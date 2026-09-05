"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { CREW_ROLES, clearBooth, readBooth, writeBooth } from "../../lib/booth";

const QR_TIMEOUT_SECONDS = 25;

export default function ResultPage() {
  const router = useRouter();
  const [resultUrl, setResultUrl] = useState(null);
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QR_TIMEOUT_SECONDS);
  const intervalRef = useRef(null);
  const secondsRef = useRef(QR_TIMEOUT_SECONDS);
  // The countdown starts on the first Download click and then keeps running
  // in the background even if the popup is closed — this guards against
  // re-arming it (and resetting back to 25s) on a later Download click.
  const startedRef = useRef(false);

  useEffect(() => {
    const booth = readBooth();
    if (!booth.resultUrl) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    setResultUrl(booth.resultUrl);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    setRole(booth.role);
    setReady(true);
  }, [router]);

  function clearQrTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Always clear the pending interval on unmount/navigation-away.
  useEffect(() => clearQrTimer, []);

  function resetToHome() {
    clearQrTimer();
    setQrOpen(false);
    clearBooth();
    router.push("/");
  }

  function openDownload() {
    if (!resultUrl) return;
    setQrOpen(true);
    if (startedRef.current) return;
    startedRef.current = true;
    secondsRef.current = QR_TIMEOUT_SECONDS;
    setSecondsLeft(QR_TIMEOUT_SECONDS);
    intervalRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSecondsLeft(secondsRef.current);
      if (secondsRef.current <= 0) {
        resetToHome();
      }
    }, 1000);
  }

  function closeDownload() {
    // Only hide the popup — the countdown keeps running so a later
    // Download click resumes it instead of restarting at 25s.
    setQrOpen(false);
  }

  function retake() {
    clearQrTimer();
    writeBooth({ capturedImage: null, resultUrl: null });
    router.push("/capture");
  }

  function goHome() {
    clearQrTimer();
    clearBooth();
    router.push("/");
  }

  if (!ready) return null;

  const qrUrl = resultUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(resultUrl)}`
    : null;
  const roleLabel = CREW_ROLES.find((option) => option.id === role)?.label || "Film Crew";

  return (
    <BoothShell background="/figma/result-bg.png" bgOpacity={0.7} bgColor="#050816">
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Download
          <br />
          <span className={styles.darkHeadingGradientReverse}>Your Moment</span>
        </h1>
        <p className={styles.darkCopy}>
          Your AI cinematic transformation is complete. Experience yourself as
          one of the talented professionals who bring every story to life.
        </p>

        <div className={styles.resultCardWrap}>
          <div className={styles.roleBadge}>
            <img src="/figma/icon-star.svg" alt="" />
            {roleLabel}
            <img src="/figma/icon-star.svg" alt="" />
          </div>
          <div className={styles.resultCard}>
            <img src={resultUrl} alt="Your generated festival caricature" />
          </div>
        </div>

        <button className={styles.gradientCta} type="button" onClick={openDownload}>
          <img className={styles.buttonIcon} src="/figma/icon-download.svg" alt="" />
          Download
        </button>

        <div className={styles.resultButtons}>
          <button type="button" className={styles.outlineDark} onClick={retake}>
            <img className={styles.buttonIcon} src="/figma/icon-retake-outline.svg" alt="" />
            Retake
          </button>
          <button type="button" className={styles.gradientCta} onClick={goHome}>
            <img className={styles.buttonIcon} src="/figma/icon-home-outline.svg" alt="" />
            Home
          </button>
        </div>
      </div>

      {qrOpen && qrUrl && (
        <div className={styles.qrOverlay} role="dialog" aria-modal="true" aria-label="Scan to download">
          <div className={styles.qrModal}>
            <button
              type="button"
              className={styles.qrModalClose}
              onClick={closeDownload}
              aria-label="Close"
            >
              &times;
            </button>
            <strong className={styles.qrModalTitle}>Scan For Download</strong>
            <p className={styles.qrModalText}>
              Scan the QR code with your phone to download your cinematic moment
            </p>
            <div className={styles.qrModalImageWrap}>
              <img src={qrUrl} width={220} height={220} alt="QR code to download your photo" />
            </div>
            <p className={styles.qrModalCountdown}>
              Returning home in {secondsLeft}s
            </p>
          </div>
        </div>
      )}
    </BoothShell>
  );
}
