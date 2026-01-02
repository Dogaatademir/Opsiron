import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet,      // Gelir/Gider için
  Users,       // Cari Hesaplar için
  PieChart,    // Raporlar için
  Settings, 
  Menu, 
  X,
  CreditCard,   // Alternatif ikon
  Package       // YENİ: Üretim sayfası için ikon
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
  const [showHint, setShowHint] = useState(true);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-neutral-50 font-sans overflow-hidden">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-20 md:hidden transition-opacity"
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed md:relative z-30 h-full w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* --- SIDEBAR HEADER --- */}
        <div className="p-8 border-b border-neutral-200 flex justify-between items-start">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                DEMO
            </h1>
            <p className="text-xs text-neutral-400 mt-2 font-light tracking-wider">FİNANS MODÜLÜ</p>
            
            <div className="mt-4 pt-3 border-t border-neutral-100 w-full">
               <p className="text-[9px] text-neutral-400 font-medium tracking-wide">
                 Powered by <span className="text-neutral-600 font-bold">CraftOps</span>
               </p>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1 text-neutral-400 hover:bg-neutral-100"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* --- NAVIGATION --- */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          
          <SidebarItem to="/" icon={LayoutDashboard} label="GENEL BAKIŞ" onClick={closeSidebar} />
          
          {/* FİNANS YÖNETİMİ */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Finans Yönetimi</p>
          </div>
          <SidebarItem to="/transactions" icon={Wallet} label="Gelir & Gider" onClick={closeSidebar} />
          <SidebarItem to="/entities" icon={Users} label="Cari Hesaplar" onClick={closeSidebar} />
          
          {/* YENİ EKLENEN MENÜ ÖĞESİ */}
          <SidebarItem to="/production" icon={Package} label="Üretim / Maliyet" onClick={closeSidebar} />
        
          {/* RAPORLAMA (Opsiyonel) */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Analiz</p>
          </div>
          <SidebarItem to="/reports" icon={PieChart} label="Raporlar" onClick={closeSidebar} />
          
        </nav>

        {/* --- BOTTOM: SETTINGS & HINT --- */}
        <div className="p-4 border-t border-neutral-200 relative">
          
          {showHint && (
            <div className="absolute bottom-full left-4 right-4 mb-3 z-50 animate-bounce-slight">
               <div className="bg-blue-600 text-white p-4 rounded-lg shadow-xl relative">
                  <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-blue-600 rotate-45"></div>
                  <button 
                    onClick={(e) => { e.preventDefault(); setShowHint(false); }}
                    className="absolute top-2 right-2 text-blue-200 hover:text-white transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  <div className="pr-4">
                    <p className="text-xs font-medium leading-relaxed">
                      Ayarlar sayfasından verileri sıfırlayıp kendi verileriniz ile deneyebilirsiniz.  </p>
                  </div>
               </div>
            </div>
          )}

          <SidebarItem to="/settings" icon={Settings} label="Ayarlar" onClick={closeSidebar} />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-start justify-between shrink-0 z-10">
          <div className="flex items-start gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 transition-colors mt-1"
             >
               <Menu size={24} strokeWidth={1.5} />
             </button>
             
             <div className="flex flex-col">
                <span className="font-bold text-neutral-900 tracking-wide text-lg leading-none">
                 DEMO
                </span>
                <span className="text-[10px] text-neutral-400 font-light tracking-wider mt-1">
                  FİNANS MODÜLÜ
                </span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}