import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>ForgeOps</h4>
            <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
              Üretim ve servis işletmelerinin görünmeyen ama en güçlü operasyonel altyapısı.
            </p>
          </div>
          <div className="footer-col">
            <h4>Ürünler</h4>
            <ul>
              <li><Link to="/craftops">CraftOps (Üretim)</Link></li>
              <li><Link to="/serveops">ServeOps (Hizmet)</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kurumsal</h4>
            <ul>
              <li><Link to="/about">Hakkımızda & Vizyon</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Bize Ulaşın</h4>
            <ul>
              <li><a href="mailto:hello@forgeops.com">hello@forgeops.com</a></li>
              <li>Ankara, Türkiye</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-light)' }}>
          &copy; 2025 ForgeOps Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}