import imageCompression from "browser-image-compression";
import { supabase } from "@/clients/supabaseClient";

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1, // cap at 1MB
    maxWidthOrHeight: 1280, // resize if larger than this
    useWebWorker: true, // keeps the UI thread unblocked
  });
}

export async function uploadRecipeImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const filePath = `${file.name}-${crypto.randomUUID()}`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(filePath, compressed, {
      contentType: compressed.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
