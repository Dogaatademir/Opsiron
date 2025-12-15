import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Briefcase, Users, ArrowRight, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // API entegrasyonu buraya gelecek
    setSubmitted(true);
  }

  return (
    <>
    {/* HERO SECTION */}
    <section className="hero">
        <div className="container">
            <h1>İşletmenizi Tanıyalım</h1>
            <p style={{maxWidth:'700px'}}>
              Size hazır bir paket satmaya çalışmıyoruz. Operasyonel kör noktalarınızı bulmak ve ForgeOps altyapısının size uygun olup olmadığını anlamak için ücretsiz bir keşif görüşmesi planlayalım.
            </p>
        </div>
    </section>

    <section className="section">
        <div className="container">
            <div className="grid-2">
                
                {/* SOL TARA: DETAYLI ANALİZ FORMU */}
                <div>
                    {!submitted ? (
                        <div className="card" style={{borderTop:'4px solid var(--text-main)'}}>
                            <h3 style={{marginBottom:'1.5rem'}}>Keşif Formu</h3>
                            <form onSubmit={handleContactSubmit}>
                                <div className="form-row">
                                    <div>
                                        <label className="input-label">Adınız Soyadınız</label>
                                        <input type="text" className="input" placeholder="Ad Soyad" required />
                                    </div>
                                    <div>
                                        <label className="input-label">Şirket / İşletme Adı</label>
                                        <input type="text" className="input" placeholder="İşletme Adı" required />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div>
                                        <label className="input-label">E-posta Adresi</label>
                                        <input type="email" className="input" placeholder="ornek@sirket.com" required />
                                    </div>
                                    <div>
                                        <label className="input-label">Telefon</label>
                                        <input type="tel" className="input" placeholder="0555..." required />
                                    </div>
                                </div>

                                {/* YENİ: Segmentasyon Alanları */}
                                <div className="form-row">
                                    <div style={{width:'100%'}}>
                                        <label className="input-label">İlgi Alanınız</label>
                                        <div style={{position:'relative'}}>
                                            <select className="input" defaultValue="" required>
                                                <option value="" disabled>Seçiniz...</option>
                                                <option value="craftops">CraftOps (Üretim & Stok)</option>
                                                <option value="serveops">ServeOps (Restoran & Hizmet)</option>
                                                <option value="consulting">Genel Danışmanlık / Emin Değilim</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{marginBottom:'1rem'}}>
                                    <label className="input-label">Operasyonel Zorluklarınız</label>
                                    <textarea className="input" style={{minHeight:'120px'}} placeholder="Örn: Stoklarımız tutmuyor, maliyet hesabında zorlanıyoruz..."></textarea>
                                </div>
                                
                                <button type="submit" className="btn btn-primary" style={{width:'100%', display:'flex', justifyContent:'center', gap:'0.5rem'}}>
                                    Keşif Görüşmesi Talep Et <ArrowRight size={18} />
                                </button>
                                <p style={{fontSize:'0.75rem', marginTop:'1rem', color:'var(--text-muted)', textAlign:'center'}}>
                                    Formu göndererek KVKK aydınlatma metnini kabul etmiş olursunuz.
                                </p>
                            </form>
                        </div>
                    ) : (
                        <div className="card" style={{textAlign:'center', padding:'3rem 1rem', borderTop:'4px solid var(--status-good)'}}>
                            <CheckCircle size={64} style={{color:'var(--status-good)', marginBottom:'1.5rem'}} />
                            <h3>Talebini Aldık!</h3>
                            <p style={{marginBottom:'2rem'}}>
                                İşletme profilinizi inceliyoruz. Ekibimiz 24 saat içinde size ulaşıp, <strong>30 dakikalık online keşif görüşmesi</strong> için takvim önerisi sunacak.
                            </p>
                            <button className="btn btn-outline" onClick={() => setSubmitted(false)}>Yeni Form Doldur</button>
                        </div>
                    )}
                </div>

                {/* SAĞ TARAF: CONTEXT & İLETİŞİM */}
                <div>
                    {/* Süreç Bilgilendirmesi */}
                    <div className="card" style={{background:'var(--bg-secondary)', marginBottom:'2rem'}}>
                        <h4 style={{marginBottom:'1.5rem'}}>Süreç Nasıl İşler?</h4>
                        <ul style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
                            <li style={{display:'flex', gap:'1rem'}}>
                                <div style={{background:'white', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontWeight:'bold', fontSize:'0.9rem', flexShrink:0}}>1</div>
                                <div>
                                    <strong style={{display:'block', fontSize:'0.95rem'}}>Ön İnceleme</strong>
                                    <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Formdaki verilerinize göre işletmenizin yapısını analiz ederiz.</span>
                                </div>
                            </li>
                            <li style={{display:'flex', gap:'1rem'}}>
                                <div style={{background:'white', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontWeight:'bold', fontSize:'0.9rem', flexShrink:0}}>2</div>
                                <div>
                                    <strong style={{display:'block', fontSize:'0.95rem'}}>Keşif Toplantısı</strong>
                                    <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>30 dakikalık online görüşmede sorunlarınızı dinler, çözüm haritası çıkarırız.</span>
                                </div>
                            </li>
                            <li style={{display:'flex', gap:'1rem'}}>
                                <div style={{background:'white', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontWeight:'bold', fontSize:'0.9rem', flexShrink:0}}>3</div>
                                <div>
                                    <strong style={{display:'block', fontSize:'0.95rem'}}>Teklif & Demo</strong>
                                    <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Size özel yapılandırılmış demo ortamı ve fiyat teklifini sunarız.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div className="card">
                        <h3>Doğrudan Ulaşın</h3>
                        <p style={{fontSize:'0.9rem', marginBottom:'1.5rem'}}>Acil durumlar veya iş birliği teklifleri için:</p>
                        
                        <div style={{display:'flex', gap:'1rem', marginBottom:'1rem', alignItems:'center'}}>
                            <Mail className="feature-icon" size={20} style={{marginBottom:0}} />
                            <a href="mailto:hello@forgeops.com" style={{color:'var(--text-main)', textDecoration:'none'}}>hello@forgeops.com</a>
                        </div>
                        <div style={{display:'flex', gap:'1rem', marginBottom:'1rem', alignItems:'center'}}>
                            <Phone className="feature-icon" size={20} style={{marginBottom:0}} />
                            <a href="tel:+902120000000" style={{color:'var(--text-main)', textDecoration:'none'}}>+90 (537) 690 33 33</a>
                        </div>
                        <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
                            <MapPin className="feature-icon" size={20} style={{marginBottom:0, marginTop:'4px'}} />
                            <span style={{fontSize:'0.95rem'}}>
                               
                                Ankara / Türkiye
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
    </>
  );
}