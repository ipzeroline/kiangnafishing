import crypto from "node:crypto";

type CloudinaryUploadOptions = {
  folder: string;
  publicId?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

function cloudinaryEnv(name: string) {
  return process.env[name] || "";
}

export function isCloudinaryConfigured() {
  return Boolean(cloudinaryEnv("CLOUDINARY_CLOUD_NAME") && cloudinaryEnv("CLOUDINARY_API_KEY") && cloudinaryEnv("CLOUDINARY_API_SECRET"));
}

function signUploadParams(params: Record<string, string>, apiSecret: string) {
  const source = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(`${source}${apiSecret}`).digest("hex");
}

export async function uploadImageToCloudinary(file: string, options: CloudinaryUploadOptions): Promise<string> {
  if (!file || file === "/fish-placeholder.svg") return file;
  if (!isCloudinaryConfigured()) return file;
  if (file.includes("/res.cloudinary.com/")) return file;

  const cloudName = cloudinaryEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = cloudinaryEnv("CLOUDINARY_API_KEY");
  const apiSecret = cloudinaryEnv("CLOUDINARY_API_SECRET");
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params: Record<string, string> = {
    folder: options.folder,
    timestamp,
  };
  if (options.publicId) params.public_id = options.publicId;

  const form = new FormData();
  form.set("file", file);
  form.set("api_key", apiKey);
  form.set("timestamp", timestamp);
  form.set("folder", options.folder);
  form.set("signature", signUploadParams(params, apiSecret));
  if (options.publicId) form.set("public_id", options.publicId);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;
  if (!res.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }
  return data.secure_url;
}
