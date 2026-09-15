export function ogImageUrl(cloudinaryUrl, width = 1200, height = 630) {
  const FALLBACK = 'https://www.sumaautomation.lk/og-default.png';
  if (!cloudinaryUrl) return FALLBACK;
  // payment-slips folder eke image ekak nam fallback danna
  if (cloudinaryUrl.includes('payment-slips')) return FALLBACK;
  if (cloudinaryUrl.includes('/upload/')) {
    return cloudinaryUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill,f_jpg,q_auto/`);
  }
  return cloudinaryUrl;
}