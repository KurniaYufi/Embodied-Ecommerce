import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { del, put } from "@vercel/blob";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Vercel's filesystem is read-only and ephemeral, so deployed uploads go to Vercel Blob. Locally
 * (no Blob token) files are written to public/uploads as before.
 */
function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function isBlobUrl(url: string): boolean {
  return /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(url);
}

export async function saveUpload(file: File, directory: string): Promise<string> {
  const ext = (path.extname(file.name) || "").toLowerCase();
  const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;

  if (blobConfigured()) {
    const blob = await put(`${directory}/${filename}`, file, {
      access: "public",
      contentType: file.type || undefined,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new Error("File uploads are not configured: connect a Vercel Blob store to this project.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOADS_ROOT, directory);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${directory}/${filename}`;
}

export async function deleteUpload(urlPath: string | null | undefined): Promise<void> {
  if (!urlPath) return;

  if (isBlobUrl(urlPath)) {
    if (!blobConfigured()) return;
    try {
      await del(urlPath);
    } catch {
      // Already gone or not ours — nothing to clean up.
    }
    return;
  }

  // Only files we uploaded ourselves; bundled assets such as /images/products are never deleted.
  if (!urlPath.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", urlPath));
  } catch {
    // ignore missing file
  }
}
