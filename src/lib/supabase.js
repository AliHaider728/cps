import { createClient } from "@supabase/supabase-js";

// ================================
// 🔥 ENV + FALLBACK CONFIG
// ================================
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ekbyvomfqudpzaxagytw.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_M3i7r8Ff6vrVIiVaOQ_BKA_M6X-yLvE";

const UPLOAD_BUCKET = "uploads";

// ================================
// ⚠️ WARNING (NO CRASH MODE)
// ================================
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[Supabase] Missing env vars → using fallback config"
  );
}

// ================================
// 🚀 SUPABASE CLIENT
// ================================
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// ================================
// 📤 SINGLE FILE UPLOAD
// ================================
export async function uploadFileToSupabase(file) {
  if (!file) throw new Error("No file provided");

  const safeName = (file.name || "upload.bin")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .slice(0, 100);

  const filePath = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}-${safeName}`;

  const { error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
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

// ================================
// 📦 MULTIPLE FILE UPLOAD
// ================================
export async function uploadFilesToSupabase(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("No files provided");
  }

  return Promise.all(
    files.map((file) => uploadFileToSupabase(file))
  );
}

export default supabase;