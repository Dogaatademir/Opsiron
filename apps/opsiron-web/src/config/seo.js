import { SITE_META, CONTACT_INFO, PAGE_SEO } from '../constants/content';

/**
 * Opsiron SEO Configuration & Structured Data
 *
 * Bu dosya iki şey yapar:
 * 1. defaultMeta — Tüm sayfalarda geçerli olan temel SEO yapılandırması.
 * 2. structuredData — Google'ın Rich Results olarak gösterebileceği JSON-LD şemaları.
 *
 * Neden JSON-LD önemli?
 * Google, yapılandırılmış veriyi okuyarak sitenizi arama sonuçlarında
 * daha zengin biçimde (yıldız, adres, breadcrumb, servis listesi vb.) gösterebilir.
 * Bir web design stüdyosu olarak bu şemaları doğru kullanmak hem SEO açısından
 * avantaj sağlar hem de teknik yetkinliği yansıtır.
 */

// ============================================
// DEFAULT META CONFIGURATION
// ============================================
export const defaultMeta = {
  title: SITE_META.defaultTitle,
  titleTemplate: `%s | ${SITE_META.siteName}`,
  description: SITE_META.defaultDescription,
  canonical: SITE_META.siteUrl,
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_META.siteUrl,
    site_name: SITE_META.siteName,
    images: [
      {
        url: `${SITE_META.siteUrl}${SITE_META.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${SITE_META.siteName} — Opsiron — Web Design Stüdyosu`,
      },
    ],
  },
  twitter: {
    handle: SITE_META.social.twitter,
    site: SITE_META.social.twitter,
    cardType: 'summary_large_image',
  },
};

// ============================================
// JSON-LD STRUCTURED DATA GENERATORS
// ============================================

export const structuredData = {

  /**
   * LocalBusiness Şeması — ANA ŞEMA
   *
   * Google'ın bir işletmeyi yerel arama sonuçlarında tanıması için
   * en kritik şemadır. "web tasarım Ankara" gibi aramalarda
   * Knowledge Panel ve yerel paket sonuçlarına girebilmek için gereklidir.
   *
   * @type ProfessionalService (LocalBusiness'ın alt türü)
   */
  localBusiness: () => ({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_META.siteUrl}/#organization`,
    name: SITE_META.siteName,
    legalName: 'Opsiron Web Design Studio',
    description:
      'Markalara özel web sitesi tasarımı ve geliştirme hizmeti sunan butik web design stüdyosu. Hazır şablon kullanmadan, markanın kimliğine özel dijital deneyimler tasarlanır.',
    url: SITE_META.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_META.siteUrl}/OpsironLogo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_META.siteUrl}${SITE_META.ogImage}`,
    telephone: CONTACT_INFO.phoneRaw,
    email: CONTACT_INFO.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: CONTACT_INFO.address.city,
      addressCountry: 'TR',
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Türkiye',
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
        ],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      `https://twitter.com/${SITE_META.social.twitter.replace('@', '')}`,
      `https://linkedin.com/company/${SITE_META.social.linkedin}`,
      `https://instagram.com/${SITE_META.social.instagram}`,
    ],
    priceRange: '₺₺',
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Banka Havalesi, EFT',
    foundingDate: String(SITE_META.foundingYear || 2025),
    knowsLanguage: ['tr', 'en'],
  }),

  /**
   * WebSite Şeması
   *
   * Google'ın Sitelinks Searchbox özelliğini etkinleştirebilir.
   * Arama motoruna sitenizin genel yapısı hakkında sinyal verir.
   */
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_META.siteUrl}/#website`,
    name: SITE_META.siteName,
    url: SITE_META.siteUrl,
    description: SITE_META.defaultDescription,
    inLanguage: 'tr-TR',
    publisher: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
  }),

  /**
   * WebPage Şeması
   *
   * Sayfa bazlı olarak tanımlanır. Her sayfanın
   * başlığı, açıklaması ve URL'si otomatik olarak doldurulur.
   *
   * @param {string} pageName - Sayfa adı (örn: 'home', 'about', 'services')
   * @param {string} path - Sayfa yolu (örn: '/', '/about')
   */
  webPage: (pageName, path) => {
    const seo = PAGE_SEO[pageName] || {};
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_META.siteUrl}${path}#webpage`,
      url: `${SITE_META.siteUrl}${path}`,
      name: seo.title || SITE_META.defaultTitle,
      description: seo.description || SITE_META.defaultDescription,
      inLanguage: 'tr-TR',
      isPartOf: {
        '@id': `${SITE_META.siteUrl}/#website`,
      },
      about: {
        '@id': `${SITE_META.siteUrl}/#organization`,
      },
    };
  },

  /**
   * Service Şeması
   *
   * Sunduğunuz her hizmetin ayrı ayrı tanımlanmasını sağlar.
   * Google'ın "web tasarım hizmeti" aramaları için sinyaller üretir.
   *
   * @param {Object} service - Hizmet nesnesi (SERVICES array'inden)
   */
  service: (service) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.desc,
    provider: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Türkiye',
    },
    serviceType: 'Web Design & Development',
    url: `${SITE_META.siteUrl}/services`,
  }),

  /**
   * ItemList Şeması — Hizmetler Listesi
   *
   * Tüm hizmetleri tek bir liste olarak tanımlar.
   * Google, bunu arama sonuçlarında listelenmiş olarak gösterebilir.
   *
   * @param {Array} services - SERVICES array'i
   */
  serviceList: (services) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE_META.siteName} Hizmetleri`,
    description: 'Opsiron Web Design Stüdyosunun sunduğu web tasarım ve geliştirme hizmetleri.',
    url: `${SITE_META.siteUrl}/services`,
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: service.title,
      description: service.desc,
      url: `${SITE_META.siteUrl}/services`,
    })),
  }),

  /**
   * CreativeWork / Portfolio Şeması
   *
   * Portfolyo projelerini yapılandırılmış veri olarak tanımlar.
   * Google'ın projeyi bir yaratıcı çalışma olarak anlamasını sağlar.
   *
   * @param {Object} project - Proje nesnesi (PROJECTS array'inden)
   */
  portfolioItem: (project) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: project.description,
    creator: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
    dateCreated: project.year,
    genre: project.category,
    url: project.url || `${SITE_META.siteUrl}/work`,
    image: project.image,
    keywords: project.tags?.join(', '),
  }),

  /**
   * Breadcrumb Şeması
   *
   * Sayfa hiyerarşisini gösterir. Google'ın arama sonuçlarında
   * URL yerine okunabilir yol (örn: Opsiron > Uzmanlıklar) göstermesini sağlar.
   *
   * @param {Array} items - [{ name: 'Hakkımızda', path: '/about' }]
   */
  breadcrumb: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: SITE_META.siteUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: `${SITE_META.siteUrl}${item.path}`,
      })),
    ],
  }),

  /**
   * FAQ Şeması
   *
   * Sıkça sorulan soruları tanımlar. Google, bunları
   * arama sonuçlarında genişletilebilir accordion olarak gösterebilir.
   * (Featured Snippet ve People Also Ask bölümlerine girebilir.)
   *
   * @param {Array} faqs - [{ question: '...', answer: '...' }]
   */
  faq: (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  /**
   * ContactPage Şeması
   *
   * İletişim sayfasını özel olarak işaretler.
   * Google, işletmelerin iletişim bilgilerini daha doğru
   * anlamak için bu şemayı kullanır.
   */
  contactPage: () => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `${SITE_META.siteName} — İletişim`,
    url: `${SITE_META.siteUrl}/contact`,
    description: PAGE_SEO.contact?.description || '',
    mainEntity: {
      '@id': `${SITE_META.siteUrl}/#organization`,
    },
  }),
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * JSON-LD şemasını script tag'e dönüştürür.
 * React bileşenlerinde dangerouslySetInnerHTML ile kullanılır.
 *
 * Kullanım:
 *   <script
 *     type="application/ld+json"
 *     dangerouslySetInnerHTML={toJsonLd(structuredData.localBusiness())}
 *   />
 *
 * @param {Object} schema - JSON-LD nesnesi
 */
export const toJsonLd = (schema) => ({
  __html: JSON.stringify(schema),
});

/**
 * Canonical URL oluşturur.
 * Duplicate content sorunlarını önlemek için her sayfada kullanılır.
 *
 * @param {string} path - Sayfa yolu (örn: '/about')
 */
export const canonicalUrl = (path = '') => {
  const cleanPath = path === '/' ? '' : path;
  return `${SITE_META.siteUrl}${cleanPath}`;
};