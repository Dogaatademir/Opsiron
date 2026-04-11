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

// --- Proje Verisi ---

const PROJECTS = [
  {
    id: 1,
    name: 'Aureline Studio',
    category: 'Brand Website',
    year: '2026',
    tags: ['Branding', 'Web Design', 'React'],
    description: 'Lüks güzellik markası için tasarım sisteminden web sitesine uzanan bütünleşik bir dijital kimlik inşası.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'large',
  },
  {
    id: 2,
    name: 'Velmor Partners',
    category: 'Corporate Presence',
    year: '2026',
    tags: ['Corporate', 'UI/UX', 'Next.js'],
    description: 'Finans sektöründe faaliyet gösteren bir danışmanlık firması için güven odaklı, kurumsal bir web varlığı.',
    image: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'small',
  },
  {
    id: 3,
    name: 'Norvik Collective',
    category: 'E-Commerce',
    year: '2025',
    tags: ['E-Commerce', 'Art Direction', 'Shopify'],
    description: 'Skandinav estetiğinden ilham alan bağımsız bir mobilya kolektifi için minimal alışveriş deneyimi.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'small',
  },
  {
    id: 4,
    name: 'Séquence Atelier',
    category: 'Portfolio & Booking',
    year: '2025',
    tags: ['Portfolio', 'Animation', 'GSAP'],
    description: 'Paris merkezli bir fotoğrafçı için hareket, ritim ve sessizliği bir arada sunan portfolyo ve rezervasyon platformu.',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'large',
  },
  {
    id: 5,
    name: 'Kael Systems',
    category: 'SaaS Landing',
    year: '2025',
    tags: ['SaaS', 'Conversion', 'React'],
    description: 'Kurumsal yapay zeka ürünü için dönüşüm odaklı, güveni ön plana çıkaran bir pazarlama sayfası.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'small',
  },
  {
    id: 6,
    name: 'Maison Elore',
    category: 'Luxury Brand',
    year: '2024',
    tags: ['Luxury', 'Branding', 'Web Design'],
    description: 'Özel davet üzerine çalışan Fransız bir parfüm markası için ultra lüks bir dijital vitrin deneyimi.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?q=80&w=2000&auto=format&fit=crop',
    url: 'https://example.com',
    size: 'small',
  },
];

const ALL_CATEGORIES = ['Tümü', 'Brand Website', 'Corporate Presence', 'E-Commerce', 'Portfolio & Booking', 'SaaS Landing', 'Luxury Brand'];

// --- Work Sayfası ---

const WorkPage = () => {
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, projectName: '', url: '' });

  const filtered = activeFilter === 'Tümü'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeFilter);

  const handleProjectClick = (projectName, url) => {
    setModalConfig({ isOpen: true, projectName, url });
  };

  const handleCancelRedirect = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleConfirmRedirect = () => {
    window.open(modalConfig.url, '_blank');
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white">

      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col justify-end min-h-[55vh] w-full pt-32 pb-16 overflow-hidden bg-[#F7F7F5]">

        {/* Mimari Grid Arka Plan */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
            backgroundPosition: "center center"
          }}
        />

        {/* Dekoratif Çapraz Çizgiler */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-20 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="0" y1="100" x2="100" y2="0" />
            <line x1="30" y1="100" x2="100" y2="30" />
            <line x1="60" y1="100" x2="100" y2="60" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-12">
          <SectionLabel label="Opsiron — Tüm Projeler" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="relative">
              <h1 className="text-5xl md:text-[72px] lg:text-[96px] font-bold uppercase leading-[0.95] tracking-tight text-[#0F0F10]">
                İŞLERİMİZ
              </h1>
              <div className="absolute -bottom-6 left-0 w-full max-w-[60%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            {/* Proje Sayacı */}
            <div className="bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col gap-1 min-w-[180px]">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A1A1AA]">Toplam Proje</span>
              <span className="text-5xl font-bold text-[#0F0F10] tracking-tight leading-none">{PROJECTS.length.toString().padStart(2, '0')}</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] mt-1">2024 — 2026</span>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 2. FİLTRE BARI */}
      <section className="py-8 bg-[#F7F7F5] sticky top-0 z-30 border-b border-[#E4E4E7] backdrop-blur-sm bg-[#F7F7F5]/90">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] mr-4 hidden md:inline">Filtre:</span>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-medium border transition-all duration-200 ${
                  activeFilter === cat
                    ? 'bg-[#0F0F10] text-white border-[#0F0F10]'
                    : 'bg-transparent text-[#6B6B73] border-[#E4E4E7] hover:border-[#D4D4D8] hover:text-[#0F0F10]'
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="ml-auto text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">
              {filtered.length} Proje
            </span>
          </div>
        </div>
      </section>

      {/* 3. PROJELER GRID */}
      <section className="py-20 md:py-28 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">

          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-[13px] uppercase tracking-[0.3em] text-[#A1A1AA]">Bu kategoride proje bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {filtered.map((project, idx) => {
                // Büyük-küçük grid düzeni: büyük projeler 7 kolon, küçükler 5 kolon
                // Satır başlarında değişimli sıralama
                const isLarge = project.size === 'large';
                const colSpan = isLarge ? 'md:col-span-7' : 'md:col-span-5';
                const aspectClass = isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]';

                return (
                  <div
                    key={project.id}
                    className={`group cursor-pointer flex flex-col bg-[#FFFFFF] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-500 ${colSpan} ${
                      // Offset: çift indexli büyük projeler üste kayar
                      isLarge && idx % 2 === 0 ? '' : isLarge ? 'md:self-end' : idx % 3 === 1 ? 'md:mt-16' : ''
                    }`}
                    onClick={() => handleProjectClick(project.name, project.url)}
                  >
                    {/* Görsel */}
                    <div className={`mb-5 ${aspectClass} overflow-hidden bg-[#F7F7F5] relative`}>
                      <img
                        src={project.image}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply opacity-90 grayscale group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F10]/0 opacity-0 transition-all duration-500 group-hover:bg-[#0F0F10]/40 group-hover:opacity-100">
                        <span className="translate-y-4 bg-white px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-[#0F0F10] font-medium transition-all duration-300 hover:bg-[#E4E4E7] group-hover:translate-y-0">
                          Projeyi İncele
                        </span>
                      </div>

                      {/* Kategori Etiketi */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 border border-[#E4E4E7]">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#6B6B73]">{project.category}</span>
                      </div>
                    </div>

                    {/* Bilgi Alanı */}
                    <div className="flex flex-col gap-3 px-2 pb-2 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg md:text-xl font-normal tracking-[0.05em] text-[#0F0F10] uppercase">
                            {project.name}
                          </h3>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#6B6B73]">
                            {project.category} — {project.year}
                          </p>
                        </div>
                        <span className="text-[#E4E4E7] font-light text-2xl group-hover:translate-x-1 group-hover:text-[#0F0F10] transition-all duration-300 flex-shrink-0 mt-1">→</span>
                      </div>

                      <p className="text-[12px] font-light leading-relaxed text-[#6B6B73] border-t border-[#F4F4F5] pt-3 mt-auto">
                        {project.description}
                      </p>

                      {/* Tag'ler */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-[9px] uppercase tracking-[0.15em] text-[#A1A1AA] border border-[#E4E4E7] px-2 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SectionSeparator />

      {/* 4. SÜREÇ SECTION */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <SectionLabel label="Nasıl Çalışıyoruz" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
                Proje Süreci
              </h2>
            </div>
            <p className="max-w-sm text-[13px] font-light leading-relaxed text-[#6B6B73]">
              Her proje, keşiften lansmana kadar titizlikle yönetilen dört aşamalı bir süreç üzerinde ilerler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[#E4E4E7]">
            {[
              { no: '01', title: 'Keşif', desc: 'Markanızı, hedeflerinizi ve rekabet ortamını derinlemesine analiz ediyoruz.' },
              { no: '02', title: 'Tasarım', desc: 'Moodboard, tipografi ve renk sisteminden başlayarak görsel dil inşa ediyoruz.' },
              { no: '03', title: 'Geliştirme', desc: 'Tasarımı performanslı, temiz ve ölçeklenebilir bir kod altyapısına dönüştürüyoruz.' },
              { no: '04', title: 'Lansman', desc: 'Test, optimizasyon ve canlıya alma süreçlerini yönetiyor; ardından yanınızda kalıyoruz.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`group p-8 lg:p-10 hover:bg-[#0F0F10] transition-colors duration-300 ${idx < 3 ? 'border-r border-[#E4E4E7]' : ''}`}
              >
                <div className="mb-12">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA] group-hover:text-[#6B6B73] transition-colors">
                    {step.no}
                  </span>
                </div>
                <h3 className="mb-4 text-[15px] font-medium uppercase tracking-[0.1em] text-[#0F0F10] group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="text-[13px] font-light leading-relaxed text-[#6B6B73] group-hover:text-[#A1A1AA] transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-32 md:py-48 bg-[#0F0F10] relative overflow-hidden selection:bg-white selection:text-[#0F0F10]">
        {/* Ters grid — açık çizgiler koyu zeminde */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "linear-gradient(#F7F7F5 1px, transparent 1px), linear-gradient(90deg, #F7F7F5 1px, transparent 1px)", backgroundSize: "6rem 6rem" }} />

        {/* Dekoratif çapraz çizgiler */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-10 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#F7F7F5] stroke-[0.1] fill-none">
            <line x1="0" y1="0" x2="100" y2="100" />
            <line x1="0" y1="30" x2="70" y2="100" />
            <line x1="0" y1="60" x2="40" y2="100" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {/* Section label ters renk */}
          <div className="relative flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#6B6B73] font-medium mb-12">
            Sıradaki Proje
          </div>

          <h2 className="mx-auto mb-10 max-w-3xl text-3xl md:text-5xl font-bold uppercase leading-[1] tracking-tight text-[#F7F7F5]">
            SİZİN PROJENİZ<br />BU LİSTEDE OLMALI.
          </h2>

          <Link
            to="/contact"
            className="inline-flex h-14 items-center bg-[#F7F7F5] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-[#0F0F10] transition-all duration-300 hover:bg-white shadow-[0_4px_24px_rgba(247,247,245,0.12)] hover:shadow-[0_6px_32px_rgba(247,247,245,0.2)]"
          >
            Görüşme Ayarla
          </Link>
        </div>
      </section>

      {/* MODAL */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F10]/40 backdrop-blur-sm px-6">
          <div className="bg-[#FFFFFF] p-8 md:p-12 max-w-lg w-full shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative">
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

export default WorkPage;