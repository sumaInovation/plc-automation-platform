// lib/utils.js
export function ogImageUrl(url) {
  const FALLBACK = 'https://www.sumaautomation.lk/og-default.jpg';
  if (!url) return FALLBACK;
  if (url.startsWith('/')) return `https://www.sumaautomation.lk${url}`;
  if (url.includes('/upload/')) {
    if (url.includes('w_1200')) return url;
    return url.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_jpg,q_auto/');
  }
  return url;
}