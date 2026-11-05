import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { docsBucketConfigured, DOC_KEY_PREFIX, presignDocPut } from "@/modules/users/docs";

// POST /api/upload { filename, contentType, contentLength? } -> { url, publicUrl } o 503 si falta config R2
// Alcance mínimo: solo image/jpeg/png/webp, ≤5MB, key namespaced por usuario (SOC2 CC6.6).
const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, NEXT_PUBLIC_R2_PUBLIC_URL } =
    process.env;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return NextResponse.json(
      { error: "R2 no configurado. Sube fotos por URL de momento." },
      { status: 503 }
    );
  }

  const { filename, contentType, contentLength, purpose } = await req.json() as {
    filename?: string; contentType?: string; contentLength?: number; purpose?: string;
  };
  // Purpose "doc" = documento de identidad → bucket PRIVADO (SOC2 CC6.6).
  // El resto (fotos de pisos/perfil) sigue en el bucket público de fotos.
  const isDoc = purpose === "doc";
  // Normalizar alias (image/jpg -> image/jpeg)
  const ct = contentType === "image/jpg" ? "image/jpeg" : contentType;
  if (!filename || !ct || !(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(ct)) {
    return NextResponse.json({ error: "filename y contentType image/jpeg|png|webp requeridos" }, { status: 400 });
  }
  if (contentLength !== undefined && (!Number.isInteger(contentLength) || contentLength <= 0 || contentLength > MAX_UPLOAD_BYTES)) {
    return NextResponse.json({ error: "contentLength max 5MB" }, { status: 400 });
  }

  const safe = filename.replace(/[^a-zA-Z0-9.-]/g, "-").slice(0, 80) || "foto";
  const rand = crypto.randomUUID().slice(0, 8);

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true, // URL con host de cuenta (ya permitido por CSP), no virtual-hosted
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });

  if (isDoc) {
    // Documentos: bucket privado, sin URL pública. En BD se guarda la key; la
    // lectura se hace con GET presigned solo para el superadmin.
    const { R2_DOCS_BUCKET } = process.env;
    if (!R2_DOCS_BUCKET) {
      return NextResponse.json(
        { error: "Almacén de documentos no configurado todavía. Prueba en unas horas." },
        { status: 503 }
      );
    }
    if (!docsBucketConfigured()) {
      return NextResponse.json({ error: "R2 docs no configurado" }, { status: 503 });
    }
    const key = `${DOC_KEY_PREFIX}${userId}/${Date.now()}-${rand}-${safe}`;
    const url = await presignDocPut(key, ct);
    return NextResponse.json({ url, key, publicUrl: null });
  }

  const key = `uploads/${userId}/${Date.now()}-${rand}-${safe}`;

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: ct,
      ...(contentLength !== undefined ? { ContentLength: contentLength } : {}),
    }),
    { expiresIn: 300 }
  );

  const publicUrl = NEXT_PUBLIC_R2_PUBLIC_URL ? `${NEXT_PUBLIC_R2_PUBLIC_URL}/${key}` : key;
  return NextResponse.json({ url, key, publicUrl });
}
