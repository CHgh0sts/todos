import { getPostById } from '@/lib/blogData'

export async function generateMetadata({ params }) {
  const post = getPostById(parseInt(params.id))
  
  if (!post) {
    return {
      title: 'Article non trouvé - Blog CollabWave',
      description: 'L\'article que vous recherchez n\'existe pas.',
    }
  }

  return {
    title: `${post.title} - Blog CollabWave`,
    description: post.excerpt,
    keywords: `${post.tags.join(', ')}, CollabWave, blog, ${post.category.toLowerCase()}`,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'fr_FR',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function BlogPostLayout({ children }) {
  return (
    <>
      {children}
    </>
  )
} 