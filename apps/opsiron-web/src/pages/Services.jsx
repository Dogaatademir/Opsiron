import { Link } from 'react-router-dom';
import { useState } from 'react';

// --- Yardımcı Bileşenler (Home.jsx ile aynı) ---

function SectionLabel({ label, align = 'start' }) {
  return (
    <div className={`relative flex items-center text-[10px] uppercase tracking-[0.3em] text-[#6B6B73] font-medium mb-12 ${align === 'center' ? 'justify-center' : 'ml-4'}`}>
      {!align || align === 'start' ? (
        <>
          <div className="absolute -left-6 top-1/2 w-4 h-[1px] bg-[#A1A1AA]"></div>
          <div className="absolute left-0 -top-6 w-[1px] h-4 bg-[#A1A1AA]"></div>
        </>
      ) : null}
      {label}
    </div>
  );
}

function SectionSeparator() {
  return (
    <div className="w-full bg-[#F7F7F5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="w-full border-t border-[#E4E4E7] relative h-16 md:h-24">
          <div className="absolute -left-1.5 -top-3 text-[18px] font-light text-[#A1A1AA] select-none">+</div>
          <div className="absolute -right-1.5 -top-3 text-[18px] font-light text-[#A1A1AA] select-none">+</div>
        </div>
      </div>
    </div>
  );
}

// --- Veri ---

const SERVICES = [
  {
    no: '01',
    title: 'Marka Uyumlu\nWeb Tasarımı',
    tagline: 'Markanın görünme biçimi.',
    desc: 'Hazır şablonlardan tamamen uzak, markanın tonu, estetik dünyası ve hitap ettiği kitleyle birebir uyumlu özel web sitesi tasarımı. Her sayfa, her bölüm ve her detay markanın karakterini taşır.',
    deliverables: [
      'Moodboard & Görsel Yön',
      'Tipografi & Renk Sistemi',
      'UI Tasarımı (Tüm Sayfalar)',
      'Responsive Tasarım',
      'Prototip & Kullanıcı Akışı',
    ],
    ideal: 'Yeni kurulan ya da rebranding yapan markalar.',
  },
  {
    no: '02',
    title: 'Özel Web\nGeliştirme',
    tagline: 'Hazır hissi vermeyen altyapı.',
    desc: 'Tasarımı, markaya özel yapılandırılmış, temiz ve ölçeklenebilir bir kod altyapısına dönüştürüyoruz. Performans, hız ve sürdürülebilirlik ön planda. Hazır theme yok, tekrar eden şablon yok.',
    deliverables: [
      'React / Next.js Geliştirme',
      'CMS Entegrasyonu',
      'SEO Teknik Altyapısı',
      'Performans Optimizasyonu',
      'Deployment & Yayına Alma',
    ],
    ideal: 'Güçlü teknik altyapı isteyen markalar.',
  },
  {
    no: '03',
    title: 'Marka Sunumu &\nİçerik Yapısı',
    tagline: 'Ne söylendiği kadar nasıl söylendiği.',
    desc: 'Sayfa kurgusu, hiyerarşi, bölüm yapısı, metin yönlendirmesi ve kullanıcı akışı. Ziyaretçinin doğru yerde doğru mesajla karşılaşması için içerik mimarisi ve kopya yazımı.',
    deliverables: [
      'Sayfa Mimarisi & Site Haritası',
      'Bölüm Hiyerarşisi',
      'Başlık & Kopya Yazımı',
      'CTA Yapısı',
      'Kullanıcı Akışı Planlaması',
    ],
    ideal: 'Mesajını netleştirmek isteyen markalar.',
  },
  {
    no: '04',
    title: 'Responsive\nDeneyim',
    tagline: 'Her ekranda aynı kalite.',
    desc: 'Masaüstünden mobil ve tablete kadar her ekranda tutarlı, akıcı ve premium görünen bir deneyim. Piksel hassasiyetinde ince ayar. Boyut değil, his değişmez.',
    deliverables: [
      'Mobil Öncelikli Tasarım',
      'Tablet Optimizasyonu',
      'Çapraz Tarayıcı Uyumu',
      'Dokunmatik Etkileşim Detayları',
      'Görünürlük & Erişilebilirlik',
    ],
    ideal: 'Mobil trafiği yüksek olan tüm markalar.',
  },
  {
    no: '05',
    title: 'Teknik Bakım\n& Destek',
    tagline: 'Teslim sonrası da yanınızdayız.',
    desc: 'Site yayına girdikten sonra bitmez. Güncellemeler, içerik düzenlemeleri, teknik sorunlar ve küçük geliştirmeler için düzenli bakım ve hızlı destek. Dijital varlık diri kalır.',
    deliverables: [
      'Aylık Bakım Paketi',
      'İçerik Güncelleme',
      'Hata & Bug Giderimi',
      'Performans İzleme',
      'Güvenlik Güncellemeleri',
    ],
    ideal: 'İç kaynak ayırmak istemeyen markalar.',
  },
  {
    no: '06',
    title: 'Uzun Vadeli\nDijital Partnerlik',
    tagline: 'Büyüyen markalar için sürdürülebilir destek.',
    desc: 'Bir kerelik iş ilişkisi değil. Marka büyüdükçe dijital altyapısını da büyüten, yeni ihtiyaçlara hızla cevap verebilen uzun vadeli bir partner ilişkisi. Dijital tarafta güvenli bir alan.',
    deliverables: [
      'Öncelikli Erişim & Hız',
      'Yeni Sayfa & Özellik Geliştirme',
      'Strateji & Danışmanlık',
      'Periyodik Tasarım Revizyonu',
      'Yıllık Dijital Denetim',
    ],
    ideal: 'Dijitalde uzun vadeli düşünen markalar.',
  },
];

// --- Bileşen ---

const ServicesPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => setOpenIndex(prev => prev === idx ? null : idx);

  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white">

      {/* 1. HERO */}
      <section className="relative flex flex-col justify-end min-h-[60vh] w-full pt-32 pb-16 overflow-hidden bg-[#F7F7F5]">

        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
          }}
        />

        <div className="absolute top-0 right-0 w-2/3 h-full z-0 pointer-events-none overflow-hidden opacity-20 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="20" y1="0" x2="100" y2="80" />
            <line x1="50" y1="0" x2="100" y2="50" />
            <line x1="0" y1="100" x2="100" y2="0" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-12">
          <SectionLabel label="Opsiron — Hizmetler" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="relative">
              <h1 className="text-5xl md:text-[72px] lg:text-[96px] font-bold uppercase leading-[0.95] tracking-tight text-[#0F0F10]">
                NE<br />YAPIYORUZ.
              </h1>
              <div className="absolute -bottom-6 left-0 w-[60%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            <div className="max-w-sm bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative flex-shrink-0">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
              <p className="text-[13px] font-light leading-loose text-[#3F3F46]">
                Tasarımdan geliştirmeye, içerik mimarisinden uzun vadeli bakıma kadar markanın dijitaldeki tüm ihtiyaçları tek çatı altında.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A1A1AA]">Toplam Hizmet</span>
                <span className="text-[22px] font-bold text-[#0F0F10] leading-none">06</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 2. HİZMET AKORDEONu */}
      <section className="py-20 md:py-28 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-16">
            <SectionLabel label="Hizmet Çerçevesi" />
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
              Çalışma Alanları
            </h2>
          </div>

          <div className="flex flex-col border-t border-[#E4E4E7]">
            {SERVICES.map((service, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border-b border-[#E4E4E7] transition-colors duration-300 ${isOpen ? 'bg-[#EFEFEA]' : 'hover:bg-white'}`}
                >
                  {/* Başlık satırı */}
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full grid grid-cols-12 gap-4 items-center py-7 md:py-8 px-4 text-left cursor-pointer"
                  >
                    <div className="col-span-1 hidden md:flex items-center">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[#A1A1AA] font-medium">{service.no}</span>
                    </div>

                    <div className="col-span-10 md:col-span-6 flex flex-col gap-1">
                      <h3 className={`text-[18px] md:text-[22px] font-medium uppercase tracking-[0.06em] leading-tight transition-colors duration-300 ${isOpen ? 'text-[#0F0F10]' : 'text-[#0F0F10]'}`}>
                        {service.title.replace('\n', ' ')}
                      </h3>
                      {!isOpen && (
                        <p className="text-[11px] uppercase tracking-[0.15em] text-[#A1A1AA] hidden md:block">
                          {service.tagline}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-4 flex items-center justify-end gap-4">
                      <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA]">
                        {isOpen ? 'Kapat' : 'İncele'}
                      </span>
                      <span className={`w-8 h-8 border border-[#E4E4E7] flex items-center justify-center text-[#6B6B73] text-sm transition-all duration-300 flex-shrink-0 ${isOpen ? 'bg-[#0F0F10] text-white border-[#0F0F10] rotate-45' : 'bg-white hover:border-[#D4D4D8]'}`}>
                        +
                      </span>
                    </div>
                  </button>

                  {/* Açılır içerik */}
                  {isOpen && (
                    <div className="px-4 md:px-4 pb-10">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pt-2 md:pt-0">

                        {/* Boşluk — no kolonu hizası */}
                        <div className="hidden md:block md:col-span-1" />

                        {/* Açıklama */}
                        <div className="md:col-span-5 flex flex-col gap-4">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#A1A1AA]">{service.tagline}</p>
                          <p className="text-[14px] font-light leading-loose text-[#3F3F46]">
                            {service.desc}
                          </p>
                          <p className="mt-2 text-[11px] font-light text-[#A1A1AA] border-t border-[#E4E4E7] pt-4">
                            <span className="uppercase tracking-[0.2em]">İdeal için: </span>
                            {service.ideal}
                          </p>
                        </div>

                        {/* Teslim edilenler */}
                        <div className="md:col-span-5 md:col-start-8">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] mb-5">Neler dahil</p>
                          <ul className="flex flex-col divide-y divide-[#E4E4E7]">
                            {service.deliverables.map((item, i) => (
                              <li key={i} className="flex items-center gap-3 py-3">
                                <span className="w-1 h-1 bg-[#A1A1AA] rounded-full flex-shrink-0"></span>
                                <span className="text-[12px] font-light text-[#3F3F46]">{item}</span>
                              </li>
                            ))}
                          </ul>

                          <Link
                            to="/contact"
                            className="mt-8 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] border-b border-[#D4D4D8] pb-1 hover:text-[#0F0F10] hover:border-[#0F0F10] transition-colors"
                          >
                            Bu hizmet için görüşme ayarla
                            <span className="text-xs">→</span>
                          </Link>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <SectionSeparator />

      {/* 3. YAKLAŞIM */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">

            <div className="md:col-span-4">
              <SectionLabel label="Çalışma Biçimi" />
              <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.08em] text-[#0F0F10] leading-tight">
                Nasıl<br />İlerliyoruz?
              </h2>
            </div>

            <div className="md:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Tek Seferlik Proje',
                    desc: 'Belirli bir ihtiyaç için başlangıç, tasarım ve geliştirme sürecini kapsayan, net bir kapsam ve teslimatla çalışılan proje modeli.',
                    tag: 'Proje Bazlı',
                  },
                  {
                    title: 'Aylık Retainer',
                    desc: 'Bakım, güncelleme ve süregelen geliştirme ihtiyaçları için aylık sabit kapsamlı destek paketi. Öncelikli erişim ve hız garantisi.',
                    tag: 'Süregelen',
                  },
                  {
                    title: 'Uzun Vadeli Partner',
                    desc: 'Marka büyüdükçe dijital altyapısının da büyümesini isteyen markalar için tasarım, geliştirme ve stratejiyi birlikte götürdüğümüz kapsamlı ilişki modeli.',
                    tag: 'Partnerlik',
                  },
                  {
                    title: 'Danışmanlık',
                    desc: 'Mevcut dijital varlığını gözden geçirmek ya da yol haritası oluşturmak isteyen markalar için tanı ve yönlendirme seansları.',
                    tag: 'Tanı & Yön',
                  },
                ].map((model, i) => (
                  <div key={i} className="bg-white border border-[#E4E4E7] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative group hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-300">
                    <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
                    <div className="mb-5">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-[#A1A1AA] border border-[#E4E4E7] px-2 py-1">{model.tag}</span>
                    </div>
                    <h3 className="text-[14px] font-medium uppercase tracking-[0.1em] text-[#0F0F10] mb-3">{model.title}</h3>
                    <p className="text-[12px] font-light leading-relaxed text-[#6B6B73]">{model.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CTA — Ters Kontrast */}
      <section className="py-32 md:py-48 bg-[#0F0F10] relative overflow-hidden selection:bg-white selection:text-[#0F0F10]">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "linear-gradient(#F7F7F5 1px, transparent 1px), linear-gradient(90deg, #F7F7F5 1px, transparent 1px)", backgroundSize: "6rem 6rem" }} />
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-10 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#F7F7F5] stroke-[0.1] fill-none">
            <line x1="100" y1="0" x2="0" y2="100" />
            <line x1="100" y1="30" x2="30" y2="100" />
            <line x1="100" y1="60" x2="60" y2="100" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="relative flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#6B6B73] font-medium mb-12">
            Proje Başlatın
          </div>

          <h2 className="mx-auto mb-4 max-w-3xl text-3xl md:text-5xl font-bold uppercase leading-[1] tracking-tight text-[#F7F7F5]">
            HANGİ HİZMETİ<br />İHTİYAÇ DUYUYORSUNUZ?
          </h2>
          <p className="mb-12 text-[14px] font-light text-[#6B6B73] tracking-wide">
            Henüz emin değilseniz de görüşelim. Birlikte doğru olanı buluruz.
          </p>

          <Link
            to="/contact"
            className="inline-flex h-14 items-center bg-[#F7F7F5] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-[#0F0F10] transition-all duration-300 hover:bg-white shadow-[0_4px_24px_rgba(247,247,245,0.12)] hover:shadow-[0_6px_32px_rgba(247,247,245,0.2)]"
          >
            Görüşme Ayarla
          </Link>
        </div>
      </section>

    </div>
  );
};

export default ServicesPage;