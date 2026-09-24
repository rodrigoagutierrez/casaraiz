import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// POST /api/upload { filename, contentType } -> { url, publicUrl } o 503 si falta config R2
export async function POST(req: NextRequest) {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, NEXT_PUBLIC_R2_PUBLIC_URL } =
    process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return NextResponse.json(
      { error: "R2 no configurado. Sube fotos por URL de momento." },
      { status: 503 }
    );
  }

  const { filename, contentType } = await req.json();
  if (!filename || !contentType?.startsWith("image/")) {
    return NextResponse.json({ error: "filename y contentType image/* requeridos" }, { status: 400 });
  }

  const key = `pisos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );

  const publicUrl = NEXT_PUBLIC_R2_PUBLIC_URL ? `${NEXT_PUBLIC_R2_PUBLIC_URL}/${key}` : key;
  return NextResponse.json({ url, key, publicUrl });
}
