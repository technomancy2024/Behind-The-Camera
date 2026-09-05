"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BoothShell from "../components/BoothShell";
import styles from "../booth.module.css";
import { readBooth, writeBooth } from "../../lib/booth";

export default function CapturePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const booth = readBooth();
    if (!booth.gender || !booth.ageGroup) {
      router.replace("/select");
      return;
    }
    if (!booth.role) {
      router.replace("/crew");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage on mount
    if (booth.capturedImage) setCapturedImage(booth.capturedImage);
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || capturedImage) return;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(null);
      })
      .catch((err) => setCameraError(err.message || "Camera unavailable"));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [ready, capturedImage]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      capturePhoto();
      return;
    }
    const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  function startCapture() {
    if (countdown !== null) return;
    setCountdown(3);
  }

  // The live preview is center-cropped by object-fit: cover to the card's
  // rendered aspect ratio. Crop the captured frame the same way so the photo
  // keeps the exact framing the user saw, instead of the full uncropped feed.
  function getCoverCropRect(sourceWidth, sourceHeight) {
    const card = cardRef.current;
    const containerAspect =
      card && card.clientWidth && card.clientHeight
        ? card.clientWidth / card.clientHeight
        : sourceWidth / sourceHeight;
    const sourceAspect = sourceWidth / sourceHeight;

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (sourceAspect > containerAspect) {
      sw = sourceHeight * containerAspect;
      sx = (sourceWidth - sw) / 2;
    } else if (sourceAspect < containerAspect) {
      sh = sourceWidth / containerAspect;
      sy = (sourceHeight - sh) / 2;
    }

    return { sx, sy, sw, sh };
  }

  async function capturePhoto() {
    const track = streamRef.current?.getVideoTracks?.()[0];

    if (track && "ImageCapture" in window) {
      try {
        const capture = new window.ImageCapture(track);
        const bitmap = await capture.grabFrame();
        const { sx, sy, sw, sh } = getCoverCropRect(bitmap.width, bitmap.height);
        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d");
        // Mirror horizontally so the saved photo matches the mirrored live preview.
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setCapturedImage(dataUrl);
        writeBooth({ capturedImage: dataUrl, resultUrl: null });
        stopStream();
        return;
      } catch {
        // fall through to the <video> canvas approach below
      }
    }

    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const { sx, sy, sw, sh } = getCoverCropRect(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    // Mirror horizontally so the saved photo matches the mirrored live preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    writeBooth({ capturedImage: dataUrl, resultUrl: null });
    stopStream();
  }

  function retakePhoto() {
    setCapturedImage(null);
    writeBooth({ capturedImage: null, resultUrl: null });
  }

  function proceed() {
    if (!capturedImage) return;
    router.push("/generating");
  }

  if (!ready) return null;

  return (
    <BoothShell background="/figma/capture-bg.png" bgOpacity={0.6} bgColor="#050816" showHome>
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          <span className={styles.darkHeadingGradientReverse}>Ready For</span>
          <br />
          Your Close-Up?
        </h1>
        <p className={styles.darkCopy}>
          Select the behind-the-scenes role you&rsquo;d like to experience.
          Our AI will transform you into a movie production professional.
        </p>

        <div className={styles.captureCard} ref={cardRef}>
          {capturedImage ? (
            <img src={capturedImage} alt="Captured selfie" />
          ) : cameraError ? (
            <div className={styles.captureCardPlaceholder}>
              <img
                src="/figma/capture-sample.png"
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  inset: 0,
                  opacity: 0.25,
                }}
              />
              <span style={{ position: "relative" }}>
                Camera unavailable. Please enable camera access to continue.
              </span>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted />
          )}

          {countdown !== null && (
            <div className={styles.countdownRing}>{countdown}</div>
          )}
        </div>

        <div className={styles.captureRow}>
          <button
            type="button"
            className={styles.outlineDark}
            onClick={retakePhoto}
            disabled={!capturedImage}
          >
            <img className={styles.buttonIcon} src="/figma/icon-retake.svg" alt="" />
            Retake
          </button>

          {!capturedImage && (
            <button
              type="button"
              className={styles.shutterButton}
              onClick={startCapture}
              disabled={!!cameraError || countdown !== null}
              aria-label="Capture photo"
            >
              <img className={styles.shutterRing} src="/figma/capture-ring-outer.svg" alt="" />
              <img className={styles.darkShutterFill} src="/figma/capture-ring-inner.svg" alt="" />
              <img className={styles.darkShutterIcon} src="/figma/capture-icon-camera.svg" alt="" />
            </button>
          )}

          <button
            type="button"
            className={styles.gradientCta}
            style={{ flex: 1 }}
            disabled={!capturedImage}
            onClick={proceed}
          >
            Proceed
            <img className={styles.buttonIcon} src="/figma/icon-arrow-right.svg" alt="" />
          </button>
        </div>
      </div>
    </BoothShell>
  );
}
