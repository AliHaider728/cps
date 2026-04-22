import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const UPLOAD_BUCKET = "uploads";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured. File uploads will fail.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "", {
  auth: { persistSession: false },
});

/**
 * Upload a file directly to Supabase Storage from the frontend.
 * Returns { publicUrl, path, fileName } on success.
 */
export async function uploadFileToSupabase(file, options = {}) {
  if (!file) throw new Error("No file provided");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const safeName = (file.name || "upload.bin")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 100);

  const filePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

  const { error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[Supabase Upload Error]", error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(UPLOAD_BUCKET)
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    path: filePath,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size || 0,
  };
}

/**
 * Upload multiple files to Supabase Storage.
 * Returns array of upload results.
 */
export async function uploadFilesToSupabase(files, options = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided");
  }
  return Promise.all(files.map(file => uploadFileToSupabase(file, options)));
}

export default supabase;
