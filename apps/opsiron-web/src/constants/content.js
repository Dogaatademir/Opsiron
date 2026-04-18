// src/constants/content.js

/**
 * Opsiron Web Sitesi — Merkezi İçerik Yönetimi
 * Tüm hardcoded içerikler bu dosyada toplanmıştır.
 * Yeni kimlik: Butik Web Design Stüdyosu
 */

// ============================================
// SITE META BİLGİLERİ
// ============================================
export const SITE_META = {
  siteName: "Opsiron",
  tagline: "Markanın Dijital Yüzü",
  domain: "opsiron.com",
  siteUrl: "https://opsiron.com",
  author: "Opsiron Web Design Studio",
  foundedYear: 2025,

  // Default SEO — Ana sayfa için
  defaultTitle: "Opsiron — Butik Web Design Stüdyosu | Ankara",
  defaultDescription:
    "Markalara özel web sitesi tasarımı ve geliştirme. Hazır şablon yok, kopyalanmış tasarım yok — yalnızca markanıza özel, estetik ve işlevsel dijital deneyimler.",
  defaultKeywords: [
    "web tasarım",
    "web tasarım Ankara",
    "web sitesi tasarımı",
    "özel web sitesi",
    "web design stüdyo",
    "marka web sitesi",
    "butik web tasarım",
    "React web geliştirme",
    "kurumsal web sitesi",
    "web sitesi yaptırma",
  ],

  // Sosyal Medya
  social: {
    twitter: "@opsiron",
    linkedin: "opsiron",
    instagram: "opsiron",
  },

  // Open Graph
  ogImage: "/og-image.png", // 1200x630
  ogType: "website",
};

// ============================================
// SAYFA BAZLI SEO BİLGİLERİ
// ============================================
export const PAGE_SEO = {
  home: {
    title: "Opsiron — Butik Web Design Stüdyosu | Markanıza Özel Web Sitesi",
    description:
      "Hazır şablondan değil, markanızın kimliğinden doğan web siteleri. Ankara merkezli butik web design stüdyosu Opsiron ile dijitalde doğru görünün.",
    keywords: [
      "web tasarım Ankara",
      "özel web sitesi tasarımı",
      "butik web design",
      "marka web sitesi",
      "web sitesi yaptırma",
      "profesyonel web tasarım",
    ],
  },
  about: {
    title: "Hakkımızda — Opsiron Web Design Stüdyosu",
    description:
      "Opsiron, markalara özel dijital deneyimler tasarlayan butik bir web design stüdyosudur. Her projeye sıfırdan bakar, hazır kalıplara dayanmaz.",
    keywords: [
      "opsiron hakkında",
      "web design stüdyo",
      "butik web tasarım ekibi",
      "Ankara web tasarımcı",
    ],
  },
  work: {
    title: "Seçkin İşler — Opsiron Portfolyo",
    description:
      "Opsiron'un markalara özel tasarladığı web sitelerinden seçkin örnekler. E-ticaret, kurumsal, portfolyo ve daha fazlası.",
    keywords: [
      "web tasarım portfolyo",
      "web sitesi örnekleri",
      "opsiron işler",
      "web design örnekleri Türkiye",
    ],
  },
  services: {
    title: "Uzmanlıklar — Web Tasarım & Geliştirme Hizmetleri | Opsiron",
    description:
      "Marka uyumlu web tasarımı, özel web geliştirme, içerik yapısı, responsive deneyim ve teknik bakım. Opsiron'un sunduğu hizmetler.",
    keywords: [
      "web tasarım hizmetleri",
      "web geliştirme Ankara",
      "React web sitesi",
      "özel web sitesi geliştirme",
      "kurumsal web tasarım",
      "e-ticaret web tasarım",
    ],
  },
  contact: {
    title: "İletişim — Projenizi Konuşalım | Opsiron",
    description:
      "Web sitesi projeniz için Opsiron ile iletişime geçin. Markanızı dinleyelim, dijital yolculuğunuzu birlikte planlayalım.",
    keywords: [
      "opsiron iletişim",
      "web tasarım teklifi",
      "web sitesi fiyat",
      "web sitesi yaptırmak istiyorum",
    ],
  },
  privacy: {
    title: "Gizlilik Politikası | Opsiron",
    description:
      "Opsiron olarak kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgiler.",
    keywords: ["gizlilik politikası", "veri güvenliği", "opsiron gizlilik"],
  },
  terms: {
    title: "Kullanım Koşulları | Opsiron",
    description:
      "Opsiron web sitesi ve hizmetlerinin kullanımına dair yasal şartlar ve hükümler.",
    keywords: ["kullanım koşulları", "hizmet şartları", "yasal uyarı"],
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni | Opsiron",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında haklarınız ve veri işleme süreçlerimiz.",
    keywords: ["kvkk", "kişisel verilerin korunması", "aydınlatma metni"],
  },
};

// ============================================
// İLETİŞİM BİLGİLERİ
// ============================================
export const CONTACT_INFO = {
  email: "hello@opsiron.com",
  phone: "+90 (537) 690 33 33",
  phoneRaw: "+905376903333",
  address: {
    city: "Ankara",
    country: "Türkiye",
    full: "Ankara / Türkiye",
  },
  workingHours: {
    weekdays: "09:00 - 18:00",
    weekend: "Kapalı",
  },
  responseTime: "24 saat içinde yanıt",
};

// ============================================
// HİZMETLER
// ============================================
export const SERVICES = [
  {
    no: "01",
    title: "Marka Uyumlu Web Tasarımı",
    tagline: "Markanın görünme biçimi.",
    desc: "Hazır şablonlardan tamamen uzak, markanın tonu, estetik dünyası ve hitap ettiği kitleyle birebir uyumlu özel web sitesi tasarımı. Her sayfa, her bölüm ve her detay markanın karakterini taşır.",
    deliverables: [
      "Moodboard & Görsel Yön",
      "Tipografi & Renk Sistemi",
      "UI Tasarımı (Tüm Sayfalar)",
      "Responsive Tasarım",
      "Prototip & Kullanıcı Akışı",
    ],
    ideal: "Yeni kurulan ya da rebranding yapan markalar.",
  },
  {
    no: "02",
    title: "Özel Web Geliştirme",
    tagline: "Hazır hissi vermeyen altyapı.",
    desc: "Tasarımı, markaya özel yapılandırılmış, temiz ve ölçeklenebilir bir kod altyapısına dönüştürüyoruz. Performans, hız ve sürdürülebilirlik ön planda. Hazır theme yok, tekrar eden şablon yok.",
    deliverables: [
      "React / Next.js Geliştirme",
      "CMS Entegrasyonu",
      "SEO Teknik Altyapısı",
      "Performans Optimizasyonu",
      "Deployment & Yayına Alma",
    ],
    ideal: "Güçlü teknik altyapı isteyen markalar.",
  },
  {
    no: "03",
    title: "Marka Sunumu & İçerik Yapısı",
    tagline: "Ne söylendiği kadar nasıl söylendiği.",
    desc: "Sayfa kurgusu, hiyerarşi, bölüm yapısı, metin yönlendirmesi ve kullanıcı akışı. Ziyaretçinin doğru yerde doğru mesajla karşılaşması için içerik mimarisi ve kopya yazımı.",
    deliverables: [
      "Sayfa Mimarisi & Site Haritası",
      "Bölüm Hiyerarşisi",
      "Başlık & Kopya Yazımı",
      "CTA Yapısı",
      "Kullanıcı Akışı Planlaması",
    ],
    ideal: "Mesajını netleştirmek isteyen markalar.",
  },
  {
    no: "04",
    title: "Responsive Deneyim",
    tagline: "Her ekranda aynı kalite.",
    desc: "Masaüstünden mobil ve tablete kadar her ekranda tutarlı, akıcı ve premium görünen bir deneyim. Piksel hassasiyetinde ince ayar. Boyut değil, his değişmez.",
    deliverables: [
      "Mobil Öncelikli Tasarım",
      "Tablet Optimizasyonu",
      "Çapraz Tarayıcı Uyumu",
      "Dokunmatik Etkileşim Detayları",
      "Görünürlük & Erişilebilirlik",
    ],
    ideal: "Mobil trafiği yüksek olan tüm markalar.",
  },
  {
    no: "05",
    title: "Teknik Bakım & Destek",
    tagline: "Teslim sonrası da yanınızdayız.",
    desc: "Site yayına girdikten sonra bitmez. Güncellemeler, içerik düzenlemeleri, teknik sorunlar ve küçük geliştirmeler için düzenli bakım ve hızlı destek. Dijital varlık diri kalır.",
    deliverables: [
      "Aylık Bakım Paketi",
      "İçerik Güncelleme",
      "Hata & Bug Giderimi",
      "Performans İzleme",
      "Öncelikli Destek Hattı",
    ],
    ideal: "Sitenin devamlılığını güvence altına almak isteyen markalar.",
  },
];

// ============================================
// STÜDYO DEĞERLERİ (About Page)
// ============================================
export const STUDIO_VALUES = [
  {
    no: "01",
    title: "Özgünlük",
    desc: "Her marka için sıfırdan düşünmek. Hazır kalıpları tekrar tekrar satmamak.",
  },
  {
    no: "02",
    title: "Uyum",
    desc: "Web sitesini markanın kimliği, tonu, hedef kitlesi ve hizmet modeliyle uyumlu kurmak.",
  },
  {
    no: "03",
    title: "İşlevsellik",
    desc: "Sadece estetik değil; anlaşılır, hızlı, dönüşüm odaklı ve sürdürülebilir çözümler üretmek.",
  },
  {
    no: "04",
    title: "Süreklilik",
    desc: "Teslim sonrası da destek vererek markanın dijital varlığını diri tutmak.",
  },
  {
    no: "05",
    title: "Kalite",
    desc: "Boş alan kullanımı, tipografi, yapı, akış, hız, mobil deneyim — hepsi aynı standardın parçası.",
  },
  {
    no: "06",
    title: "Güven",
    desc: '"Site yaptık bitti" hissi değil, "dijital tarafta arkamda biri var" hissi vermek.',
  },
];

// ============================================
// ÇALIŞMA SÜRECİ (About & Contact Pages)
// ============================================
export const WORKING_PROCESS = [
  {
    step: "01",
    title: "Keşif & Dinleme",
    description:
      "Markanızı, hedef kitlenizi, rakiplerinizi ve dijital hedeflerinizi dinleriz. Projenin doğru temelden başlaması için bu aşama kritiktir.",
  },
  {
    step: "02",
    title: "Vizyon & Kapsam",
    description:
      "Görsel yön, sayfa yapısı, hizmet kapsamı ve zaman planı birlikte netleştirilir. Herkesin aynı sayfada olduğundan emin olunur.",
  },
  {
    step: "03",
    title: "Tasarım",
    description:
      "Markanıza özel tipografi, renk sistemi ve UI tasarımı oluşturulur. Her bölüm, her detay markanın karakterini taşır.",
  },
  {
    step: "04",
    title: "Geliştirme",
    description:
      "Tasarım, temiz ve ölçeklenebilir kod altyapısına dönüştürülür. SEO teknik altyapısı, performans ve erişilebilirlik baştan inşa edilir.",
  },
  {
    step: "05",
    title: "Test & İnceleme",
    description:
      "Tüm cihazlarda, tüm tarayıcılarda test edilir. İnce ayarlar yapılır. Sadece hazır göründüğünde değil, gerçekten hazır olduğunda yayına alınır.",
  },
  {
    step: "06",
    title: "Yayın & Destek",
    description:
      "Site yayına girer. Ama bu noktada biz çekilmeyiz. Teknik bakım, içerik güncellemeleri ve geliştirme talepleriniz için yanınızdayız.",
  },
];

// ============================================
// İLETİŞİM FORM SEÇENEKLERİ
// ============================================
export const CONTACT_FORM_OPTIONS = {
  serviceArea: [
    { value: "web-design", label: "Web Tasarımı" },
    { value: "web-development", label: "Web Geliştirme" },
    { value: "design-and-development", label: "Tasarım + Geliştirme" },
    { value: "maintenance", label: "Teknik Bakım & Destek" },
    { value: "other", label: "Diğer / Emin Değilim" },
  ],
  budget: [
    { value: "under-15k", label: "15.000 ₺ altı" },
    { value: "15k-30k", label: "15.000 — 30.000 ₺" },
    { value: "30k-60k", label: "30.000 — 60.000 ₺" },
    { value: "60k-plus", label: "60.000 ₺ üzeri" },
    { value: "undecided", label: "Henüz belirlemedim" },
  ],
};

// ============================================
// İLETİŞİM SÜRECİ BİLGİLENDİRMESİ
// ============================================
export const CONTACT_PROCESS = [
  {
    step: "1",
    title: "Ön İnceleme",
    description:
      "Formdaki bilgilere göre markanızı ve ihtiyaçlarınızı ön değerlendirmeye alırız.",
  },
  {
    step: "2",
    title: "Keşif Görüşmesi",
    description:
      "30 dakikalık online görüşmede markanızı, hedeflerinizi ve beklentilerinizi dinleriz.",
  },
  {
    step: "3",
    title: "Teklif & Kapsam",
    description:
      "Görüşme sonrasında projenize özel kapsam belgesi ve fiyat teklifini sunarız.",
  },
];

// ============================================
// CTA MESAJLARI
// ============================================
export const CTA_MESSAGES = {
  home: {
    title: "Markanız dijitalde doğru görünmeli.",
    subtitle:
      "Hazır şablondan değil, markanızın kimliğinden doğan bir web sitesi için konuşalım.",
  },
  about: {
    title: "Dijitalde kendiniz gibi görünün.",
    subtitle: "Markanızın karakterini birlikte inşa edelim.",
  },
  work: {
    title: "Sıradaki proje sizinki olabilir.",
    subtitle: "Markanız için neler yapabileceğimizi konuşalım.",
  },
  services: {
    title: "Hangi hizmet size uygun?",
    subtitle:
      "Tek bir sayfadan tüm dijital altyapıya — ihtiyacınızı birlikte belirleyelim.",
  },
};

// ============================================
// NAVIGATION MENU
// ============================================
export const NAVIGATION = [
  { path: "/about", label: "Hakkımızda" },
  { path: "/work", label: "Seçkin İşler" },
  { path: "/services", label: "Uzmanlıklar" },
  { path: "/contact", label: "İletişim" },
];

// ============================================
// FOOTER LINKS
// ============================================
export const FOOTER_LINKS = {
  studio: [
    { path: "/about", label: "Hakkımızda" },
    { path: "/work", label: "Seçkin İşler" },
    { path: "/services", label: "Uzmanlıklar" },
    { path: "/contact", label: "İletişim" },
  ],
  legal: [
    { path: "/privacy", label: "Gizlilik Politikası" },
    { path: "/terms", label: "Kullanım Koşulları" },
    { path: "/kvkk", label: "KVKK" },
  ],
};

// ============================================
// KVKK & YASAL
// ============================================
export const LEGAL = {
  kvkkText: "Formu göndererek KVKK aydınlatma metnini kabul etmiş olursunuz.",
  copyright: `© ${new Date().getFullYear()} Opsiron. Tüm hakları saklıdır.`,
};

// ============================================
// EXPORT DEFAULT
// ============================================
export default {
  SITE_META,
  PAGE_SEO,
  CONTACT_INFO,
  SERVICES,
  STUDIO_VALUES,
  WORKING_PROCESS,
  CONTACT_FORM_OPTIONS,
  CONTACT_PROCESS,
  CTA_MESSAGES,
  NAVIGATION,
  FOOTER_LINKS,
  LEGAL,
};