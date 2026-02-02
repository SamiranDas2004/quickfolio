# 🚀 Advanced SEO Techniques for Quickfolio

## 1. Dynamic Sitemap with User Portfolios

Create `/app/sitemap-users.ts` to include all user portfolios:

```typescript
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://quickfolio.in'
  
  // Fetch all public user portfolios
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/public`, {
    next: { revalidate: 3600 }
  })
  const users = await response.json()
  
  const userUrls = users.map((user: any) => ({
    url: `${baseUrl}/${user.username}`,
    lastModified: new Date(user.updated_at || user.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return userUrls
}
```

Then create sitemap index at `/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://quickfolio.in/sitemap-main.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://quickfolio.in/sitemap-users.xml',
      lastModified: new Date(),
    },
  ]
}
```

## 2. Breadcrumb Schema

Add to user portfolio pages:

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://quickfolio.in"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": user.name,
      "item": `https://quickfolio.in/${username}`
    }
  ]
}
```

## 3. Person Schema for User Portfolios

Add to `/components/UserStructuredData.tsx`:

```typescript
export default function UserStructuredData({ user }: { user: User }) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.name,
    "jobTitle": user.title,
    "description": user.bio,
    "image": user.avatar_url,
    "url": `https://quickfolio.in/${user.username}`,
    "sameAs": [
      user.contact?.linkedin,
      user.contact?.github,
      user.contact?.twitter,
    ].filter(Boolean),
    "knowsAbout": user.skills?.map(s => s.name) || [],
  }

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": user.name,
      "description": user.bio,
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
    </>
  )
}
```

## 4. Article Schema for Blog Posts

When you create blog section:

```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How to Create a Professional Portfolio",
  "image": "https://quickfolio.in/blog/portfolio-guide.jpg",
  "author": {
    "@type": "Organization",
    "name": "Quickfolio"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Quickfolio",
    "logo": {
      "@type": "ImageObject",
      "url": "https://quickfolio.in/logo.png"
    }
  },
  "datePublished": "2025-01-01",
  "dateModified": "2025-01-01",
  "description": "Learn how to create a professional portfolio that stands out"
}
```

## 5. Video Schema

If you add tutorial videos:

```typescript
const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "How to Use Quickfolio",
  "description": "Complete guide to creating your portfolio with Quickfolio",
  "thumbnailUrl": "https://quickfolio.in/video-thumbnail.jpg",
  "uploadDate": "2025-01-01",
  "duration": "PT5M30S",
  "contentUrl": "https://quickfolio.in/videos/tutorial.mp4",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID"
}
```

## 6. Review Schema

When you have user reviews:

```typescript
const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Quickfolio",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "John Doe"
      },
      "datePublished": "2025-01-01",
      "reviewBody": "Amazing portfolio builder! Got me hired in 2 weeks.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      }
    }
  ]
}
```

## 7. HowTo Schema

For tutorial pages:

```typescript
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Portfolio with Quickfolio",
  "description": "Step-by-step guide to creating your professional portfolio",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Sign Up",
      "text": "Create your Quickfolio account",
      "url": "https://quickfolio.in/signup"
    },
    {
      "@type": "HowToStep",
      "name": "Upload Data",
      "text": "Upload your resume or LinkedIn profile",
      "url": "https://quickfolio.in/dashboard"
    },
    {
      "@type": "HowToStep",
      "name": "Customize",
      "text": "Customize your portfolio design and content",
      "url": "https://quickfolio.in/dashboard"
    }
  ]
}
```

## 8. Local Business Schema (if applicable)

```typescript
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Quickfolio",
  "image": "https://quickfolio.in/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Your Street",
    "addressLocality": "Your City",
    "addressRegion": "Your State",
    "postalCode": "12345",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 0.0,
    "longitude": 0.0
  },
  "url": "https://quickfolio.in",
  "telephone": "+91-XXXXXXXXXX",
  "priceRange": "Free - $$$"
}
```

## 9. Advanced Meta Tags

Add to specific pages:

```typescript
// For pricing page
export const metadata: Metadata = {
  title: 'Pricing - Quickfolio',
  description: 'Affordable pricing plans for everyone. Start free, upgrade as you grow.',
  openGraph: {
    title: 'Quickfolio Pricing - Plans for Everyone',
    description: 'Start free, upgrade as you grow',
    url: 'https://quickfolio.in/pricing',
  },
  alternates: {
    canonical: 'https://quickfolio.in/pricing',
  },
}

// For examples page
export const metadata: Metadata = {
  title: 'Portfolio Examples - Quickfolio',
  description: 'Browse stunning portfolio examples created with Quickfolio. Get inspired!',
  openGraph: {
    title: 'Portfolio Examples - Quickfolio',
    description: 'Browse stunning portfolio examples',
    url: 'https://quickfolio.in/examples',
  },
  alternates: {
    canonical: 'https://quickfolio.in/examples',
  },
}
```

## 10. Hreflang Tags (International SEO)

For multi-language support:

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://quickfolio.in',
    languages: {
      'en-US': 'https://quickfolio.in',
      'es-ES': 'https://quickfolio.in/es',
      'fr-FR': 'https://quickfolio.in/fr',
      'de-DE': 'https://quickfolio.in/de',
    },
  },
}
```

## 11. Preload Critical Resources

Add to layout:

```typescript
<head>
  <link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" href="/logo.png" as="image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
</head>
```

## 12. RSS Feed

Create `/app/feed.xml/route.ts`:

```typescript
export async function GET() {
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Quickfolio Blog</title>
    <link>https://quickfolio.in</link>
    <description>Latest updates from Quickfolio</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <!-- Add blog posts here -->
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

## 13. Security Headers

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}
```

## 14. Image Optimization

Best practices:

```typescript
// Use Next.js Image component
<Image
  src="/portfolio.jpg"
  alt="Professional portfolio example"
  width={1200}
  height={630}
  priority // For above-the-fold images
  placeholder="blur" // For better UX
  quality={85} // Balance quality and size
/>

// Lazy load below-the-fold images
<Image
  src="/example.jpg"
  alt="Portfolio example"
  width={800}
  height={600}
  loading="lazy"
/>
```

## 15. Core Web Vitals Optimization

### LCP (Largest Contentful Paint)
```typescript
// Preload hero image
<link rel="preload" as="image" href="/hero.jpg" />

// Use priority for hero images
<Image src="/hero.jpg" priority />
```

### CLS (Cumulative Layout Shift)
```typescript
// Always specify image dimensions
<Image src="/logo.png" width={200} height={50} />

// Reserve space for dynamic content
<div className="min-h-[400px]">
  {/* Dynamic content */}
</div>
```

### FID (First Input Delay)
```typescript
// Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loader />,
})

// Defer non-critical scripts
<Script src="/analytics.js" strategy="lazyOnload" />
```

## 16. Advanced Analytics Events

Track important user actions:

```typescript
// Track portfolio creation
gtag('event', 'portfolio_created', {
  'event_category': 'engagement',
  'event_label': 'user_portfolio',
})

// Track template selection
gtag('event', 'template_selected', {
  'event_category': 'engagement',
  'event_label': template_name,
})

// Track conversions
gtag('event', 'conversion', {
  'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
  'value': 1.0,
  'currency': 'USD'
})
```

## 17. A/B Testing for SEO

Test different title tags and descriptions:

```typescript
// Version A
title: "Quickfolio - AI Portfolio Builder"

// Version B
title: "Create Your Portfolio in Minutes - Quickfolio"

// Track which performs better in Search Console
```

## 18. Voice Search Optimization

Optimize for conversational queries:

```typescript
// Add FAQ schema with natural language
{
  "@type": "Question",
  "name": "What is the best portfolio builder?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Quickfolio is an AI-powered portfolio builder that helps you create professional portfolios in minutes."
  }
}
```

## 19. Featured Snippets Optimization

Structure content for featured snippets:

```html
<!-- For list snippets -->
<h2>How to Create a Portfolio</h2>
<ol>
  <li>Sign up for Quickfolio</li>
  <li>Upload your resume</li>
  <li>Customize your design</li>
  <li>Publish your portfolio</li>
</ol>

<!-- For table snippets -->
<table>
  <tr>
    <th>Plan</th>
    <th>Price</th>
    <th>Features</th>
  </tr>
  <!-- Data rows -->
</table>
```

## 20. Link Juice Distribution

Internal linking strategy:

```typescript
// Link from high-authority pages to important pages
<Link href="/pricing">View Pricing</Link>
<Link href="/examples">See Examples</Link>

// Use descriptive anchor text
<Link href="/ai-portfolio-builder">
  Learn about our AI-powered portfolio builder
</Link>

// Add related content links
<aside>
  <h3>Related Articles</h3>
  <ul>
    <li><Link href="/blog/portfolio-tips">Portfolio Tips</Link></li>
    <li><Link href="/blog/design-guide">Design Guide</Link></li>
  </ul>
</aside>
```

---

## Implementation Priority

### Phase 1 (Week 1-2)
- [ ] Dynamic sitemap with user portfolios
- [ ] Person schema for user pages
- [ ] Breadcrumb schema
- [ ] Security headers

### Phase 2 (Week 3-4)
- [ ] Blog section with Article schema
- [ ] Review schema
- [ ] Advanced analytics events
- [ ] Image optimization

### Phase 3 (Month 2)
- [ ] Video schema (if adding videos)
- [ ] HowTo schema for tutorials
- [ ] RSS feed
- [ ] A/B testing

### Phase 4 (Month 3+)
- [ ] International SEO
- [ ] Voice search optimization
- [ ] Featured snippets optimization
- [ ] Advanced link building

---

**Remember**: Implement these techniques gradually. Focus on what provides the most value for your users first!
