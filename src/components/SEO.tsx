
import React from 'react';
import { Helmet } from "react-helmet";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  schema?: Record<string, any>[];
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "Discover a curated collection of books, perfumes, and essentials at Naaz Book Depot. Shop online with fast delivery and excellent customer service.",
  canonical,
  image = "/images/naaz-og-image.jpg",
  schema,
  type = "website"
}) => {
  const siteUrl = window.location.origin;
  const url = canonical ? `${siteUrl}${canonical}` : window.location.href;
  const fullTitle = `${title} | Naaz Book Depot`;
  
  // Base schema for the website
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Naaz Book Depot",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  
  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Naaz Book Depot",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-123-456-7890",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/naazbookdepot",
      "https://www.instagram.com/naazbookdepot",
      "https://twitter.com/naazbookdepot"
    ]
  };
  
  // Combine with custom schema if provided
  const fullSchema = [baseSchema, organizationSchema];
  if (schema && Array.isArray(schema)) {
    fullSchema.push(...schema);
  }
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(fullSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;
