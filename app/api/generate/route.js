import path from "path";
import Replicate from "replicate";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

const WATERMARK_TEXT =
  "This is an AI Generated Poster made at IFFJK 2026";

const LEFT_LOGO_PATH = path.join(
  process.cwd(),
  "public/figma/logo.png"
);

const RIGHT_LOGO_PATH = path.join(
  process.cwd(),
  "public/figma/seal-logo.png"
);

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function addWatermark(buffer) {
  const image = sharp(buffer);

  const metadata = await image.metadata();

  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  const barHeight = Math.max(
    48,
    Math.round(height * 0.07)
  );

  const fontSize = Math.max(
    18,
    Math.round(barHeight * 0.4)
  );

  const logoHeight = Math.max(
    32,
    Math.round(height * 0.06)
  );

  const logoMargin = Math.round(
    logoHeight * 0.35
  );

  /*
   * IMPORTANT:
   * Do NOT use Sharp's `text` input here.
   *
   * It depends on the fonts available in the
   * deployment environment and can produce □□□
   * characters on Netlify/Linux.
   *
   * Instead, render the complete watermark as SVG.
   */

  const safeText = escapeXml(WATERMARK_TEXT);

  const textMaxWidth = Math.round(width * 0.92);

  const textSvg = `
    <svg
      width="${textMaxWidth}"
      height="${barHeight}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        .watermark {
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          font-size: ${fontSize}px;
          font-weight: 700;
        }
      </style>

      <text
        x="${textMaxWidth / 2}"
        y="${Math.round(barHeight * 0.63)}"
        text-anchor="middle"
        class="watermark"
        fill="#ffffff"
      >
        ${safeText}
      </text>
    </svg>
  `;

  /*
   * Background bar
   */
  const barSvg = `
    <svg
      width="${width}"
      height="${barHeight}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width="${width}"
        height="${barHeight}"
        fill="#0f2161"
        fill-opacity="0.65"
      />
    </svg>
  `;

  const [barBuffer, textBuffer, leftLogo, rightLogo] =
    await Promise.all([
      sharp(Buffer.from(barSvg))
        .png()
        .toBuffer(),

      sharp(Buffer.from(textSvg))
        .png()
        .toBuffer(),

      sharp(LEFT_LOGO_PATH)
        .resize({
          height: logoHeight,
          fit: "contain",
        })
        .png()
        .toBuffer(),

      sharp(RIGHT_LOGO_PATH)
        .resize({
          height: logoHeight,
          fit: "contain",
        })
        .png()
        .toBuffer(),
    ]);

  const rightMeta = await sharp(rightLogo).metadata();

  const composites = [
    /*
     * Bottom watermark bar
     */
    {
      input: barBuffer,
      top: height - barHeight,
      left: 0,
    },

    /*
     * Watermark text
     */
    {
      input: textBuffer,
      top: height - barHeight,
      left: Math.round(
        (width - textMaxWidth) / 2
      ),
    },

    /*
     * Left logo
     */
    {
      input: leftLogo,
      top: logoMargin,
      left: logoMargin,
    },

    /*
     * Right logo
     */
    {
      input: rightLogo,
      top: logoMargin,
      left: Math.max(
        logoMargin,
        width -
          logoMargin -
          (rightMeta.width || logoHeight)
      ),
    },
  ];

  return image
    .composite(composites)
    .webp({
      quality: 95,
    })
    .toBuffer();
}

export async function POST(request) {
  const {
    image,
    prompt,
    style = "Classic",
  } = await request.json();

  if (!Array.isArray(image) || image.length === 0) {
    return Response.json(
      {
        error:
          "At least one image URL is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json(
      {
        error:
          "REPLICATE_API_TOKEN is not configured.",
      },
      {
        status: 503,
      }
    );
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const seeds = [
      64817722,
      1400671,
      4915284,
      14109437,
      86236694,
    ];

    const output = await replicate.run(
      "alibaba/qwen-image-3-pro",
      {
        input: {
          image: image[0],

          prompt:
            prompt ||
            `Create a ${style.toLowerCase()} festival caricature from this photo.`,

          aspect_ratio: "3:4",

          negative_prompt:
            "changed face, beautified face, altered facial structure, age, expression, hairstyle or skin tone, generic face, identity loss, face blending, pasted face, changed outfit, invented clothing, dwarf body, oversized head, tiny torso, narrow shoulders, short limbs, unnatural proportions, malformed anatomy, bad hands, extra fingers, extra limbs, awkward pose, crew posing, extra foreground people, incorrect equipment, mismatched lighting, plastic skin, oversmoothing, CGI, cartoon, illustration, blur, text, watermark",

          match_input_image: false,

          enable_prompt_expansion: false,

          seed:
            seeds[
              Math.floor(
                Math.random() * seeds.length
              )
            ],
        },
      }
    );

    const outputUrl =
      typeof output?.url === "function"
        ? output.url()
        : output?.url || output;

    if (!outputUrl) {
      return Response.json(
        {
          error:
            "The model did not return an image.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * Download generated image
     */
    const generatedResponse =
      await fetch(outputUrl);

    if (!generatedResponse.ok) {
      throw new Error(
        `Failed to download generated image: ${generatedResponse.status}`
      );
    }

    const rawBuffer = Buffer.from(
      await generatedResponse.arrayBuffer()
    );

    /*
     * Add watermark + logos
     */
    const watermarkedBuffer =
      await addWatermark(rawBuffer);

    /*
     * Upload to S3
     */
    let storedUrl;

    if (
      process.env.VITE_S3_BUCKET &&
      process.env.VITE_AWS_REGION
    ) {
      const key = `caricatures/${crypto.randomUUID()}.webp`;

      const s3 = new S3Client({
        region:
          process.env.VITE_AWS_REGION,

        credentials: {
          accessKeyId:
            process.env.VITE_AWS_ACCESS_KEY,

          secretAccessKey:
            process.env.VITE_AWS_SECRET_KEY,
        },
      });

      await s3.send(
        new PutObjectCommand({
          Bucket:
            process.env.VITE_S3_BUCKET,

          Key: key,

          Body: watermarkedBuffer,

          ContentType: "image/webp",
        })
      );

      storedUrl =
        process.env.VITE_S3_PUBLIC_BASE_URL
          ? `${process.env.VITE_S3_PUBLIC_BASE_URL}/${key}`
          : `https://${process.env.VITE_S3_BUCKET}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
    } else {
      /*
       * Fallback:
       * Return image as base64 data URL
       */
      storedUrl =
        `data:image/webp;base64,${watermarkedBuffer.toString(
          "base64"
        )}`;
    }

    return Response.json({
      url: storedUrl,
    });
  } catch (error) {
    console.error(
      "Caricature generation error:",
      error
    );

    return Response.json(
      {
        error:
          error?.message ||
          "Generation failed.",
      },
      {
        status: 500,
      }
    );
  }
}