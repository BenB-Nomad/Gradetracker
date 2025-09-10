export function getSiteUrl(): string {
  // Prefer explicit env; fallback to dev default port 3002
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
}


