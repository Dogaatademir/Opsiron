import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp, ArrowRight, Package, PieChart, Layers, Sparkles, AlertCircle } from 'lucide-react';

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);

  // Ürün bazlı özellik listeleri
  const craftOpsFeatures = {
    stock: ['Hammadde Giriş/Çıkış', 'Anlık Stok Sayımı', 'Kritik Seviye Uyarıları', 'Tedarikçi Takibi'],
    financial: ['Reçete Bazlı Maliyet', 'Üretim Fire Analizi', 'Satınalma & Satış', 'Kârlılık Raporları'],
    full: ['Tüm Stok Özellikleri', 'Tüm Finansal Özellikler', 'Uçtan Uca İzlenebilirlik', 'Rol Bazlı Yetkilendirme']
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Neden web sitesinde sabit bir fiyat listesi yok?",
      a: "Çünkü 'kullanıcı başı lisans' satan bir SaaS değiliz. İşletmenizin ölçeği, şube sayısı ve ihtiyaç duyduğu modüllere (sadece stok, finans veya entegre) göre size özel, sürdürülebilir bir teklif oluşturuyoruz."
    },
    {
      q: "ServeOps ürününü hemen satın alabilir miyim?",
      a: "ServeOps şu an 'Early Access' (Erken Erişim) dönemindedir. Sadece seçili pilot işletmelerle çalışıyoruz. Başvuru formunu doldurarak bekleme listesine katılabilirsiniz."
    },
    {
      q: "Sistemi denemek için demo hesabı açabilir miyim?",
      a: "Size boş bir ekran verip 'inceleyin' demek yerine; süreçlerinizi dinlediğimiz 30 dakikalık bir online görüşme yapıyoruz. Size uygunsa, verilerinizle oluşturulmuş bir pilot ortam sunuyoruz."
    },
    {
      q: "Kurulum ücreti ödemek zorunda mıyım?",
      a: "Evet. Biz sadece yazılım vermiyoruz; verilerinizi temizliyor, reçetelerinizi sisteme giriyor ve ekibinizi eğitiyoruz. Sistemin gerçekten çalışması için bu kurulum süreci zorunludur."
    },
    {
      q: "Küçük bir atölyeyim, yine de kullanabilir miyim?",
      a: "Kesinlikle. CraftOps'un 'Sadece Stok' modülü ile başlayıp, işler büyüdükçe finansal modülleri devreye alabilirsiniz. İhtiyacınız olmayan özelliklere para ödemezsiniz."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
           <h1>İşletmenize Değer Katan Model</h1>
          <p style={{ maxWidth: '700px', marginBottom: '1.5rem' }}>
            ForgeOps çözümleri, işletmenizin ihtiyacına göre modüler olarak yapılandırılır. İhtiyacınız olmayan özelliklere para ödemez, kullandıkça büyütürsünüz.
          </p>
          
          {/* Eklenen Not */}
          <div style={{display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)'}}>
             <p style={{fontSize: '0.9rem', marginBottom: 0, fontStyle: 'italic', opacity: 0.9}}>
               "Her işletmenin ihtiyacı farklıdır. Bu nedenle ForgeOps’ta hazır bir fiyat listesi değil, işletmenize özel bir teklif sunarız."
             </p>
          </div>
        </div>
      </section>

      {/* CraftOps Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              CraftOps <span className="u-label" style={{ fontSize: '0.8rem', margin: 0 }}>Üretim & Stok</span>
            </h2>
            <p>Üretim atölyeleri ve imalatçılar için ölçeklenebilir paketler.</p>
          </div>

          <div className="grid-3">
            {/* Plan 1: Sadece Stok */}
            <div className="card">
              <div style={{ marginBottom: '1.5rem' }}>
                <Package size={32} className="feature-icon" style={{ color: 'var(--text-main)' }} />
                <h3>Stok Modülü</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Depo düzeni ve sayım kontrolü isteyenler için.</p>
              </div>
              <ul style={{ marginBottom: '2rem', flex: 1 }}>
                {craftOpsFeatures.stock.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Check size={16} color="var(--status-good)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ width: '100%' }}>Teklif İste</Link>
            </div>

            {/* Plan 2: Sadece Finansal */}
            <div className="card">
              <div style={{ marginBottom: '1.5rem' }}>
                <PieChart size={32} className="feature-icon" style={{ color: 'var(--text-main)' }} />
                <h3>Finans Modülü</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Maliyet, reçete ve kârlılığı görmek isteyenler için.</p>
              </div>
              <ul style={{ marginBottom: '2rem', flex: 1 }}>
                {craftOpsFeatures.financial.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Check size={16} color="var(--status-good)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-outline" style={{ width: '100%' }}>Teklif İste</Link>
            </div>

            {/* Plan 3: Tam Paket */}
            <div className="card" style={{ borderColor: 'var(--text-main)', borderWidth: '2px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '1rem', background: 'var(--text-main)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                ÖNERİLEN
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <Layers size={32} className="feature-icon" style={{ color: 'var(--status-good)' }} />
                <h3>Tam Entegre Modül</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>Stok ve finansın tek ekranda yönetildiği yapı.</p>
              </div>
              <ul style={{ marginBottom: '2rem', flex: 1 }}>
                {craftOpsFeatures.full.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 500 }}>
                    <Check size={16} color="var(--status-good)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ width: '100%' }}>Analiz Talep Et</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ServeOps Section (Ayrıştırılmış Görünüm) */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              ServeOps <span className="pill neutral" style={{ fontSize: '0.7rem', padding: '2px 6px', height: 'auto' }}>Yakında</span>
            </h2>
            <p>Restoran ve hizmet sektörü için POS entegrasyonlu çözüm.</p>
          </div>

          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem', border: '2px dashed var(--border)', background: 'white' }}>
            <Sparkles size={48} style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }} />
            <h2>ServeOps Pilot Programı</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-muted)' }}>
              ServeOps şu anda kapalı beta sürecindedir. Restoran ve kafe işletmeleri için geliştirdiğimiz POS entegrasyonlu stok/maliyet sistemini
              ilk kullananlardan olmak ve ömür boyu avantajlı fiyatlardan yararlanmak için bekleme listesine katılın.
            </p>
            <Link to="/serveops" className="btn btn-primary">Pilot Başvurusu Yap</Link>
            <p style={{ fontSize: '0.8rem', marginTop: '1.5rem', opacity: 0.6 }}>*Pilot program sınırlı sayıda işletme için geçerlidir.</p>
          </div>
        </div>
      </section>

      {/* Hizmet Modeli (Setup + Subscription) */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="u-label">Çalışma Prensibi</span>
              <h2>Hizmet Modeli & Kurulum</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                ForgeOps, "indir ve kur" mantığıyla çalışmaz. İşletmenizin verilerini güvence altına alan iki aşamalı bir süreç uygularız.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>1. Kurulum & Onboarding (Tek Seferlik)</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Sistemin teknik kurulumu, veri aktarımı (reçeteler, cariler, stoklar) ve personel eğitimi bu aşamada yapılır.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>2. Hizmet Aboneliği (Aylık/Yıllık)</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Sunucu barındırma, güvenlik, yedekleme ve sürekli teknik destek hizmetini kapsar.
                </p>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} /> Neden Kurulum Ücreti Var?
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.6' }}>
                Çoğu ERP projesinin başarısız olma sebebi, yanlış veri girişi ve yetersiz eğitimdir.
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: 0, lineHeight: '1.6' }}>
                Biz size sadece bir "kullanıcı adı" satmıyoruz. İşleyen, verileri temizlenmiş ve personelin kullanabildiği <strong>çalışan bir sistem</strong> teslim ediyoruz. Bu efor, projenin başarısı için kritiktir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header" style={{ textAlign: 'center', margin: '0 auto 3rem auto' }}>
            <h2>Merak Edilenler</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqData.map((item, index) => (
              <div
                key={index}
                className="card"
                style={{ background: 'white', padding: '1.5rem', cursor: 'pointer', borderColor: openFaq === index ? 'var(--text-main)' : 'var(--border)', transition: 'all 0.2s' }}
                onClick={() => toggleFaq(index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ marginBottom: 0, fontSize: '1rem', fontWeight: 500, paddingRight: '1rem' }}>{item.q}</h4>
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {openFaq === index && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Size uygun planı oluşturalım.</h2>
          <p style={{ marginBottom: '2rem' }}>İşletmenizin ölçeğine ve ihtiyacına göre en doğru maliyeti çıkarmak için tanışalım.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/contact" className="btn btn-white">
              Teklif İsteyin <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}