import { Link } from 'react-router-dom';
import { Box, ClipboardList, FileText, QrCode, PieChart, Users, X, Wallet, ArrowRightLeft, ShieldCheck, Check } from 'lucide-react';

export default function CraftOps() {
  return (
    <>
    {/* HERO SECTION */}
    <section className="hero">
        <div className="container">
            <div className="hero-grid">
                <div>
       
                    <h1>CraftOps: İşletmenize Göre Şekillenen Yönetim Sistemi</h1>
                    <p>Sadece stok saymak yetmez. CraftOps; üretimi, stoğu ve finansı "Tek Doğruluk Kaynağı"nda birleştirir. Görünmeyen zararları tespit eder, işletmenizi veriye dayalı yönetmenizi sağlar.</p>
                    <div style={{display:'flex', gap:'1rem', marginTop:'2rem'}}>
                        <span className="pill">Stok Hakimiyeti</span>
                        <span className="pill">Finansal Netlik</span>
                    </div>
                </div>
                {/* Mock Table - Stok ve Finansın bir arada olduğunu hissettiren görsel revizyonu */}
                <div className="mock-table-container">
                    <div style={{padding:'1.5rem'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                            <span className="u-label">Canlı Operasyon Özeti</span>
                            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Anlık Veri</span>
                        </div>
                        
                        {/* Stok Satırı */}
                        <div style={{marginBottom:'1.2rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'0.4rem'}}>
                                <span><strong>Stok:</strong> Çelik Levha</span>
                                <span>%85 Dolu</span>
                            </div>
                            <div className="stock-bar"><div className="stock-fill" style={{width:'85%'}}></div></div>
                        </div>

                        {/* Finans Satırı (YENİ) */}
                        <div style={{marginBottom:'1.2rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'0.4rem'}}>
                                <span><strong>Finans:</strong> Tahsilat Bekleyen</span>
                                <span style={{color:'var(--text-main)', fontWeight:600}}>145.000 ₺</span>
                            </div>
                            <div className="stock-bar" style={{background:'rgba(0,0,0,0.05)'}}><div className="stock-fill" style={{width:'60%', background:'var(--text-main)'}}></div></div>
                        </div>

                        {/* Kritik Uyarı Satırı */}
                        <div>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'0.4rem'}}>
                                <span><strong>Uyarı:</strong> Plastik Granül</span>
                                <span style={{color:'var(--status-critical)'}}>Kritik Seviye</span>
                            </div>
                            <div className="stock-bar"><div className="stock-fill critical" style={{width:'12%'}}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* CORE VALUE PROPOSITION */}
    <section className="section" style={{background: 'var(--bg-secondary)'}}>
        <div className="container">
             <div className="section-header">
                <h2>Gerçek İhtiyacınıza Göre Kurulum</h2>
                <p>CraftOps bir "paket program" dayatması değildir. İşletmenizin ölçeğine ve ihtiyacına göre aşağıdaki üç modelden biriyle yapılandırılır.</p>
            </div>

            <div className="grid-3">
                {/* Modül 1: Sadece Stok */}
                <div className="card" style={{borderTop:'4px solid var(--text-muted)'}}>
                    <h3>1. Üretim & Stok Odaklı</h3>
                    <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1rem'}}>Finansı başka yerde tutan, sadece sahadaki üretime ve depoya hakim olmak isteyenler için.</p>
                    <ul style={{fontSize:'0.9rem'}}>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Reçete (BOM) & Maliyetleme</li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Depo Giriş/Çıkış & Sayım</li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Üretim Emirleri</li>
                    </ul>
                </div>

                {/* Modül 2: Sadece Finans */}
                <div className="card" style={{borderTop:'4px solid var(--text-muted)'}}>
                    <h3>2. Ticari & Finans Odaklı</h3>
                    <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1rem'}}>Üretimi basit tutan ama alacak/verecek, fatura ve nakit akışını yönetmek isteyenler için.</p>
                    <ul style={{fontSize:'0.9rem'}}>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Cari Hesap Yönetimi</li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Satınalma & Satış Siparişleri</li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Gelir/Gider Takibi</li>
                    </ul>
                </div>

                {/* Modül 3: Tam Entegrasyon */}
                <div className="card" style={{borderTop:'4px solid var(--text-main)', background:'white', transform:'scale(1.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.08)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h3>3. Tam Entegrasyon</h3>
                        <span className="pill" style={{fontSize:'0.7rem'}}>Önerilen</span>
                    </div>
                    <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1rem'}}>Stok hareketinin finansal karşılığını anlık gören, sürdürülebilir işletme yapısı.</p>
                    <ul style={{fontSize:'0.9rem'}}>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> <strong>Tek Doğruluk Kaynağı (SSOT)</strong></li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Otomatik Stoktan Düşen Maliyet</li>
                         <li style={{marginBottom:'0.5rem', display:'flex', gap:'0.5rem'}}><Check size={16} /> Gerçek Kârlılık Analizi</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    {/* DETAILED FEATURES GRID */}
    <section className="section">
        <div className="container">
            <div className="section-header">
                <h2>Altyapı Yetenekleri</h2>
                <p>İhtiyaç duyduğunuzda devreye alınabilecek güçlü modüller.</p>
            </div>
            <div className="grid-3">
                <div className="card">
                    <Box className="feature-icon" />
                    <h3>Akıllı Stok Yönetimi</h3>
                    <p>Kritik stok uyarıları, raf takibi ve mobil barkodlu sayım imkanı.</p>
                </div>
                <div className="card">
                    <Wallet className="feature-icon" />
                    <h3>Finansal Hareketler</h3>
                    <p>Tedarikçi ödemeleri, müşteri tahsilatları ve vadesi gelen borç takibi.</p>
                </div>
                <div className="card">
                    <FileText className="feature-icon" />
                    <h3>Dinamik Reçeteler</h3>
                    <p>Ürün reçetelerini tanımlayın, hammadde fiyatı değişince maliyetiniz otomatik güncellensin.</p>
                </div>
                <div className="card">
                    <ArrowRightLeft className="feature-icon" />
                    <h3>Satınalma & Satış</h3>
                    <p>Tekliften siparişe, siparişten faturaya dönüşen entegre süreç yönetimi.</p>
                </div>
                <div className="card">
                    <PieChart className="feature-icon" />
                    <h3>Görünmeyen Kayıp Analizi</h3>
                    <p>Sistemdeki teorik stok ile sayım arasındaki farkı (fire/kayıp) finansal değeriyle raporlayın.</p>
                </div>
                <div className="card">
                    <Users className="feature-icon" />
                    <h3>Rol Bazlı Yetkilendirme</h3>
                    <p>Satın almacı fiyatları görsün, depo personeli sadece miktarları. Kim neyi görmeli siz karar verin.</p>
                </div>
            </div>
        </div>
    </section>

    {/* COMPARISON / PROBLEM-SOLUTION */}
    <section className="section" style={{background: 'white'}}>
        <div className="container">
            <div className="grid-2">
                <div>
                    <h3>Mevcut Durumun Riskleri</h3>
                    <ul style={{marginTop:'1.5rem', color:'var(--text-muted)'}}>
                        <li style={{marginBottom:'1rem', display:'flex', gap:'0.8rem', alignItems:'center'}}>
                            <X style={{color:'var(--status-critical)', flexShrink:0}} size={20} /> 
                            <span>Excel'de unutulan siparişler ve hatalı formüller.</span>
                        </li>
                        <li style={{marginBottom:'1rem', display:'flex', gap:'0.8rem', alignItems:'center'}}>
                            <X style={{color:'var(--status-critical)', flexShrink:0}} size={20} /> 
                            <span>Stokta var sanılan ama rafta olmayan ürünler.</span>
                        </li>
                        <li style={{marginBottom:'1rem', display:'flex', gap:'0.8rem', alignItems:'center'}}>
                            <X style={{color:'var(--status-critical)', flexShrink:0}} size={20} /> 
                            <span>Tahmini maliyetle fiyat verip zarar etmek.</span>
                        </li>
                        <li style={{marginBottom:'1rem', display:'flex', gap:'0.8rem', alignItems:'center'}}>
                            <X style={{color:'var(--status-critical)', flexShrink:0}} size={20} /> 
                            <span>Satış yaparken kâr mı zarar mı ettiğini ay sonunda öğrenmek.</span>
                        </li>
                    </ul>
                </div>
                <div style={{background:'var(--bg-secondary)', padding:'2rem', borderRadius:'var(--radius)'}}>
                    <h3>CraftOps Çözümü</h3>
                    <p style={{marginBottom:'1.5rem'}}>
                        Dağınık veriyi "Tek Doğruluk Kaynağı"na dönüştürürüz.
                    </p>
                    
                    <div style={{marginBottom:'2rem'}}>
                        <h4 style={{fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                            <ShieldCheck size={18} /> Güvenli Geçiş Süreci
                        </h4>
                        <p style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:0}}>
                            Size bir login ekranı verip "başınızın çaresine bakın" demiyoruz. Süreçlerinizi analiz ediyor, verilerinizi içeri aktarıyor ve ekibinizi eğitiyoruz.
                        </p>
                    </div>

                    <Link to="/contact" className="btn btn-primary" style={{width:'100%', textAlign:'center'}}>
                        Sizin İçin Analiz Yapalım
                    </Link>
                </div>
            </div>
        </div>
    </section>
    </>
  );
}