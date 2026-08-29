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
  const fileInputRef = useRef(null);

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

  async function capturePhoto() {
    const track = streamRef.current?.getVideoTracks?.()[0];

    if (track && "ImageCapture" in window) {
      try {
        const capture = new window.ImageCapture(track);
        const bitmap = await capture.grabFrame();
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        // Mirror horizontally so the saved photo matches the mirrored live preview.
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(bitmap, 0, 0);
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
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror horizontally so the saved photo matches the mirrored live preview.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    writeBooth({ capturedImage: dataUrl, resultUrl: null });
    stopStream();
  }

  function retakePhoto() {
    setCapturedImage(null);
    writeBooth({ capturedImage: null, resultUrl: null });
  }

  function chooseFileInstead(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      writeBooth({ capturedImage: reader.result, resultUrl: null });
    };
    reader.readAsDataURL(file);
  }

  function proceed() {
    if (!capturedImage) return;
    router.push("/generating");
  }

  if (!ready) return null;

  return (
    <BoothShell bgColor="#050816" showHome>
      <img className={styles.bgPhoto} style={{ opacity: 0.6 }} src="/figma/capture-bg.png" alt="" />
      <div className={styles.darkContent}>
        <h1 className={styles.darkHeading}>
          Ready For
          <br />
          Your Close-Up?
        </h1>
        <p className={styles.darkCopy}>
          Select the behind-the-scenes role you&rsquo;d like to experience.
          Our AI will transform you into a movie production professional.
        </p>

        <div className={styles.captureCard}>
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
                Camera unavailable — upload a selfie instead.
              </span>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted />
          )}

          {countdown !== null && (
            <div className={styles.countdownRing}>{countdown}</div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={chooseFileInstead}
          style={{ display: "none" }}
        />

        <div className={styles.captureRow}>
          <button
            type="button"
            className={styles.outlineDark}
            onClick={capturedImage ? retakePhoto : () => fileInputRef.current?.click()}
          >
            <img className={styles.buttonIcon} src="/figma/icon-retake.svg" alt="" />
            {capturedImage ? "Retake" : "Upload"}
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
