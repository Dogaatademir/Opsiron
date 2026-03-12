import { useState, useEffect, useRef } from 'react'; // useEffect ve useRef eklendi
import { NavLink, Outlet, useLocation } from 'react-router-dom'; // useLocation eklendi
import { 
  LayoutDashboard, 
  Users, 
  ArrowRightLeft, 
  Menu, 
  X, 
  Settings,
  PieChart,
  Scale 
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: SidebarItemProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-4 transition-all duration-200 group ${
        isActive
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      }`
    }
  >
    <Icon size={20} className="shrink-0" strokeWidth={1.5} />
    <span className="font-light text-sm tracking-wide uppercase">{label}</span>
  </NavLink>
);

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. URL değişimini takip etmek için location'ı alıyoruz
  const location = useLocation();
  
  // 2. Kaydırma işlemini yapan 'main' elementine erişmek için bir referans oluşturuyoruz
  const mainContentRef = useRef<HTMLDivElement>(null);

  // 3. URL her değiştiğinde (location.pathname), main kutusunu en üste kaydırıyoruz
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth' // İsterseniz 'auto' yaparak animasyonsuz anında geçiş yapabilirsiniz
      });
    }
  }, [location.pathname]);

  return (
    <div className="fixed inset-0 flex bg-neutral-50 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed md:relative z-50 h-full w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-8 border-b border-neutral-200 flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                Aycan<br/>İnşaat
            </h1>
      
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-neutral-400 hover:bg-neutral-100">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="GENEL BAKIŞ" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/borc-alacak" icon={Scale} label="BORÇ & ALACAK" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/hesaplar" icon={PieChart} label="HESAPLAR" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/kisiler" icon={Users} label="KİŞİLER" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/islemler" icon={ArrowRightLeft} label="İŞLEMLER" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-neutral-200 shrink-0">
           <SidebarItem to="/settings" icon={Settings} label="AYARLAR" onClick={() => setIsSidebarOpen(false)} />
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-start justify-between shrink-0 z-30 relative">
          <div className="flex items-start gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 transition-colors mt-1">
               <Menu size={24} strokeWidth={1.5} />
             </button>
             <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                Aycan<br/>İnşaat
            </h1>
           
             </div>
          </div>
        </header>

        {/* 4. Ref'i buraya bağlıyoruz */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative scroll-smooth"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}