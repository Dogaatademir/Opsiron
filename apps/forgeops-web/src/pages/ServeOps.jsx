import { useState } from 'react';
import { ChefHat, TrendingUp, AlertCircle, Receipt, ArrowRight, Utensils } from 'lucide-react';

export default function ServeOps() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Erken erişim başvurunuz alındı! Sizinle iletişime geçeceğiz.');
  };

  return (
    <>
    {/* HERO SECTION */}
    <section className="hero">
        <div className="container">
            <div className="hero-grid">
                <div>
                    <h1>ServeOps: Kasanız ciro yazar, biz kârınızı hesaplarız.</h1>
                    <p style={{maxWidth:'700px'}}>POS sisteminiz satışları takip eder, peki maliyetleri? ServeOps, reçete bazlı stok takibi ve POS entegrasyonu ile restoranınızın "görünmeyen zararlarını" ortaya çıkarır.</p>
                    
                    <div className="card warning" style={{display:'inline-flex', alignItems:'center', gap:'0.8rem', marginTop:'1.5rem', padding:'0.8rem 1.2rem'}}>
                        <div className="spinner"></div>
                        <span style={{fontSize:'0.9rem', fontWeight:500}}>Geliştirme Aşamasında / Early Access</span>
                    </div>
                </div>
                {/* Hero Visual: POS vs Real Data Concept */}
                <div className="mock-table-container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px'}}>
                   <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'4rem', fontWeight:800, opacity:0.1, lineHeight:1}}>POS</div>
                        <div style={{fontSize:'1.5rem', marginBottom:'1rem'}}>Verisi + Reçete</div>
                        <ArrowRight size={32} style={{marginBottom:'1rem', opacity:0.5}} />
                        <div style={{background:'white', padding:'1rem 2rem', borderRadius:'var(--radius)', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
                            <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Latte (Tek Bardak)</div>
                            <div style={{display:'flex', gap:'1.5rem', marginTop:'0.5rem'}}>
                                <div>
                                    <span style={{display:'block', fontSize:'0.7rem', color:'var(--text-muted)'}}>Satış</span>
                                    <span style={{fontWeight:700, color:'var(--text-main)'}}>120 ₺</span>
                                </div>
                                <div style={{borderLeft:'1px solid var(--border)', paddingLeft:'1.5rem'}}>
                                    <span style={{display:'block', fontSize:'0.7rem', color:'var(--text-muted)'}}>Gerçek Maliyet</span>
                                    <span style={{fontWeight:700, color:'var(--status-critical)'}}>42 ₺</span>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    </section>

    {/* PROBLEM / SOLUTION */}
    <section className="section">
        <div className="container">
            <div className="section-header">
                <h2>Restoran İşletmeciliğindeki "Kör Nokta"</h2>
                <p>Ürün satılır, para kasaya girer. Ama arka tarafta ne kadar ziyan oldu, reçeteye uyuldu mu, hangisi gerçekten kârlı? ServeOps bu sorulara cevap verir.</p>
            </div>
            
            <div className="grid-2">
                <div>
                    <h3 style={{marginBottom:'1.5rem'}}>Gelecek Özellik Seti</h3>
                    <p style={{marginBottom:'1.5rem', fontSize:'0.95rem'}}>Şu an pilot kullanıcılarımızla birlikte geliştirdiğimiz modüller:</p>
                    
                    <div className="card card-border-l" style={{marginBottom:'1rem'}}>
                        <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
                            <Receipt size={24} style={{opacity:0.6}} />
                            <div>
                                <h4 style={{fontSize:'1rem', marginBottom:'0.3rem'}}>POS Entegrasyonu</h4>
                                <p style={{fontSize:'0.85rem', marginBottom:'0', color:'var(--text-muted)'}}>Satılan her ürün, anında stoktan reçetesiyle birlikte düşer. Manuel stok girmek yok.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card card-border-l" style={{marginBottom:'1rem'}}>
                        <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
                            <TrendingUp size={24} style={{opacity:0.6}} />
                            <div>
                                <h4 style={{fontSize:'1rem', marginBottom:'0.3rem'}}>Canlı Kârlılık Analizi</h4>
                                <p style={{fontSize:'0.85rem', marginBottom:'0', color:'var(--text-muted)'}}>Hangi ürün ciro yapıyor, hangisi gerçekten kâr bırakıyor? Menü mühendisliği için net veri.</p>
                            </div>
                        </div>
                    </div>

                    <div className="card card-border-l">
                        <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
                            <AlertCircle size={24} style={{opacity:0.6}} />
                            <div>
                                <h4 style={{fontSize:'1rem', marginBottom:'0.3rem'}}>Kayıp & Kaçak Takibi</h4>
                                <p style={{fontSize:'0.85rem', marginBottom:'0', color:'var(--text-muted)'}}>Teorik stok ile gerçek sayım arasındaki farkı (waste/zayi) TL cinsinden raporlayın.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EARLY ACCESS FORM */}
                <div className="card" style={{border:'2px solid var(--text-main)'}}>
                    <div style={{background:'var(--text-main)', color:'white', padding:'0.5rem 1rem', borderRadius:'4px', display:'inline-block', marginBottom:'1rem', fontSize:'0.8rem', fontWeight:600}}>
                        PİLOT PROGRAM
                    </div>
                    <h3>ServeOps'u İlk Kullanan Siz Olun</h3>
                    <p style={{fontSize:'0.9rem', marginBottom:'1.5rem'}}>Restoran veya kafeniz için pilot işletme olmak ister misiniz? Ürün çıktığında ömür boyu özel fiyattan yararlanın.</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{marginBottom:'1rem'}}>
                            <label style={{fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.5rem'}}>Ad Soyad</label>
                            <input type="text" className="input" placeholder="Örn: Ahmet Yılmaz" required />
                        </div>
                        
                        <div style={{marginBottom:'1rem'}}>
                            <label style={{fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.5rem'}}>İşletme Adı</label>
                            <input type="text" className="input" placeholder="Örn: Luna Coffee Co." required />
                        </div>

                        <div style={{marginBottom:'1rem'}}>
                            <label style={{fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.5rem'}}>Kullandığınız POS Sistemi</label>
                            <input type="text" className="input" placeholder="Örn: Omni, SambaPOS, Adisyon vb." required />
                        </div>
                        
                        <div style={{marginBottom:'1.5rem'}}>
                            <label style={{fontSize:'0.85rem', fontWeight:600, display:'block', marginBottom:'0.5rem'}}>En Büyük Operasyonel Sorununuz?</label>
                            <textarea className="input" style={{minHeight:'80px'}} placeholder="Örn: Stok tutmuyor, maliyetleri hesaplayamıyorum..."></textarea>
                        </div>
                        
                        <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Pilot Programına Başvur</button>
                    </form>
                    <p style={{fontSize:'0.75rem', marginTop:'1rem', opacity:0.7, textAlign:'center'}}>
                        ForgeOps Mühendisliği ile geliştirilmektedir.
                    </p>
                </div>
            </div>
        </div>
    </section>
    </>
  );
}