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

// --- Input Bileşeni ---

function FormField({ label, type = 'text', name, value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] font-medium group-focus-within:text-[#0F0F10] transition-colors">
        {label} {required && <span className="text-[#0F0F10]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-transparent border-b border-[#E4E4E7] py-3 text-[14px] font-light text-[#0F0F10] placeholder-[#C4C4C8] outline-none focus:border-[#0F0F10] transition-colors duration-300"
      />
    </div>
  );
}

// --- Select Bileşeni ---

function FormSelect({ label, name, value, onChange, options, required }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] font-medium group-focus-within:text-[#0F0F10] transition-colors">
        {label} {required && <span className="text-[#0F0F10]">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-transparent border-b border-[#E4E4E7] py-3 text-[14px] font-light text-[#0F0F10] outline-none focus:border-[#0F0F10] transition-colors duration-300 appearance-none cursor-pointer"
      >
        <option value="" disabled className="text-[#A1A1AA]">Seçiniz</option>
        {options.map(opt => (
          <option key={opt} value={opt} className="text-[#0F0F10]">{opt}</option>
        ))}
      </select>
    </div>
  );
}

// --- Contact Sayfası ---

const SERVICES = [
  'Marka Uyumlu Web Tasarımı',
  'Özel Web Geliştirme',
  'Responsive Deneyim',
  'Teknik Bakım & Destek',
  'Uzun Vadeli Dijital Partnerlik',
  'Diğer / Henüz Bilmiyorum',
];

const BUDGET_OPTIONS = [
  '₺50.000 – ₺100.000',
  '₺100.000 – ₺200.000',
  '₺200.000+',
  'Henüz belirlemedim',
];

const INITIAL_FORM = {
  name: '',
  company: '',
  email: '',
  service: '',
  budget: '',
  message: '',
};

const ContactPage = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Gönderilen veriyi konsola yazdır
    console.log("--- İLETİŞİM FORMU SÜRECİ BAŞLADI ---");
    console.log("1. Backend'e gönderilecek payload:", form);

    try {
      console.log("2. Fetch isteği /.netlify/functions/contact adresine atılıyor...");
      
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      console.log("3. Sunucudan HTTP Status Code geldi:", response.status);

      // Yanıt başarılıysa (200-299 arası)
      if (response.ok) {
        const responseData = await response.json();
        console.log("4. BAŞARILI YANIT:", responseData);
        setSubmitted(true);
      } 
      // Yanıt hatalıysa (400, 500 vb.)
     // Yanıt hatalıysa (400, 500 vb.)
      else {
        console.warn(`4. HATA ALINDI: Sunucu ${response.status} kodu döndürdü. Detaylar okunuyor...`);
        
        // Düzeltme: Yanıtı metin olarak TEK BİR KERE okuyoruz
        const rawResponse = await response.text(); 
        
        try {
          // Eğer okuduğumuz metin aslında bir JSON ise onu objeye çevir
          const jsonError = JSON.parse(rawResponse);
          console.error("5. Sunucu JSON Hatası:", jsonError);
        } catch (parseError) {
          // JSON değilse, Netlify'ın fırlattığı düz hata metnini yazdır
          console.error("5. Sunucu Metin/HTML Hatası:", rawResponse);
        }
        
        alert(`Sunucu Hatası (${response.status}). Lütfen tarayıcı konsolunu kontrol edin.`);
      }
    } catch (error) {
      // Fetch işlemi hiç gerçekleşemezse (Ağ kopukluğu, CORS hatası vb.)
      console.error("Kritik Sistem/Ağ Hatası (Fetch çalışamadı):", error);
      alert("Ağ bağlantısı veya CORS hatası. Detaylar konsolda.");
    } finally {
      setLoading(false);
      console.log("--- İLETİŞİM FORMU SÜRECİ TAMAMLANDI ---");
    }
  };
  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white">

      {/* 1. HERO */}
      <section className="relative flex flex-col justify-end min-h-[55vh] w-full pt-32 pb-16 overflow-hidden bg-[#F7F7F5]">

        {/* Mimari Grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
          }}
        />

        {/* Çapraz çizgiler */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-20 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="0" y1="100" x2="100" y2="0" />
            <line x1="30" y1="100" x2="100" y2="30" />
            <line x1="60" y1="100" x2="100" y2="60" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-12">
          <SectionLabel label="Opsiron — İletişim" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="relative">
              <h1 className="text-5xl md:text-[72px] lg:text-[96px] font-bold uppercase leading-[0.95] tracking-tight text-[#0F0F10]">
                BİRLİKTE<br />ÇALIŞALIM.
              </h1>
              <div className="absolute -bottom-6 left-0 w-[65%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            <div className="max-w-xs bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative flex-shrink-0">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
              <p className="text-[12px] font-light leading-loose text-[#6B6B73]">
                Formu doldurun. 1–2 iş günü içinde size dönelim, projenizi konuşalım.
              </p>
              <div className="mt-4 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">Yanıt süresi</span>
                <span className="text-[13px] font-medium text-[#0F0F10]">1–2 iş günü</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 2. FORM + BİLGİ */}
      <section className="py-20 md:py-28 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">

            {/* Sol — Bilgi paneli */}
            <div className="md:col-span-4 flex flex-col gap-10">

              <div>
                <SectionLabel label="İletişim Bilgileri" />
                <div className="flex flex-col gap-6">
                  {[
                    { label: 'E-posta', value: 'hello@opsiron.com', href: 'mailto:hello@opsiron.com' },
                  ].map((item) => (
                    <div key={item.label} className="group flex flex-col gap-1 border-b border-[#F4F4F5] pb-5">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">{item.label}</span>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors flex items-center gap-2 group-hover:gap-3 duration-300"
                      >
                        {item.value}
                        <span className="text-[#E4E4E7] group-hover:text-[#0F0F10] transition-colors text-sm">↗</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Süreç özeti */}
              <div className="bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] mb-6">Süreç</p>
                <div className="flex flex-col gap-5">
                  {[
                    { no: '01', text: 'Formu doldurursunuz.' },
                    { no: '02', text: '1–2 gün içinde size dönüyoruz.' },
                    { no: '03', text: 'Kısa bir keşif görüşmesi yapıyoruz.' },
                    { no: '04', text: 'Projeniz başlıyor.' },
                  ].map(step => (
                    <div key={step.no} className="flex items-start gap-4">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4D4D8] font-medium flex-shrink-0 pt-0.5">{step.no}</span>
                      <p className="text-[12px] font-light text-[#6B6B73] leading-snug">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sağ — Form */}
            <div className="md:col-span-8">
              <div className="bg-[#EFEFEA] border border-[#E4E4E7] p-8 md:p-12 shadow-[0_1px_4px_rgba(0,0,0,0.04)] relative">
                <div className="absolute top-0 left-0 w-3 h-[1px] bg-[#0F0F10]"></div>
                <div className="absolute top-0 left-0 w-[1px] h-3 bg-[#0F0F10]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-[#D4D4D8]"></div>
                <div className="absolute bottom-0 right-0 w-[1px] h-3 bg-[#D4D4D8]"></div>

              {submitted ? (
                /* Başarı ekranı */
                <div className="flex flex-col items-start gap-8 py-8 border-t border-[#D4D4D8]">
                  <div className="relative">
                    <div className="absolute -left-6 top-1/2 w-4 h-[1px] bg-[#A1A1AA]"></div>
                    <div className="absolute left-0 -top-6 w-[1px] h-4 bg-[#A1A1AA]"></div>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] ml-4">Gönderildi</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.06em] text-[#0F0F10] leading-tight">
                    Mesajınız<br />alındı.
                  </h2>
                  <p className="text-[14px] font-light leading-loose text-[#6B6B73] max-w-md">
                    En kısa sürede, en geç 1–2 iş günü içinde size dönüyoruz. Projenizi konuşmayı dört gözle bekliyoruz.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }}
                    className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B73] border-b border-[#E4E4E7] pb-1 hover:text-[#0F0F10] hover:border-[#0F0F10] transition-colors"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                  {/* Kişisel bilgiler */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                      label="Ad Soyad"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Adınız"
                      required
                    />
                    <FormField
                      label="Şirket / Marka"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Marka adı (isteğe bağlı)"
                    />
                  </div>

                  <FormField
                    label="E-posta"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ornek@marka.com"
                    required
                  />

                  {/* Proje detayları */}
                  <FormSelect
                    label="İlgilendiğiniz Hizmet"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    options={SERVICES}
                    required
                  />

                  {/* Mesaj */}
                  <div className="flex flex-col gap-2 group">
                    <label className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] font-medium group-focus-within:text-[#0F0F10] transition-colors">
                      Projeniz Hakkında <span className="text-[#0F0F10]">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Markanızı, projenizi ve beklentilerinizi kısaca anlatın."
                      className="bg-transparent border-b border-[#E4E4E7] py-3 text-[14px] font-light text-[#0F0F10] placeholder-[#C4C4C8] outline-none focus:border-[#0F0F10] transition-colors duration-300 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Alt satır — uyarı + buton */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4 border-t border-[#D4D4D8]">
                    <p className="text-[10px] font-light text-[#A1A1AA] leading-relaxed max-w-xs">
                      Bilgileriniz yalnızca iletişim amacıyla kullanılır, üçüncü taraflarla paylaşılmaz.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-shrink-0 inline-flex h-14 items-center justify-center bg-[#0F0F10] px-12 text-[11px] uppercase tracking-[0.2em] font-medium text-white transition-all duration-300 hover:bg-[#27272A] shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.13)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-3">
                          <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"></span>
                          Gönderiliyor
                        </span>
                      ) : 'Gönder'}
                    </button>
                  </div>

                </form>
              )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;