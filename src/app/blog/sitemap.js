import { blogPosts } from '@/lib/blogData'

export default function sitemap() {
  const baseUrl = 'https://collabwave.com' // Remplacez par votre domaine réel
  
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: post.featured ? 0.9 : 0.7,
  }))

  return [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogUrls,
  ]
} 