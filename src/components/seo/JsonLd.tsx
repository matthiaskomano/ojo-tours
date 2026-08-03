interface JsonLdProps {
  data: Record<string, any>
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Helper functions for common structured data types
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OJO Tours',
    description: 'Luxury Rwanda Safaris and African Adventure Tours',
    url: 'https://ojotours.com',
    logo: 'https://ojotours.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+250-788-000-000',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://www.facebook.com/ojotours',
      'https://www.instagram.com/ojotours',
      'https://www.twitter.com/ojotours',
    ],
  }
}

export function tourJsonLd(tour: {
  title: string
  description: string
  location: string
  price: string
  duration: string
  image: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    location: {
      '@type': 'Place',
      name: tour.location,
    },
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    duration: tour.duration,
    image: tour.image,
    url: `https://ojotours.com/tours/${tour.title}`,
  }
}

export function lodgeJsonLd(lodge: {
  name: string
  description: string
  location: string
  price: string
  image: string
  amenities: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: lodge.name,
    description: lodge.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: lodge.location,
      addressCountry: 'RW',
    },
    offers: {
      '@type': 'Offer',
      price: lodge.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    amenityFeature: lodge.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
    })),
    image: lodge.image,
    url: `https://ojotours.com/lodges/${lodge.name}`,
  }
}

export function articleJsonLd(article: {
  title: string
  description: string
  author: string
  publishedAt: string
  image: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    image: article.image,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: 'OJO Tours',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ojotours.com/logo.png',
      },
    },
  }
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'OJO Tours',
    description: 'Luxury Rwanda Safaris and African Adventure Tours',
    url: 'https://ojotours.com',
    telephone: '+250-788-000-000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-1.9509',
      longitude: '30.0564',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$$',
  }
}
