export const metadata = {
  title: 'Blog CollabWave - Conseils et Guides pour la Collaboration d\'Équipe',
  description: 'Découvrez nos articles, conseils et guides pour optimiser votre productivité et améliorer la collaboration de votre équipe avec CollabWave.',
  keywords: 'blog, collaboration, productivité, gestion de projets, équipe, conseils, guides, CollabWave',
  openGraph: {
    title: 'Blog CollabWave - Conseils et Guides pour la Collaboration d\'Équipe',
    description: 'Découvrez nos articles, conseils et guides pour optimiser votre productivité et améliorer la collaboration de votre équipe.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog CollabWave - Conseils et Guides pour la Collaboration d\'Équipe',
    description: 'Découvrez nos articles, conseils et guides pour optimiser votre productivité et améliorer la collaboration de votre équipe.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogLayout({ children }) {
  return (
    <>
      {children}
    </>
  )
} 