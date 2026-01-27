import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
}

const SITE_NAME = "Digi Best Tools";

export function SEO({ title, description, canonicalUrl }: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
}

export function HomeSEO() {
  return (
    <SEO
      title="Free Online SEO & Utility Tools"
      description="Access 37+ free online tools for SEO, image editing, text processing, calculators, and more. No sign-up required. Word counter, image compressor, QR code generator, and much more."
    />
  );
}
