import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Almacén PRIVADO de documentos de identidad (DNI/pasaporte): bucket R2 sin
// acceso público (SOC2 CC6.6, RGPD art. 32). Los archivos se suben con PUT
// presigned y se leen con GET presigned de corta vida, emitido solo para el
// superadmin (comparación en la revisión de identidad). En BD se guarda la
// KEY (prefijo "docs/"), nunca una URL pública.
export const DOC_KEY_PREFIX = "docs/";

export function docsBucketConfigured(): boolean {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_DOCS_BUCKET } = process.env;
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_DOCS_BUCKET);
}

function docsClient(): S3Client {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_DOCS_BUCKET } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_DOCS_BUCKET) {
    throw new Error("DOCS_BUCKET_NO_CONFIGURADO");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
}

export async function presignDocPut(key: string, contentType: string): Promise<string> {
  const client = docsClient();
  const bucket = process.env.R2_DOCS_BUCKET!;
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );
}

export async function presignDocGet(key: string, expiresIn = 300): Promise<string> {
  const client = docsClient();
  const bucket = process.env.R2_DOCS_BUCKET!;
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    // La URL presigned escapa del panel al volverse <img src>: vida corta.
    { expiresIn }
  );
}

// ¿El dato guardado en BD es una key del bucket privado (nuevo flujo)?
// Las URLs http(s) antiguas apuntan al bucket público: no se re-sirven.
export function isDocKey(v: string | null | undefined): v is string {
  return !!v && !v.startsWith("http");
}

// Borrado físico de documentos del bucket privado (RGPD art. 17 — la política de
// privacidad promete que «los documentos de identidad se borran tras la
// verificación»). Best-effort: si un objeto no se puede borrar se loguea y se
// devuelve false para que el caller lo registre en el audit log.
export async function deleteDocObjects(keys: (string | null | undefined)[]): Promise<boolean> {
  const targets = keys.filter((k): k is string => isDocKey(k));
  if (targets.length === 0) return true;
  if (!docsBucketConfigured()) {
    console.error("deleteDocObjects: DOCS_BUCKET_NO_CONFIGURADO");
    return false;
  }
  const client = docsClient();
  const bucket = process.env.R2_DOCS_BUCKET!;
  let allOk = true;
  for (const key of targets) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    } catch (e) {
      allOk = false;
      console.error("deleteDocObjects fail:", key, e);
    }
  }
  return allOk;
}
