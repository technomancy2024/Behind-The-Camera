import path from "path";
import Replicate from "replicate";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const WATERMARK_TEXT = "This is an AI Generated Poster made at IFFJK 2026";

const LEFT_LOGO_PATH = path.join(process.cwd(), "public/figma/logo.png");
const RIGHT_LOGO_PATH = path.join(process.cwd(), "public/figma/seal-logo.png");

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function addWatermark(buffer) {
  const image = sharp(buffer);
  const { width = 1024, height = 1024 } = await image.metadata();
  const barHeight = Math.max(48, Math.round(height * 0.07));
  const fontSize = Math.max(18, Math.round(barHeight * 0.4));

  // The bar background is a plain shape, safe to rasterize via SVG.
  const barSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="rgba(15,33,97,0.65)" />
    </svg>`;

  // Sharp's SVG loader does not reliably rasterize <text> (it can render as
  // missing/placeholder glyphs depending on the host's fonts). Render the
  // label through sharp's dedicated text feature instead, which is the
  // supported way to draw text with sharp.
  const textMaxWidth = Math.round(width * 0.92);
  const textBuffer = await sharp({
    text: {
      text: `<span foreground="#ffffff">${escapeXml(WATERMARK_TEXT)}</span>`,
      font: `sans-serif bold ${fontSize}`,
      width: textMaxWidth,
      rgba: true,
      align: "center",
    },
  })
    .png()
    .toBuffer();
  const { width: textWidth = textMaxWidth, height: textHeight = fontSize } =
    await sharp(textBuffer).metadata();

  const logoHeight = Math.max(32, Math.round(height * 0.06));
  const logoMargin = Math.round(logoHeight * 0.35);

  const composites = [
    { input: Buffer.from(barSvg), top: 0, left: 0 },
    {
      input: textBuffer,
      top: height - barHeight + Math.round((barHeight - textHeight) / 2),
      left: Math.max(0, Math.round((width - textWidth) / 2)),
    },
  ];

  const [leftLogo, rightLogo] = await Promise.all([
    sharp(LEFT_LOGO_PATH).resize({ height: logoHeight }).toBuffer(),
    sharp(RIGHT_LOGO_PATH).resize({ height: logoHeight }).toBuffer(),
  ]);
  const rightMeta = await sharp(rightLogo).metadata();

  composites.push({ input: leftLogo, top: logoMargin, left: logoMargin });
  composites.push({
    input: rightLogo,
    top: logoMargin,
    left: Math.max(logoMargin, width - logoMargin - (rightMeta.width || logoHeight)),
  });

  return image
    .composite(composites)
    .toFormat("webp", { quality: 95 })
    .toBuffer();
}

export async function POST(request) {
  const { image, prompt, style = "Classic" } = await request.json();

  if (!Array.isArray(image) || image.length === 0) {
    return Response.json({ error: "At least one image URL is required." }, { status: 400 });
  }
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "REPLICATE_API_TOKEN is not configured." }, { status: 503 });
  }

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const seeds = [64817722, 1400671, 4915284, 14109437, 86236694];
    const output = await replicate.run("alibaba/qwen-image-3-pro", {
      input: {
        image: image[0],
        prompt: prompt || `Create a ${style.toLowerCase()} festival caricature from this photo.`,
        aspect_ratio: "3:4",
        negative_prompt: "changed face, beautified face, altered facial structure, age, expression, hairstyle or skin tone, generic face, identity loss, face blending, pasted face, changed outfit, invented clothing, dwarf body, oversized head, tiny torso, narrow shoulders, short limbs, unnatural proportions, malformed anatomy, bad hands, extra fingers, extra limbs, awkward pose, crew posing, extra foreground people, incorrect equipment, mismatched lighting, plastic skin, oversmoothing, CGI, cartoon, illustration, blur, text, watermark",
        match_input_image: false,
        enable_prompt_expansion: false,
        seed: seeds[Math.floor(Math.random() * seeds.length)],
      },
    });
    const outputUrl = typeof output?.url === "function" ? output.url() : output?.url || output;
    if (!outputUrl) {
      return Response.json({ error: "The model did not return an image." }, { status: 502 });
    }

    const generatedResponse = await fetch(outputUrl);
    const rawBuffer = Buffer.from(await generatedResponse.arrayBuffer());
    const watermarkedBuffer = await addWatermark(rawBuffer);

    let storedUrl;
    if (process.env.VITE_S3_BUCKET && process.env.VITE_AWS_REGION) {
      const key = `caricatures/${crypto.randomUUID()}.webp`;
      const s3 = new S3Client({
        region: process.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: process.env.VITE_AWS_ACCESS_KEY,
          secretAccessKey: process.env.VITE_AWS_SECRET_KEY,
        },
      });
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.VITE_S3_BUCKET,
          Key: key,
          Body: watermarkedBuffer,
          ContentType: "image/webp",
        })
      );
      storedUrl = process.env.VITE_S3_PUBLIC_BASE_URL
        ? `${process.env.VITE_S3_PUBLIC_BASE_URL}/${key}`
        : `https://${process.env.VITE_S3_BUCKET}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
    } else {
      storedUrl = `data:image/webp;base64,${watermarkedBuffer.toString("base64")}`;
    }

    return Response.json({ url: storedUrl });
  } catch (error) {
    return Response.json({ error: error.message || "Generation failed." }, { status: 500 });
  }
}
