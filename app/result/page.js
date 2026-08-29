"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { CREW_ROLES, clearBooth, readBooth, writeBooth } from "../../lib/booth";

export default function ResultPage() {
  const router = useRouter();
  const [resultUrl, setResultUrl] = useState(null);
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);

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

  async function downloadResult() {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "festival-caricature.webp";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultUrl, "_blank");
    }
  }

  function retake() {
    writeBooth({ capturedImage: null, resultUrl: null });
    router.push("/capture");
  }

  function goHome() {
    clearBooth();
    router.push("/");
  }

  if (!ready) return null;

  const qrUrl = resultUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(resultUrl)}`
    : null;
  const roleLabel = CREW_ROLES.find((option) => option.id === role)?.label || "Film Crew";

  return (
    <BoothShell bgColor="#050816">
      <img className={styles.bgPhoto} style={{ opacity: 0.7 }} src="/figma/result-bg.png" alt="" />
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Download
          <br />
          <span className={styles.darkHeadingGradient}>Your Moment</span>
        </h1>
        <p className={styles.darkCopy}>
          Your AI cinematic transformation is complete. Experience yourself as
          one of the talented professionals who bring every story to life.
        </p>

        <div className={styles.resultCard}>
          <div className={styles.roleBadge}>
            <img src="/figma/icon-star.svg" alt="" />
            {roleLabel}
            <img src="/figma/icon-star.svg" alt="" />
          </div>
          <img src={resultUrl} alt="Your generated festival caricature" />
          {qrUrl && (
            <div className={styles.qrStrip}>
              <img src={qrUrl} alt="QR code to download your photo" />
              <div className={styles.qrStripText}>
                <strong>Scan For Download</strong>
                <span>Scan the QR code to download your cinematic moment</span>
              </div>
            </div>
          )}
        </div>

        <button className={styles.gradientCta} type="button" onClick={downloadResult}>
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
    </BoothShell>
  );
}
