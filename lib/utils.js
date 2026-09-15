// Cloudinary URL එකකට OG-image-friendly transformation එකක් + fallback එකක්
export function ogImageUrl(cloudinaryUrl, width = 1200, height = 630) {
  const FALLBACK = 'https://www.sumaautomation.lk/og-default.jpg';

  if (!cloudinaryUrl) return FALLBACK;

  // Cloudinary URL ekak nam exact size eka inject karanawa
  if (cloudinaryUrl.includes('/upload/')) {
    // f_jpg dala whatsapp ta friendly karanawa, webp nathuwa
    return cloudinaryUrl.replace(
      '/upload/', 
      `/upload/w_${width},h_${height},c_fill,f_jpg,q_auto/`
    );
  }

  // Cloudinary nemei nam absolute URL ekak da kiyala balala return karanawa
  return cloudinaryUrl;
}