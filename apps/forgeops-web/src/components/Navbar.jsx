import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
// 1. Logoyu import ediyoruz (Yolun doğru olduğundan emin olun)
import logoImg from '../assets/ForgeOps.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          {/* 2. Eski 'logo-box' div'i yerine img etiketi kullanıyoruz */}
          <img src={logoImg} alt="ForgeOps Logo" className="logo-img" />
          ForgeOps
        </Link>
        
        {/* ... kodun geri kalanı aynı ... */}
        
        <div className="nav-links">
       
          <Link to="/" className={isActive('/')}>Ana Sayfa</Link>
          <Link to="/about" className={isActive('/about')}>Hakkımızda</Link>
          <Link to="/craftops" className={isActive('/craftops')}>CraftOps</Link>
          <Link to="/serveops" className={isActive('/serveops')}> ServeOps</Link>
          <Link to="/pricing" className={isActive('/pricing')}> Fiyatlandırma</Link>
          <Link to="/contact" className={isActive('/contact')}>İletişim</Link>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          <Menu />
        </button>
      </div>
      
      {/* Mobile Menu (Aynı kalacak) */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
         <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Ana Sayfa</Link>
           <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>Hakkımızda</Link>
         <Link to="/craftops" className="nav-link" onClick={() => setIsOpen(false)}>CraftOps</Link>
         <Link to="/serveops" className="nav-link" onClick={() => setIsOpen(false)}>ServeOps</Link>
         <Link to="/pricing" className="nav-link" onClick={() => setIsOpen(false)}>Fiyatlandırma</Link>
         <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>İletişim</Link>
      </div>
    </nav>
  );
}