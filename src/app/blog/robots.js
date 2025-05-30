export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/blog/',
      disallow: [],
    },
    sitemap: 'https://collabwave.com/blog/sitemap.xml', // Remplacez par votre domaine réel
  }
} 