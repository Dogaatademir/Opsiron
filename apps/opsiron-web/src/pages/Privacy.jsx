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

// --- İçerik ---

const SECTIONS = [
  {
    no: '01',
    title: 'Hangi Verileri Topluyoruz?',
    body: [
      'Web sitemizi ziyaret ettiğinizde veya iletişim formunu doldurduğunuzda bazı kişisel veriler tarafımıza iletilmektedir. Bu veriler yalnızca şunlardır:',
      '— Ad soyad ve iletişim e-posta adresi (form aracılığıyla ilettiğiniz)',
      '— Marka veya şirket adı (isteğe bağlı olarak ilettiğiniz)',
      '— Projenizle ilgili paylaştığınız bilgiler (form mesajı)',
      'Bunların dışında; tarayıcı türü, ziyaret süresi ve sayfa görüntülemeleri gibi anonim analitik veriler de toplanabilir. Bu veriler hiçbir koşulda kişisel kimliğinizle ilişkilendirilmez.',
    ],
  },
  {
    no: '02',
    title: 'Verilerinizi Neden Kullanıyoruz?',
    body: [
      'Topladığımız veriler yalnızca aşağıdaki amaçlarla kullanılır:',
      '— Gönderdiğiniz mesaja yanıt vermek ve proje görüşmesi ayarlamak',
      '— Size daha iyi bir deneyim sunmak adına web sitesini geliştirmek',
      '— Yasal yükümlülüklerimizi yerine getirmek',
      'Verileriniz; pazarlama amaçlı, izinsiz e-posta gönderimi veya profil oluşturma gibi hiçbir ikincil amaç için kullanılmaz.',
    ],
  },
  {
    no: '03',
    title: 'Verilerinizi Kimlerle Paylaşıyoruz?',
    body: [
      'Opsiron, topladığı kişisel verileri herhangi bir üçüncü tarafla satmaz, kiralamaz veya ticari amaçla paylaşmaz.',
      'Verileriniz yalnızca aşağıdaki durumlarda sınırlı biçimde üçüncü taraflarla paylaşılabilir:',
      '— Hizmet altyapısını sağlayan ve aynı gizlilik standartlarına tabi tutulan teknik servis sağlayıcılar (e-posta servisi, hosting gibi)',
      '— Yasal zorunluluk doğurması halinde yetkili kamu kurumları',
      'Bu durumların dışında verileriniz yalnızca sizinle olan iş ilişkimiz kapsamında kalır.',
    ],
  },
  {
    no: '04',
    title: 'Verilerinizi Ne Kadar Süre Saklıyoruz?',
    body: [
      'Kişisel verileriniz, iletişim veya proje süreci sona erdikten sonra gereksiz yere saklanmaz.',
      'İletişim formu aracılığıyla iletilen veriler; iş ilişkisinin fiilen sona ermesinin ardından en fazla 2 yıl boyunca saklanır ve bu sürenin sonunda kalıcı olarak silinir.',
      'Analitik amaçlı anonim veriler için bu süre kısıtlaması geçerli değildir; bu veriler kişisel kimlik içermediğinden silinme talebi kapsamı dışındadır.',
    ],
  },
  {
    no: '05',
    title: 'Çerezler (Cookies)',
    body: [
      'Web sitemiz, oturum yönetimi ve anonim kullanım analizi amacıyla sınırlı düzeyde çerez kullanabilir.',
      'Zorunlu çerezler: Sitenin doğru çalışması için gereklidir ve devre dışı bırakılamaz.',
      'Analitik çerezler: Sayfaların nasıl kullanıldığını anlamamıza yardımcı olur. Bu çerezler tamamen anonimdir; kişisel veri içermez.',
      'Reklam veya üçüncü taraf izleme çerezi kullanılmamaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi her zaman yönetebilirsiniz.',
    ],
  },
  {
    no: '06',
    title: 'Haklarınız Nelerdir?',
    body: [
      'Kişisel verileriniz üzerinde aşağıdaki haklara sahipsiniz:',
      '— Erişim hakkı: Hakkınızda hangi verilerin tutulduğunu öğrenme',
      '— Düzeltme hakkı: Yanlış veya eksik verilerin güncellenmesini talep etme',
      '— Silme hakkı: Verilerinizin silinmesini talep etme ("unutulma hakkı")',
      '— İtiraz hakkı: Belirli veri işleme faaliyetlerine itiraz etme',
      '— Taşınabilirlik hakkı: Verilerinizi yapılandırılmış biçimde almanı talep etme',
      'Bu haklarınızı kullanmak için hello@opsiron.com adresine e-posta göndermeniz yeterlidir. Talepleriniz en geç 30 gün içinde yanıtlanır.',
    ],
  },
  {
    no: '07',
    title: 'Veri Güvenliği',
    body: [
      'Kişisel verilerinizin güvenliği bizim için önemlidir. Bu doğrultuda teknik ve idari güvenlik önlemleri uygulamaktayız.',
      'Veriler şifreli bağlantılar (HTTPS) üzerinden iletilir. Erişim yalnızca yetkili kişilerle sınırlıdır. Düzenli güvenlik güncellemeleri yapılır.',
      'Bununla birlikte, internet üzerinden yapılan hiçbir veri aktarımının %100 güvenli olduğu garanti edilemez. Makul her önlemi almakla birlikte mutlak güvenlik taahhüdünde bulunmak mümkün değildir.',
    ],
  },
  {
    no: '08',
    title: 'Politika Güncellemeleri',
    body: [
      'Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler yapıldığında web sitesinde duyurulur.',
      'Politikanın en güncel versiyonu her zaman bu sayfada yayımlanır. Sayfanın en üstünde yer alan "Son güncelleme" tarihi referans olarak kullanılabilir.',
      'Siteyi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.',
    ],
  },
];

// --- Bileşen ---

const PrivacyPage = () => {
  const lastUpdated = '10 Nisan 2026';

  return (
    <div className="w-full relative bg-[#F7F7F5] text-[#0F0F10] font-sans selection:bg-[#0F0F10] selection:text-white">

      {/* 1. HERO */}
      <section className="relative flex flex-col justify-end min-h-[45vh] w-full pt-32 pb-16 overflow-hidden bg-[#F7F7F5]">

        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage: "linear-gradient(#E4E4E7 1px, transparent 1px), linear-gradient(90deg, #E4E4E7 1px, transparent 1px)",
            backgroundSize: "6rem 6rem",
          }}
        />

        <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none overflow-hidden opacity-20 hidden md:block">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-[#D4D4D8] stroke-[0.1] fill-none">
            <line x1="0" y1="100" x2="100" y2="0" />
            <line x1="30" y1="100" x2="100" y2="30" />
            <line x1="60" y1="100" x2="100" y2="60" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col gap-10">
          <SectionLabel label="Opsiron — Hukuki" />

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="relative">
              <h1 className="text-4xl md:text-[60px] lg:text-[80px] font-bold uppercase leading-[0.95] tracking-tight text-[#0F0F10]">
                GİZLİLİK<br />POLİTİKASI
              </h1>
              <div className="absolute -bottom-6 left-0 w-[55%] h-[1px] bg-[#E4E4E7]"></div>
            </div>

            <div className="bg-white border border-[#E4E4E7] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative flex-shrink-0">
              <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
              <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">Son Güncelleme</span>
                  <span className="text-[13px] font-medium text-[#0F0F10]">{lastUpdated}</span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-[#F4F4F5] pt-3">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">Kapsam</span>
                  <span className="text-[13px] font-medium text-[#0F0F10]">opsiron.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 2. GİRİŞ */}
      <section className="py-16 md:py-20 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <SectionLabel label="Genel Açıklama" />
            </div>
            <div className="md:col-span-7 md:col-start-5 flex flex-col gap-5">
              <p className="text-[15px] md:text-[16px] font-light leading-loose text-[#3F3F46]">
                Opsiron olarak kişisel verilerinizin gizliliğini ciddiye alıyoruz. Bu politika; web sitemizi ziyaret ettiğinizde veya hizmetlerimizden yararlandığınızda hangi verilerin toplandığını, nasıl kullanıldığını ve haklarınızın neler olduğunu açıkça ortaya koymaktadır.
              </p>
              <p className="text-[14px] font-light leading-loose text-[#6B6B73]">
                Veri toplama ve işleme süreçlerimiz; 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) kapsamında yürütülmektedir.
              </p>
              <div className="border-l-2 border-[#E4E4E7] pl-5 mt-2">
                <p className="text-[12px] font-light leading-relaxed text-[#A1A1AA]">
                  Bu politika yalnızca opsiron.com alan adı kapsamındaki veri işleme faaliyetleri için geçerlidir. Üçüncü taraf bağlantılar ayrı gizlilik politikalarına tabidir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* 3. POLİTİKA MADDELERİ */}
      <section className="py-16 md:py-24 bg-[#F7F7F5]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-16">
            <SectionLabel label="Politika Detayları" />
            <h2 className="text-3xl md:text-4xl font-light uppercase tracking-[0.08em] text-[#0F0F10]">
              Detaylı Bilgi
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-[#E4E4E7] border-t border-[#E4E4E7]">
            {SECTIONS.map((section, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-12">

                {/* Sol — numara + başlık */}
                <div className="md:col-span-4 flex flex-col gap-3">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA] font-medium">{section.no}</span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#0F0F10] leading-snug">
                    {section.title}
                  </h3>
                </div>

                {/* Sağ — içerik */}
                <div className="md:col-span-7 md:col-start-6 flex flex-col gap-4">
                  {section.body.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className={`font-light leading-relaxed ${
                        para.startsWith('—')
                          ? 'text-[13px] text-[#6B6B73] pl-3 border-l border-[#E4E4E7]'
                          : 'text-[14px] text-[#3F3F46]'
                      }`}
                    >
                      {para}
                    </p>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      <SectionSeparator />

      {/* 4. İLETİŞİM */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-[#F7F7F5] to-[#EFEFEA]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">

            <div className="md:col-span-4">
              <SectionLabel label="Veri Sorumlusu" />
              <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.08em] text-[#0F0F10] leading-tight">
                Bize<br />Ulaşın.
              </h2>
            </div>

            <div className="md:col-span-7 md:col-start-6 flex flex-col gap-6">
              <p className="text-[14px] font-light leading-loose text-[#6B6B73]">
                Bu gizlilik politikasına ilişkin sorularınız, verilerinizin işlenmesine itirazınız veya herhangi bir talebiniz varsa aşağıdaki kanaldan bize ulaşabilirsiniz.
              </p>

              <div className="bg-white border border-[#E4E4E7] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative inline-flex flex-col gap-5 max-w-md">
                <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#0F0F10]"></div>
                <div className="absolute top-0 left-0 w-[1px] h-2 bg-[#0F0F10]"></div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">Şirket</span>
                  <span className="text-[13px] font-medium text-[#0F0F10]">Opsiron Web Design Studio</span>
                </div>

                <div className="flex flex-col gap-1 border-t border-[#F4F4F5] pt-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">E-posta</span>
                  <a
                    href="mailto:hello@opsiron.com"
                    className="text-[13px] font-medium text-[#0F0F10] hover:text-[#6B6B73] transition-colors"
                  >
                    hello@opsiron.com
                  </a>
                </div>

                <div className="flex flex-col gap-1 border-t border-[#F4F4F5] pt-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A1A1AA]">Yanıt Süresi</span>
                  <span className="text-[13px] font-light text-[#3F3F46]">En geç 30 gün</span>
                </div>
              </div>

              <p className="text-[11px] font-light text-[#A1A1AA] leading-relaxed max-w-md">
                Kişisel verilerinizin işlenmesiyle ilgili şikayetlerinizi ayrıca Kişisel Verileri Koruma Kurumu'na (kvkk.gov.tr) iletme hakkınız saklıdır.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default PrivacyPage;