import { Link } from 'react-router-dom';

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

// --- Veriler ---

const VALUES = [
  {
    no: '01',
    title: 'Özgünlük',
    desc: 'Her marka için sıfırdan düşünmek. Hazır kalıpları tekrar tekrar satmamak.',
  },
  {
    no: '02',
    title: 'Uyum',
    desc: 'Web sitesini markanın kimliği, tonu, hedef kitlesi ve hizmet modeliyle uyumlu kurmak.',
  },
  {
    no: '03',
    title: 'İşlevsellik',
    desc: 'Sadece estetik değil; anlaşılır, hızlı, dönüşüm odaklı ve sürdürülebilir çözümler üretmek.',
  },
  {
    no: '04',
    title: 'Süreklilik',
    desc: 'Teslim sonrası da destek vererek markanın dijital varlığını diri tutmak.',
  },
  {
    no: '05',
    title: 'Kalite',
    desc: 'Boş alan kullanımı, tipografi, yapı, akış, hız, mobil deneyim — hepsi aynı standardın parçası.',
  },
  {
    no: '06',
    title: 'Güven',
    desc: '"Site yaptık bitti" hissi değil, "dijital tarafta arkamda biri var" hissi vermek.',
  },
];

const PERSONALITY = [
  { trait: 'Rafine', note: 'Gösterişli değil, seçkin.' },
  { trait: 'Akıllı', note: 'Neden öyle tasarladığını bilen.' },
  { trait: 'Net', note: 'Güven veren, ne yaptığını belli eden.' },
  { trait: 'Çağdaş', note: 'Trend peşinde değil, standart yüksek.' },
  { trait: 'Sakin güçlü', note: 'Kendini ispatlamaya çalışmayan.' },
  { trait: 'Destekleyici', note: 'Müşteriye dijitalde güvenli alan açan.' },
];

// --- About Sayfası ---

const AboutPage = () => {
  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white">

      {/* 1. HERO */}
      <section className="relative flex flex-col justify-end min-h-[65vh] w-full pt-32 pb-16 overflow-hidden bg-[#F7F7F5]">

        {/* Mimari Grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
            backgroundPosition: "center center"
          }}
        />

        {/* Dekoratif çapraz çizgiler */}
        <div className="absolute top-0 right-0 w-2/3 h-full z-0 pointer-events-none overflow-hidden opacity-25 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="20" y1="0" x2="100" y2="80" />
            <line x1="50" y1="0" x2="100" y2="50" />
            <line x1="0" y1="100" x2="100" y2="0" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-12">
          <SectionLabel label="Opsiron — Stüdyo Hakkında" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">

            {/* Başlık */}
            <div className="relative">
              <h1 className="text-5xl md:text-[72px] lg:text-[96px] font-bold uppercase leading-[0.95] tracking-tight text-[#0F0F10]">
                BİZ KİMİZ,<br />NE YAPIYORUZ.
              </h1>
              <div className="absolute -bottom-6 left-0 w-[70%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            {/* Sağ kart — manifesto */}
            <div className="max-w-sm bg-white border border-[#E4E4E7] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative flex-shrink-0">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
              <p className="text-[13px] font-light leading-loose text-[#3F3F46]">
                Her markanın dijitalde kendine ait bir dili olmalı.
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[#A1A1AA]">
                Marka Fikri — Opsiron
              </p>
            </div>

          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 2. STUDIO TANIMI */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">

            {/* Sol — label + başlık */}
            <div className="md:col-span-4">
              <SectionLabel label="Stüdyo Tanımı" />
              <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.08em] text-[#0F0F10] leading-tight">
                Butik Bir<br />Web Design<br />Studio.
              </h2>
            </div>

            {/* Sağ — metin blokları */}
            <div className="md:col-span-8 flex flex-col gap-8">
              <p className="text-[16px] md:text-[18px] font-light leading-loose text-[#3F3F46]">
                Opsiron, markalara özel dijital deneyimler tasarlayan bir web design stüdyosudur. Her markanın kendine ait bir kimliği olduğuna inanır; bu yüzden her projeye aynı gözle bakmaz.
              </p>
              <p className="text-[15px] font-light leading-loose text-[#6B6B73]">
                Tasarladığı her web sitesi, markanın tonu, estetik dünyası, hedef kitlesi ve sunduğu hizmet doğrultusunda özel olarak şekillenir. Tipografi, boşluk kullanımı, görsel denge, kullanıcı akışı ve teknik yapı bir bütün olarak ele alınır.
              </p>
              <p className="text-[15px] font-light leading-loose text-[#6B6B73]">
                Opsiron'un farkı, işi yalnızca teslim etmekle sınırlı kalmamasıdır. Geliştirdiği web sitelerinin teknik desteğini ve devam eden ihtiyaçlarını da üstlenerek markalara uzun vadeli bir dijital güven alanı sunar.
              </p>

              {/* Konumlandırma blokları */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  'Hızlı üretim ajansı değil.',
                  'Template satıcısı değil.',
                  'Sadece yazılım ekibi değil.',
                ].map((line, i) => (
                  <div key={i} className="border border-[#E4E4E7] px-5 py-4 bg-white relative">
                    <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#A1A1AA]"></div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#A1A1AA] leading-snug line-through decoration-[#D4D4D8]">
                      {line}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 3. MARKA KİŞİLİĞİ */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <SectionLabel label="Stüdyo Kişiliği" />
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
              Duruş Biçimi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSONALITY.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white border border-[#E4E4E7] p-8 hover:bg-[#0F0F10] transition-colors duration-300 relative"
              >
                <div className="absolute top-3 right-4 text-[9px] uppercase tracking-[0.25em] text-[#E4E4E7] group-hover:text-[#3F3F46] transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="text-[18px] font-medium uppercase tracking-[0.1em] text-[#0F0F10] group-hover:text-white transition-colors mb-3">
                  {item.trait}
                </h3>
                <p className="text-[13px] font-light text-[#6B6B73] group-hover:text-[#A1A1AA] transition-colors leading-relaxed">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 4. DEĞERLER */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#F2F2EF]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <SectionLabel label="Temel Prensipler" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
                Marka Değerleri
              </h2>
            </div>
            <p className="max-w-xs text-[13px] font-light leading-relaxed text-[#6B6B73]">
              Her kararın, her tasarım seçiminin ve her müşteri ilişkisinin arkasında duran altı temel.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[#E4E4E7] border-t border-[#E4E4E7]">
            {VALUES.map((item, idx) => (
              <div
                key={idx}
                className="group grid grid-cols-12 gap-6 py-8 md:py-10 hover:bg-white transition-colors duration-300 px-4 -mx-4"
              >
                <div className="col-span-2 md:col-span-1 flex items-start pt-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] group-hover:text-[#0F0F10] transition-colors font-medium">
                    {item.no}
                  </span>
                </div>
                <div className="col-span-10 md:col-span-3 flex items-start">
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#0F0F10]">
                    {item.title}
                  </h3>
                </div>
                <div className="col-span-12 md:col-span-7 md:col-start-5">
                  <p className="text-[14px] font-light leading-relaxed text-[#6B6B73]">
                    {item.desc}
                  </p>
                </div>
                <div className="hidden md:flex col-span-1 items-center justify-end">
                  <span className="text-[#E4E4E7] font-light text-xl group-hover:text-[#0F0F10] group-hover:translate-x-1 transition-all duration-300">→</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <SectionSeparator />

      {/* 5. HEDEF KİTLE */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">

            <div className="md:col-span-5">
              <SectionLabel label="Kimin İçin" />
              <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10] leading-tight">
                Doğru<br />Müşteri.
              </h2>
              <p className="mt-8 text-[14px] font-light leading-loose text-[#6B6B73]">
                Opsiron herkese hitap etmek zorunda değil. Aksine, herkese hitap etmeye çalışırsa gücünü kaybeder.
              </p>
            </div>

            <div className="md:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Markalı Girişimciler', desc: 'Kendi markasını ciddiye alan, dijitalde güçlü görünmek isteyen kurucular.' },
                  { title: 'Premium Markalar', desc: 'Premium olan ya da premiumlaşmak isteyen, değerini doğru yansıtmak isteyen işletmeler.' },
                  { title: 'Profesyoneller', desc: 'Kişisel markasını güçlü ve rafine bir dijital varlıkla sunmak isteyen bireyler.' },
                  { title: 'Estetik Sektörler', desc: 'Mimarlık, moda, güzellik, wellness, danışmanlık, hospitality, emlak ve yaratıcı işler.' },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative">
                    <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
                    <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
                    <h3 className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#0F0F10] mb-3">{card.title}</h3>
                    <p className="text-[12px] font-light leading-relaxed text-[#6B6B73]">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Ayrıştırıcı cümle */}
              <div className="mt-6 border-t border-[#E4E4E7] pt-6">
                <p className="text-[13px] font-light leading-relaxed text-[#6B6B73]">
                  Kısaca: <span className="text-[#0F0F10] font-medium">"Bir web sitem olsun"</span> diyen değil,{' '}
                  <span className="text-[#0F0F10] font-medium">"markam dijitalde doğru görünmeli"</span> diyen müşteriler.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CTA — Ters Kontrast */}
      <section className="py-32 md:py-48 bg-[#0F0F10] relative overflow-hidden selection:bg-white selection:text-[#0F0F10]">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "linear-gradient(#F7F7F5 1px, transparent 1px), linear-gradient(90deg, #F7F7F5 1px, transparent 1px)", backgroundSize: "6rem 6rem" }} />
        <div className="absolute top-0 left-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-10 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#F7F7F5] stroke-[0.1] fill-none">
            <line x1="0" y1="0" x2="100" y2="100" />
            <line x1="0" y1="30" x2="70" y2="100" />
            <line x1="0" y1="60" x2="40" y2="100" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="relative flex items-center justify-center text-[10px] uppercase tracking-[0.3em] text-[#6B6B73] font-medium mb-12">
            Proje Başlatın
          </div>

          <h2 className="mx-auto mb-4 max-w-3xl text-3xl md:text-5xl font-bold uppercase leading-[1] tracking-tight text-[#F7F7F5]">
            DİJİTALDE KENDİNİZ<br />GİBİ GÖRÜNÜN.
          </h2>
          <p className="mb-12 text-[14px] font-light text-[#6B6B73] tracking-wide">
            Markanızın karakterini birlikte inşa edelim.
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

export default AboutPage;