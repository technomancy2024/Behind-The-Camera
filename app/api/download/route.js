export async function GET(request) {
  const source = new URL(request.url).searchParams.get("url");
  const base = process.env.VITE_S3_PUBLIC_BASE_URL ||
    (process.env.VITE_S3_BUCKET && process.env.VITE_AWS_REGION
      ? `https://${process.env.VITE_S3_BUCKET}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com`
      : null);

  try {
    if (!source || !base) {
      return new Response("Image not found.", { status: 404 });
    }
    const url = new URL(source);
    const allowed = new URL(`${base.replace(/\/$/, "")}/caricatures/`);
    const key = url.pathname.slice(allowed.pathname.length);
    if (
      url.origin !== allowed.origin ||
      !url.pathname.startsWith(allowed.pathname) ||
      !/^[a-f0-9-]+\.webp$/i.test(key) ||
      url.username || url.password || url.search
    ) {
      return new Response("Invalid image.", { status: 400 });
    }

    const image = await fetch(url, { redirect: "error" });
    if (!image.ok) return new Response("Download failed.", { status: 502 });
    return new Response(image.body, {
      headers: {
        "Content-Type": "image/webp",
        "Content-Disposition": 'attachment; filename="behind-the-camera.webp"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Download failed.", { status: 502 });
  }
}
