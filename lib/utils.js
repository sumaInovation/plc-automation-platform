// Cloudinary URL එකකට OG-image-friendly transformation එකක් (exact dimensions) inject කරනවා
export function ogImageUrl(cloudinaryUrl, width = 1200, height = 630) {
  if (!cloudinaryUrl) return null;
  return cloudinaryUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
}