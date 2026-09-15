// lib/utils.js - FINAL
export function ogImageUrl(url) {
  const FALLBACK = 'https://www.sumaautomation.lk/og-default.jpg';
  if (!url) return FALLBACK;
  if (url.startsWith('/')) return `https://www.sumaautomation.lk${url}`;

  // Cloudinary nam original eka ma return karanawa, transform karanne na - 429 enna epa
  return url;
}