import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Route links are private and expire in ten minutes; they have no business in an index.
 * The signing pages also carry `robots: noindex` in their own metadata — this is the
 * belt to that pair of braces.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/tx/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
