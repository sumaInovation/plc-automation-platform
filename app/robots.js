export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/cart', '/checkout','/dashboard'],
    },
    sitemap: 'https://sumaautomation.lk/sitemap.xml',
  };
}