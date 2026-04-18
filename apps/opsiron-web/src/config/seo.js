import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { SITE_META } from '../../constants/content';

/**
 * Opsiron SEO Component
 * Sayfa bazlı meta etiketlerini, başlıkları ve sosyal medya paylaşımlarını yönetir.
 *
 * Title formatı:
 *   - Ana sayfa (title prop yok):  "Opsiron - Web Design Studio"
 *   - Diğer sayfalar:              "Hakkımızda - Opsiron Web Design Studio"
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  type = 'website'
}) {
  const location = useLocation();

  const siteUrl = SITE_META.siteUrl;
  const currentUrl = `${siteUrl}${location.pathname === '/' ? '' : location.pathname}`;

  // title prop gelirse → "Sayfa Adı - Opsiron Web Design Studio"
  // gelmezse         → "Opsiron - Web Design Studio" (defaultTitle)
  const metaTitle = title
    ? `${title} - Opsiron Web Design Studio`
    : SITE_META.defaultTitle;

  const metaDescription = description || SITE_META.defaultDescription;

  const metaKeywords = keywords
    ? (Array.isArray(keywords) ? keywords.join(', ') : keywords)
    : SITE_META.defaultKeywords.join(', ');

  const rawImage = image || SITE_META.ogImage;
  const metaImage = rawImage.startsWith('http')
    ? rawImage
    : `${siteUrl}${rawImage}`;

  return (
    <Helmet>
      {/* Standart Meta Etiketleri */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={SITE_META.author} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={SITE_META.siteName} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={SITE_META.social.twitter} />
      <meta name="twitter:site" content={SITE_META.social.twitter} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  image: PropTypes.string,
  type: PropTypes.string,
};