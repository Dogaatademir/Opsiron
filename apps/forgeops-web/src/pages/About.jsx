import { Link } from 'react-router-dom';
import { Check, Target, Layers, Settings, Database, TrendingUp, Lightbulb } from 'lucide-react';

export default function About() {
  return (
    <>
      {/* Intro / Hero Bölümü */}
      <section className="hero">
        <div className="container">
           
            <h1>Operasyonel Netlik</h1>
            <p style={{maxWidth:'800px'}}>
              ForgeOps; üretim atölyelerinden hizmet noktalarına kadar uzanan karmaşık süreçlerde, işletmelerin kârlılığını sessizce eriten 'görünmeyen kayıpları' tespit edip görünür kılan stratejik teknoloji ortağınızdır. Excel tabloları, mesajlaşma uygulamaları ve defter notları arasında kaybolan operasyonel veriyi 'Tek Doğruluk Kaynağı' (Single Source of Truth) ilkesiyle tek bir merkezde topluyor; kararlarınızı varsayımlara değil, somut verilere dayandırmanızı sağlıyoruz. </p>
        </div>
      </section>

      {/* Biz Kimiz & Kimlik Bölümü */}
      <section className="section">
        <div className="container">
            <div className="grid-2">
                <div>
                    <div className="section-header">
                        <h2>Biz Kimiz?</h2>
                    </div>
                    <div style={{fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)'}}>
                        <p style={{marginBottom: '1.5rem'}}>
                            ForgeOps, 2025 yılında işletmelerin operasyonel kör noktalarını aydınlatmak için kurulmuş yeni nesil bir teknoloji şirketidir.
                        </p>
                        <p style={{marginBottom: '1.5rem'}}>
                            <strong>Biz bir "özel yazılım" ajansı değiliz.</strong> Her müşteri için sıfırdan kod yazmayız. Kendi geliştirdiğimiz güçlü ürün altyapılarını (CraftOps & ServeOps), işletmenizin reçetesine, üretim hattına ve finansal döngüsüne göre <em>yapılandırırız.</em>
                        </p>
                        <p style={{marginBottom: 0}}>
                            Böylece "hazır paket" yazılımların katılığından kurtulurken, "özel yazılım" projelerinin yüksek maliyet ve belirsizlik riskini taşımazsınız.
                        </p>
                    </div>
                </div>
                
                {/* Vizyon Kartı - ServeOps Vurgusu */}
                <div className="card" style={{background: 'var(--bg-secondary)', borderLeft: '4px solid var(--text-main)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'1rem'}}>
                        <Lightbulb size={24} />
                        <h3 style={{margin:0}}>Gelecek Vizyonumuz</h3>
                    </div>
                    <p style={{fontSize: '0.95rem', marginBottom: '1rem'}}>
                        Bugün <strong>CraftOps</strong> ile üretim sahasındaki maliyet ve stok kaçaklarını kontrol altına alıyoruz.
                    </p>
                    <p style={{fontSize: '0.95rem', marginBottom: 0}}>
                        Yakın gelecekte ise geliştirme süreci devam eden <strong>ServeOps</strong> ile restoran ve kafe sektöründe POS verisini iş zekâsına dönüştüren, "ne satmalı, neyi stoklamalı" sorularına yanıt veren akıllı bir ekosistem kurmayı hedefliyoruz.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Yaklaşımımız (Core Messages) */}
      <section className="section" style={{background: 'var(--bg-secondary, #f8f9fa)'}}>
        <div className="container">
            <div className="grid-2">
                <div>
                    <h2>Neyi Değiştiriyoruz?</h2>
                    <p style={{marginBottom: '1.5rem'}}>
                        Geleneksel işletmelerde veri; Excel dosyalarında, WhatsApp gruplarında ve defter kenarlarında kaybolur. Bu da "tahmini" kararlara ve görünmeyen zararlara yol açar.
                    </p>
                    
                    <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem'}}>
                        <Database className="feature-icon" size={24} />
                        <div>
                            <h4 style={{fontSize:'1.1rem', marginBottom:'0.5rem'}}>Tek Doğruluk Kaynağı (SSOT)</h4>
                            <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Stok, finans ve üretim verisi tek bir merkezde konuşur. Birim maliyetiniz ile kasa durumunuz birbiriyle çelişmez.</p>
                        </div>
                    </div>

                    <div style={{display:'flex', gap:'1rem'}}>
                        <TrendingUp className="feature-icon" size={24} />
                        <div>
                            <h4 style={{fontSize:'1.1rem', marginBottom:'0.5rem'}}>Görünür Kârlılık</h4>
                            <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Ay sonunda "neden kasada para yok" demek yerine, hangi ürünün size kaybettirdiğini anlık olarak görürsünüz.</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <ul style={{display: 'flex', flexDirection: 'column', gap: '1rem', background:'white', padding:'2rem', borderRadius:'var(--radius)', border:'1px solid var(--border)'}}>
                        <h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>ForgeOps Farkı</h3>
                        {[
                            "Sahada personeli yormayan arayüzler",
                            "Ürün altyapısı üzerine terzi işi kurulum",
                            "Operasyonel yükü azaltan otomasyonlar",
                            "Sadece veri giren değil, karar aldıran sistem",
                            "İşletmeyle birlikte büyüyen modüler yapı"
                        ].map((item, index) => (
                            <li key={index} style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                <div style={{background: 'var(--bg-page)', padding: '0.4rem', borderRadius: '50%', display:'flex'}}>
                                    <Check size={16} color="var(--text-main)" />
                                </div>
                                <span style={{fontWeight: 500, fontSize:'0.95rem'}}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Nasıl Çalışırız */}
      <section className="section">
        <div className="container">
            <div className="section-header" style={{textAlign: 'center', margin: '0 auto 3rem auto'}}>
                <h2>Çalışma Modelimiz</h2>
                <p>Ürünlerimizi "indir ve kullan" şeklinde değil, bir çözüm ortaklığı süreciyle sunarız.</p>
            </div>
            <div className="grid-3">
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>01</div>
                    <h3>Süreç Analizi</h3>
                    <p style={{fontSize: '0.95rem'}}>İşletmenizi ziyaret ediyor veya online toplantı ile operasyonunuzu, stok mantığınızı ve finans döngünüze hakim oluyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>02</div>
                    <h3>Kapsam Belirleme</h3>
                    <p style={{fontSize: '0.95rem'}}>Sadece stok mu, sadece finansal takip mi, yoksa tam entegrasyon mu? CraftOps veya ServeOps modüllerinden hangilerine ihtiyacınız olduğunu seçiyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>03</div>
                    <h3>Konfigürasyon</h3>
                    <p style={{fontSize: '0.95rem'}}>Sıfırdan yazmıyoruz, ayarlıyoruz. Alanlar, raporlar ve akışlar işletmenizin diline göre uyarlanıyor.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>04</div>
                    <h3>Devreye Alma & Eğitim</h3>
                    <p style={{fontSize: '0.95rem'}}>Geçmiş verilerinizi aktarıyor, ekibinize pratik kullanım eğitimi veriyor ve sistemi "canlı"ya alıyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>05</div>
                    <h3>Pilot Kullanım</h3>
                    <p style={{fontSize: '0.95rem'}}>İlk haftalarda yanınızdayız. Gerçek saha kullanımında ortaya çıkan ihtiyaçlara göre ince ayarlar yapıyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>06</div>
                    <h3>Süreklilik</h3>
                    <p style={{fontSize: '0.95rem'}}>Abonelik modeliyle düzenli güncellemeler, veri güvenliği ve teknik destek hizmetimiz devam ediyor.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Hizmet ve Fiyatlandırma Modeli */}
      <section className="section" style={{background: 'var(--bg-secondary, #f8f9fa)'}}>
        <div className="container">
            <div className="grid-2">
                <div>
                    <Layers size={32} style={{marginBottom: '1.5rem', opacity: 0.5}} />
                    <h2>Hizmet Yapısı</h2>
                    <p>ForgeOps iş birliği iki temel bileşenden oluşur: <strong>Kurulum</strong> ve <strong>Abonelik</strong>.</p>
                    <div style={{marginTop: '2rem'}}>
                        <div style={{marginBottom: '1.5rem'}}>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>1. Kurulum (Onboarding)</h3>
                            <p style={{fontSize: '0.95rem', color: 'var(--text-muted)'}}>
                                Sistemin işletmenize özel hale getirilmesi, veri aktarımı ve eğitim sürecini kapsayan tek seferlik proje bedelidir.
                            </p>
                        </div>
                        
                        <div>
                            <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>2. Yazılım Aboneliği</h3>
                            <p style={{fontSize: '0.95rem', color: 'var(--text-muted)'}}>
                                Kurulum tamamlandıktan sonra; sistemin sunucularımızda barınması, güvenliği ve sürekli gelişimi için aylık hizmet bedeli uygulanır.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card" style={{background: 'var(--bg-page)', border: '2px solid var(--border)'}}>
                    <Settings size={28} style={{marginBottom: '1rem', opacity: 0.5}} />
                    <h3>Abonelik Neleri Kapsar?</h3>
                    <p style={{fontSize: '0.9rem', marginBottom:'1.5rem'}}>Yazılımı satın alıp yalnız kalmazsınız. Aboneliğiniz, işleyen bir teknoloji departmanı kiralamak gibidir.</p>
                    
                    <ul style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                        {[
                            'Sunucu maliyetleri ve veri yedekleme',
                            'SSL sertifikası ve güvenlik güncellemeleri',
                            'Yeni özellikler ve versiyon yükseltmeleri',
                            'Öncelikli teknik destek kanalı',
                            'Hata düzeltmeleri ve bakım',
                        ].map((item, index) => (
                            <li key={index} style={{display: 'flex', gap: '0.8rem', fontSize: '0.9rem', alignItems: 'flex-start'}}>
                                <Check size={16} style={{marginTop: '2px', flexShrink: 0}} />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </section>

      {/* Amacımız Bölümü */}
      <section className="section">
        <div className="container">
            <div className="section-header">
                <h2>Nihai Hedefimiz</h2>
                <p>İşletmeleri "sezgisel" yönetimden, "verisel" yönetime taşımak.</p>
            </div>
            <div className="grid-2">
                {[
                    "Operasyonel karmaşayı %80 oranında azaltmak",
                    "Stok kaçaklarını ve görünmez maliyetleri sıfırlamak",
                    "İşletme sahibine 'sürprizsiz' bir finansal tablo sunmak",
                    "Teknolojiyle büyüyen, sürdürülebilir işletmeler yaratmak"
                ].map((item, index) => (
                    <div className="card" key={index} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem'}}>
                        <Target size={20} style={{flexShrink: 0, opacity: 0.7}} />
                        <h4 style={{marginBottom: 0, fontSize: '1rem', fontWeight: 500}}>{item}</h4>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Alt CTA */}
      <section className="final-cta">
        <div className="container">
            <h2>İşletmenize uygun çözümü birlikte kuralım.</h2>
            <p style={{marginBottom: '2rem'}}>
                İhtiyaç analizi için görüşelim. CraftOps veya ServeOps'un işletmenize neler katabileceğini konuşalım.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-white">İletişime Geçin</Link>
                <Link to="/pricing" className="btn btn-outline" style={{borderColor: 'rgba(255,255,255,0.3)', color: 'white'}}>Fiyatlandırmayı İncele</Link>
            </div>
        </div>
      </section>
    </>
  );
}