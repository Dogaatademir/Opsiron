import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// --- Yardımcı Bileşenler ---

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

// --- Veriler ---

const EXPERTISE = [
  {
    title: "Marka Uyumlu Tasarım",
    desc: "Markanın dili, estetik yönü ve vizyonu doğrultusunda, hazır şablonlardan uzak, tamamen size özel bir dijital yüz tasarımı."
  },
  {
    title: "Özel Web Geliştirme",
    desc: "Hazır hissi vermeyen, markaya özel yapılandırılmış, performans odaklı, modern ve esnek kod altyapısı."
  },
  {
    title: "Premium Deneyim",
    desc: "Masaüstünden mobile kadar her ekranda tutarlı, akıcı ve ziyaretçiye güven veren kusursuz bir kullanıcı deneyimi."
  },
  {
    title: "Sürekli Partnerlik",
    desc: "Projeyi teslim edip çekilmeyiz. Büyüyen markanız için teknik bakım, güncelleme ve uzun vadeli dijital destek sağlarız."
  }
];


const PROJECTS = [
  {
    name: 'Aureline Studio',
    category: 'Brand Website',
    year: '2026',
    tag: 'Moda & Yaşam',
    url: 'https://example.com',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Velmor Partners',
    category: 'Corporate Presence',
    year: '2026',
    tag: 'Danışmanlık',
    url: 'https://example.com',
    img: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=2000&auto=format&fit=crop',
  },
];

const PROCESS = [
  { no: '01', title: 'Keşif', desc: 'Markanızı, hedeflerinizi ve beklentilerinizi derinlemesine anlıyoruz.' },
  { no: '02', title: 'Tasarım', desc: 'Markanıza özel bir estetik dil ve görsel sistem oluşturuyoruz.' },
  { no: '03', title: 'Geliştirme', desc: 'Tasarımı, performanslı ve ölçeklenebilir kod altyapısına dönüştürüyoruz.' },
  { no: '04', title: 'Teslimat', desc: 'Yayına alıyor, test ediyor ve sizi tam destek ile sürece dahil ediyoruz.' },
];

// --- Ana Sayfa ---

const Homepage = () => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, projectName: '', url: '' });
  const [tickerOffset, setTickerOffset] = useState(0);
  const tickerRef = useRef(null);

  // Ticker animasyonu
  useEffect(() => {
    let frame;
    let start = null;
    const speed = 0.4;
    const animate = (ts) => {
      if (!start) start = ts;
      const el = tickerRef.current;
      if (el) {
        const totalWidth = el.scrollWidth / 2;
        setTickerOffset(prev => {
          const next = prev + speed;
          return next >= totalWidth ? 0 : next;
        });
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleProjectClick = (name, url) => setModalConfig({ isOpen: true, projectName: name, url });
  const handleCancelRedirect = () => setModalConfig(c => ({ ...c, isOpen: false }));
  const handleConfirmRedirect = () => {
    window.open(modalConfig.url, '_blank');
    setModalConfig(c => ({ ...c, isOpen: false }));
  };

  const TICKER_ITEMS = [
    'Marka Uyumlu Web Tasarımı',
    'Özel Web Geliştirme',
    'Premium Dijital Deneyim',
    'Responsive Tasarım',
    'Teknik Bakım & Destek',
    'Uzun Vadeli Partnerlik',
  ];

  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white overflow-x-hidden">

      {/* ===== 1. HERO ===== */}
      <section className="relative flex flex-col justify-center min-h-screen w-full pt-28 pb-0 overflow-hidden bg-[#F7F7F5]">

        {/* Mimari Grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.32]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
            backgroundPosition: "center center"
          }}
        />

        {/* Dekoratif Çapraz Çizgiler */}
        <div className="absolute top-0 right-0 w-2/3 h-full z-0 pointer-events-none overflow-hidden opacity-25 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="20" y1="0" x2="100" y2="80" />
            <line x1="40" y1="0" x2="100" y2="60" />
            <line x1="60" y1="0" x2="100" y2="40" />
            <line x1="0" y1="100" x2="100" y2="0" />
          </svg>
        </div>

        {/* İçerik */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-12 pb-24">

          <SectionLabel label="Opsiron — Web Design Studio" />

          {/* Başlık Bloğu */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">

            {/* Sol — Başlık */}
            <div className="relative max-w-4xl">
              <h1 className="text-[clamp(52px,9vw,120px)] font-bold uppercase leading-[0.92] tracking-[-0.01em] text-[#0F0F10]">
                PREMIUM<br />
                DİJİTAL<br />
                DENEYİMLER
              </h1>
              <div className="absolute -bottom-8 left-0 w-[80%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            {/* Sağ — Açıklama Kartı */}
            <div className="max-w-sm bg-white border border-[#E4E4E7] p-8 shadow-[0_1px_4px_rgba(0,0,0,0.05)] relative flex-shrink-0 self-end">
              <div className="absolute top-0 left-0 w-3 h-[1px] bg-[#0F0F10]"></div>
              <div className="absolute top-0 left-0 w-[1px] h-3 bg-[#0F0F10]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-[#D4D4D8]"></div>
              <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-[#D4D4D8]"></div>

              <p className="text-[14px] font-light leading-loose text-[#3F3F46] mb-8">
                Opsiron, markalara özel çalışan butik bir web design stüdyosudur. Markanızın dijitalde nasıl hissedileceğini, algılanacağını ve hatırlanacağını inşa ediyoruz.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex h-11 items-center justify-center bg-[#0F0F10] px-7 text-[10px] uppercase tracking-[0.2em] font-medium text-white hover:bg-[#27272A] transition-colors duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
                >
                  Görüşme Ayarla
                </Link>
                <button
                  onClick={() => document.getElementById('featured-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex h-11 items-center justify-center border border-[#E4E4E7] px-7 text-[10px] uppercase tracking-[0.2em] font-medium text-[#6B6B73] hover:border-[#D4D4D8] hover:text-[#0F0F10] transition-colors duration-300"
                >
                  Projeleri İncele
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll İndikatörü */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">
          <span className="w-[1px] h-10 bg-gradient-to-b from-transparent to-[#A1A1AA]"></span>
          <span>Kaydır</span>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="w-full bg-[#0F0F10] py-4 overflow-hidden border-y border-[#1A1A1C] relative">
        <div
          ref={tickerRef}
          className="flex gap-0 whitespace-nowrap will-change-transform"
          style={{ transform: `translateX(-${tickerOffset}px)` }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 text-[10px] uppercase tracking-[0.25em] text-[#3F3F46] pr-10">
              <span className="w-1 h-1 bg-[#3F3F46] rounded-full flex-shrink-0"></span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ===== 2. MANİFESTO ===== */}
      <section className="py-24 md:py-36 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-4xl mx-auto px-6">
          <SectionLabel label="Stüdyo Felsefesi" align="center" />
          <blockquote className="text-center">
            <p className="text-[clamp(20px,3vw,20px)] font-light leading-[1.6] text-[#0F0F10] tracking-[0.01em]">
              Biz bir "şablon satıcısı" değiliz. Yaptığımız iş sadece güzel görünen
              web siteleri tasarlamak da değildir.{'  '}
              <span className="font-medium">
                Asıl yaptığımız şey, bir markanın dijitalde nasıl algılanacağını
                ve nasıl hatırlanacağını inşa etmektir.
              </span>
            </p>
          </blockquote>


        </div>
      </section>

      <SectionSeparator />

      {/* ===== 4. SEÇKİN İŞLER ===== */}
      <section id="featured-works" className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <SectionLabel label="Seçkin İşlerimiz" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
                Öne Çıkan Projeler
              </h2>
            </div>
            <Link
              to="/work"
              className="self-start md:self-auto inline-flex items-center gap-2 border-b border-[#E4E4E7] pb-1 text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] hover:text-[#0F0F10] hover:border-[#0F0F10] transition-colors group"
            >
              Tümünü İncele
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
            {PROJECTS.map((project, idx) => (
              <div
                key={idx}
                className={`group cursor-pointer flex flex-col bg-[#FDFDFB] p-4 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 border border-[#EBEBE8] ${idx % 2 === 1 ? 'md:translate-y-16' : ''}`}
                onClick={() => handleProjectClick(project.name, project.url)}
              >
                <div className="mb-6 aspect-[4/3] overflow-hidden bg-[#EAEAEA] relative border border-[#E4E4E7]/50">
                  <img
                    src={project.img}
                    alt={project.name}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-95 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F10]/0 opacity-0 transition-all duration-500 group-hover:bg-[#0F0F10]/40 group-hover:opacity-100">
                    <span className="translate-y-4 bg-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[#0F0F10] font-medium transition-all duration-300 hover:bg-[#E4E4E7] group-hover:translate-y-0">
                      Projeyi İncele
                    </span>
                  </div>
                  {/* Tag etiketi */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 border border-[#E4E4E7]">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#6B6B73]">{project.tag}</span>
                  </div>
                </div>
                {/* Polaroid'in altındaki geniş çerçeve alanı */}
                <div className="flex justify-between items-start px-1">
                  <div className="max-w-[85%]">
                    <h3 className="text-xl md:text-2xl font-normal tracking-[0.05em] text-[#0F0F10] uppercase">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#6B6B73]">
                      {project.category} — {project.year}
                    </p>
                  </div>
                  <span className="text-[#E4E4E7] font-light text-2xl group-hover:translate-x-1 group-hover:text-[#0F0F10] transition-all duration-300 mt-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* ===== 5. UZMANLK ALANLARI ===== */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <SectionLabel label="Stüdyo Yetenekleri" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
                Uzmanlık Alanları
              </h2>
            </div>
            <Link
              to="/services"
              className="self-start md:self-auto inline-flex items-center gap-2 border-b border-[#E4E4E7] pb-1 text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] hover:text-[#0F0F10] hover:border-[#0F0F10] transition-colors group"
            >
              Tüm Hizmetler
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[#E4E4E7]">
            {EXPERTISE.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 lg:p-10 hover:bg-[#FAFAF8] transition-all duration-500 ease-out relative border-r border-b border-[#E4E4E7] last:border-r-0 hover:shadow-[inset_0_0_0_1px_#D4D4D8]"
              >
                <div className="mb-10">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#D4D4D8] group-hover:text-[#A1A1AA] transition-colors duration-500">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="mb-4 text-[14px] font-medium uppercase tracking-[0.1em] text-[#0F0F10] leading-snug transition-all duration-500 group-hover:tracking-[0.14em]">
                  {item.title}
                </h3>
                <p className="text-[13px] font-light leading-relaxed text-[#A1A1AA] group-hover:text-[#6B6B73] transition-colors duration-500">
                  {item.desc}
                </p>
                {/* Köşe aksanı — hover'da belirginleşir */}
                <div className="absolute bottom-0 right-0 w-0 h-[1px] bg-[#0F0F10] group-hover:w-6 transition-all duration-500 ease-out"></div>
                <div className="absolute bottom-0 right-0 w-[1px] h-0 bg-[#0F0F10] group-hover:h-6 transition-all duration-500 ease-out"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* ===== 6. SÜREÇ ===== */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">

            <div className="md:col-span-4">
              <SectionLabel label="Nasıl İlerliyoruz" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10] leading-tight">
                Çalışma<br />Sürecimiz
              </h2>
              <p className="mt-8 text-[13px] font-light leading-loose text-[#6B6B73]">
                Keşiften teslimaata kadar şeffaf, öngörülebilir ve markanıza tam uyumlu bir süreç yönetimi.
              </p>
              <Link
                to="/contact"
                className="mt-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] border-b border-[#E4E4E7] pb-1 hover:text-[#0F0F10] hover:border-[#0F0F10] transition-colors group"
              >
                Süreci Başlat
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            <div className="md:col-span-8">
              <div className="flex flex-col divide-y divide-[#E4E4E7] border-t border-[#E4E4E7]">
                {PROCESS.map((step, idx) => (
                  <div key={idx} className="group grid grid-cols-12 gap-6 py-8 hover:bg-white transition-colors duration-300 px-4 -mx-4">
                    <div className="col-span-2 md:col-span-1 flex items-start pt-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] group-hover:text-[#0F0F10] transition-colors font-medium">
                        {step.no}
                      </span>
                    </div>
                    <div className="col-span-10 md:col-span-3 flex items-start">
                      <h3 className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#0F0F10]">
                        {step.title}
                      </h3>
                    </div>
                    <div className="col-span-12 md:col-span-7 md:col-start-5">
                      <p className="text-[13px] font-light leading-relaxed text-[#6B6B73]">
                        {step.desc}
                      </p>
                    </div>
                    <div className="hidden md:flex col-span-1 items-center justify-end">
                      <span className="text-[#E4E4E7] font-light text-xl group-hover:text-[#0F0F10] group-hover:translate-x-1 transition-all duration-300">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* ===== 7. NEDEN OPSİRON ===== */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <SectionLabel label="Ayrışma Noktaları" />
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
              Neden Opsiron?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Sıfırdan Tasarım',
                desc: 'Her proje temiz bir sayfa ile başlar. Hazır şablon veya tekrar eden kalıp yoktur; markanıza özgü bir dil kurulur.',
              },
              {
                title: 'Marka Uyumu Önce',
                desc: 'Güzel görünmek değil, markayla uyumlu görünmek hedeflenir. Tasarım kararlarının her biri markanın kimliğiyle hizalanır.',
              },
              {
                title: 'Butik Yaklaşım',
                desc: 'Az sayıda projeyle çalışılır. Bu sayede her markaya tam dikkat, hız ve özen gösterilir.',
              },
              {
                title: 'Teslim Sonrası Destek',
                desc: '"Site bitti, görüşürüz" modeli çalışılmaz. Marka büyüdükçe dijital altyapısı da büyür.',
              },
              {
                title: 'Teknoloji + Estetik',
                desc: 'Sadece tasarımcı ya da sadece geliştirici değil. Her ikisini de aynı kalite standardında sunan tek stüdyo.',
              },
              {
                title: 'Şeffaf İletişim',
                desc: 'Süreç boyunca ne olduğunu bilirsiniz. Sürpriz yoktur; netlik, önceliğimizdir.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white border border-[#E4E4E7] p-8 hover:border-[#C4C4C8] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-500 ease-out relative overflow-hidden"
              >
                {/* Arka plan süpürme efekti */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7F7F5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="absolute top-0 right-0 text-[9px] uppercase tracking-[0.25em] text-[#E4E4E7] group-hover:text-[#C4C4C8] transition-colors duration-500">
                    0{idx + 1}
                  </div>
                  {/* Sol kenar çizgisi — hover'da uzar */}
                  <div className="absolute -left-8 top-0 w-[2px] h-0 bg-[#0F0F10] group-hover:h-full transition-all duration-500 ease-out"></div>

                  <h3 className="text-[14px] font-medium uppercase tracking-[0.1em] text-[#0F0F10] group-hover:tracking-[0.14em] transition-all duration-500 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[13px] font-light text-[#A1A1AA] group-hover:text-[#6B6B73] transition-colors duration-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. CTA — KOYU ALAN ===== */}
      <section className="py-32 md:py-48 bg-[#0F0F10] relative overflow-hidden selection:bg-white selection:text-[#0F0F10]">
        {/* Mimari Grid — koyu */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "linear-gradient(#F7F7F5 1px, transparent 1px), linear-gradient(90deg, #F7F7F5 1px, transparent 1px)", backgroundSize: "6rem 6rem" }} />

        {/* Çapraz çizgiler */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-10 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#F7F7F5] stroke-[0.1] fill-none">
            <line x1="0" y1="0" x2="100" y2="100" />
            <line x1="0" y1="30" x2="70" y2="100" />
            <line x1="0" y1="60" x2="40" y2="100" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">

          <div className="relative flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#3F3F46] font-medium mb-12">
            Proje Başlatın
          </div>

          <h2 className="mx-auto mb-6 max-w-3xl text-[clamp(28px,5vw,64px)] font-bold uppercase leading-[1] tracking-tight text-[#F7F7F5]">
            DİJİTAL KİMLİĞİNİZİ<br />YENİDEN İNŞA EDELİM.
          </h2>

          <p className="mb-14 text-[14px] font-light text-[#6B6B73] tracking-wide max-w-md mx-auto leading-loose">
            Markanızın karakterini birlikte inşa edelim. Hazır şablon yok, kopyala-yapıştır yok — sadece size özel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex h-14 items-center bg-[#F7F7F5] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-[#0F0F10] transition-all duration-300 hover:bg-white shadow-[0_4px_24px_rgba(247,247,245,0.12)] hover:shadow-[0_6px_32px_rgba(247,247,245,0.2)]"
            >
              Görüşme Ayarla
            </Link>
            <Link
              to="/work"
              className="inline-flex h-14 items-center border border-[#27272A] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-[#6B6B73] hover:border-[#3F3F46] hover:text-[#A1A1AA] transition-colors duration-300"
            >
              Portfolyoyu İncele
            </Link>
          </div>

          {/* Güven notu */}
          <p className="mt-10 text-[10px] uppercase tracking-[0.25em] text-[#2A2A2D]">
            1–2 iş günü içinde dönüş · Ücretsiz keşif görüşmesi
          </p>
        </div>
      </section>

      {/* ===== MODAL ===== */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F10]/40 backdrop-blur-sm px-6">
          <div className="bg-[#FFFFFF] p-8 md:p-12 max-w-lg w-full shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative">
            <div className="absolute top-0 left-0 w-3 h-[1px] bg-[#0F0F10]"></div>
            <div className="absolute top-0 left-0 w-[1px] h-3 bg-[#0F0F10]"></div>
            <h3 className="text-xl font-normal uppercase tracking-[0.05em] text-[#0F0F10] mb-4 border-b border-[#E4E4E7] pb-4">
              Harici Bağlantı
            </h3>
            <p className="text-[14px] text-[#6B6B73] font-light leading-relaxed mb-10">
              Şu anda <span className="text-[#0F0F10] font-medium">{modalConfig.projectName}</span> projesini incelemek üzere yeni bir sekmeye yönlendirileceksiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleCancelRedirect}
                className="px-6 py-3 border border-[#E4E4E7] text-[#0F0F10] text-[10px] uppercase tracking-[0.2em] hover:bg-[#F1F1EF] transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmRedirect}
                className="px-6 py-3 bg-[#0F0F10] text-white text-[10px] uppercase tracking-[0.2em] hover:bg-[#27272A] transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
              >
                Siteye Git
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Homepage;