import { Link } from 'react-router-dom';
import { Activity, LayoutGrid, LineChart, LifeBuoy, Package, Coffee, Check, Zap, Clock } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-text">
                <h1>Sezgisel kararların yerini veriye dayalı netlik alsın</h1>
              <p>ForgeOps; üretim ve hizmet odaklı işletmelerin operasyonlarını "tek bir doğruluk kaynağında" (single source of truth) birleştirir. Hazır paket sistemlerin dayatmalarıyla değil, işletmenizin gerçek ihtiyaçlarına göre şekillenen sürdürülebilir çözümler sunuyoruz.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-primary">Çözümleri İncele</Link>
                <Link to="/contact" className="btn btn-outline">Bizimle Tanışın</Link>
              </div>
            </div>
            
            <div className="mock-table-container">
              <div className="mock-header">
                <span className="u-label">Operasyon Özeti</span>
                <Activity size={20} style={{ color: 'var(--text-light)' }} />
              </div>
              <div className="mock-row">
                <div className="mock-cell wide"><strong>CraftOps:</strong> Üretim Fire Oranı</div>
                <div className="mock-cell">Atölye A</div>
                <div className="mock-cell right"><span className="pill">%8.2</span></div>
              </div>
              <div className="mock-row">
                <div className="mock-cell wide"><strong>CraftOps:</strong> Kritik Stok Seviyesi</div>
                <div className="mock-cell">Hammadde</div>
                <div className="mock-cell right"><span className="pill">3 Ürün</span></div>
              </div>
              <div className="mock-row" style={{opacity: 0.7}}>
                <div className="mock-cell wide"><strong>ServeOps:</strong> Günlük Satış Trendi</div>
                <div className="mock-cell">POS Entegre</div>
                <div className="mock-cell right"><span className="pill neutral">Geliştiriliyor</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY FORGEOPS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Neden ForgeOps?</h2>
            <p>İşletmenizi kalıplara sokan hantal yazılımlar yerine, gerçek sorun noktalarınıza odaklanan modüler bir yaklaşım.</p>
          </div>
          <div className="grid-3">
            <div className="card">
              <LayoutGrid className="feature-icon" />
              <h3>Modüler Mimari</h3>
              <p>İster sadece stok takibi yapın, ister kapsamlı finansal analizleri ekleyin. İhtiyacınız olmayan özelliklere para ödemezsiniz. Bir modülle başlayıp, işletme büyüdükçe genişletin.</p>
            </div>
            <div className="card">
              <Zap className="feature-icon" />
              <h3>İşletmeye Özel Yapılandırma</h3>
              <p>Herkes için aynı şablon değil. Sizin reçete mantığınıza, üretim firelerinize ve tahsilat döngünüze göre özelleştirilmiş, yaşayan bir sistem.</p>
            </div>
            <div className="card">
              <LineChart className="feature-icon" />
              <h3>Görünmeyen Kayıpları Görünür Kılın</h3>
              <p>Excel ve WhatsApp karmaşasında kaybolan stok hataları, unutulan ödemeler ve maliyet sızıntılarını tespit edin. "Tahmini" değil "Gerçek" kârlılığı görün.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section" style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
        <div className="container">
            <div className="section-header">
                <h2>Ürünlerimiz</h2>
                <p>Farklı sektörler, ortak yaklaşım: Template değil, işletmenize özel çözüm.</p>
            </div>
            <div className="grid-2">
                {/* CraftOps Card */}
                <div className="card" style={{ borderLeft: '3px solid var(--text-main)' }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '1rem'}}>
                        <span className="u-label">Üretim & İmalat</span>
                        <Package style={{opacity:0.3}} size={32} />
                    </div>
                    <h3 style={{marginTop:'0.5rem', marginBottom: '1rem', fontSize: '1.5rem'}}>CraftOps</h3>
                    <p>Üretim atölyeleri, kahve kavurhaneleri ve gıda üreticileri için uçtan uca yönetim sistemi.</p>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                      <h4 style={{fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: 600}}>Öne Çıkan Özellikler:</h4>
                      <ul style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>Stok & Reçete:</strong> Hammadde, yarı mamul ve mamul takibi.</span>
                        </li>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>Gelişmiş Finans:</strong> Satın alma, satış, cari hesaplar ve tedarikçi hareketleri.</span>
                        </li>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>Maliyet Analizi:</strong> Birim maliyet ve kârlılık raporları.</span>
                        </li>
                      </ul>
                    </div>

                    <Link to="/craftops" className="btn btn-primary" style={{marginTop:'auto', width: '100%'}}>CraftOps'u İncele</Link>
                </div>

                {/* ServeOps Card */}
                <div className="card" style={{ borderLeft: '3px solid var(--text-muted)', opacity: 0.9 }}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '1rem'}}>
                        <span className="u-label">Restoran & Kafe</span>
                        <div style={{display:'flex', gap:'0.5rem'}}>
                            <span className="pill neutral" style={{fontSize:'0.7rem', display:'flex', alignItems:'center', gap:'4px'}}><Clock size={12}/> Yakında</span>
                            <Coffee style={{opacity:0.3}} size={32} />
                        </div>
                    </div>
                    <h3 style={{marginTop:'0.5rem', marginBottom: '1rem', fontSize: '1.5rem'}}>ServeOps</h3>
                    <p>Restoran, kafe ve barlar için POS entegrasyonlu iş zekası ve kârlılık yönetimi.</p>
                    
                    <div style={{marginBottom: '1.5rem'}}>
                      <h4 style={{fontSize: '0.9rem', marginBottom: '0.8rem', fontWeight: 600}}>Gelecek Özellikler:</h4>
                      <ul style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>İş Zekası (BI):</strong> En kârlı ürün, saatlik yoğunluk ve satış trendleri.</span>
                        </li>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>Kayıp Analizi:</strong> Out-of-stock nedeniyle kaçan ciro analizi.</span>
                        </li>
                        <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
                          <Check size={16} style={{marginTop: '2px', flexShrink: 0}} /> 
                          <span><strong>Tam Entegrasyon:</strong> POS verisiyle otomatik stok düşümü.</span>
                        </li>
                      </ul>
                    </div>

                    <button disabled className="btn btn-outline" style={{marginTop:'auto', width: '100%', opacity: 0.6, cursor: 'not-allowed'}}>Geliştirme Aşamasında</button>
                </div>
            </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="section">
        <div className="container">
            <div className="section-header" style={{textAlign: 'center', margin: '0 auto 3rem auto'}}>
                <h2>Nasıl Çalışırız?</h2>
                <p>İki aşamalı model: Önce işletmenize özel kurulum, sonra kesintisiz destek.</p>
            </div>
            <div className="grid-3">
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>01</div>
                    <h3>İhtiyaç Analizi</h3>
                    <p>İşletmenizin süreçlerini, stok mantığını ve finans döngüsünü anlıyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>02</div>
                    <h3>Özel Yapılandırma (Setup)</h3>
                    <p>Sistem işletmenize göre "terzi usulü" kurulur. Gereksiz karmaşa değil, sadece ihtiyacınız olan özellikler aktif edilir.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>03</div>
                    <h3>Devreye Alma</h3>
                    <p>Verilerinizi sisteme aktarıyor, ekibinizi eğitiyor ve pilot süreci başlatıyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>04</div>
                    <h3>Abonelik ve Destek</h3>
                    <p>Aylık abonelik modeliyle sunucu barındırma, güvenlik güncellemeleri ve sürekli teknik destek sağlıyoruz.</p>
                </div>
                <div className="card">
                    <div style={{fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-light)'}}>05</div>
                    <h3>Sürekli İyileştirme</h3>
                    <p>İşletmeniz büyüdükçe yeni modüller ekleyerek sistemi sizinle birlikte geliştiriyoruz.</p>
                </div>
                <div className="card" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)'}}>
                    <div style={{textAlign: 'center'}}>
                        <LifeBuoy size={32} style={{marginBottom: '1rem', opacity: 0.5}} />
                        <p style={{marginBottom: 0, fontSize: '0.9rem'}}>Yanınızdayız</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="section" style={{ background: 'var(--bg-secondary, #f8f9fa)', padding: '3rem 0' }}>
        <div className="container">
            <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>Güvenle büyüyen işletmelerin tercihi</p>
            <div className="brand-logos">
                <span className="brand-logo">KAVURHANELER</span>
                <span className="brand-logo">BUTİK ÜRETİCİLER</span>
                <span className="brand-logo">RESTORAN ZİNCİRLERİ</span>
                <span className="brand-logo">KAFELER</span>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="container">
            <h2>Excel karmaşasına son verin.</h2>
            <p style={{marginBottom: '2rem'}}>CraftOps ile üretimi, ServeOps ile geleceği planlayın. İşletmenize özel çözüm için hemen tanışalım.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-white">Hemen İletişime Geçin</Link>
                <Link to="/pricing" className="btn btn-outline" style={{borderColor: 'rgba(255,255,255,0.3)', color: 'white'}}>Fiyatlandırmayı İncele</Link>
            </div>
        </div>
      </section>
    </>
  );
}