import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Bean, Coffee, Package, ClipboardList, Settings, Menu, X, Box, Truck, ShoppingBag } from 'lucide-react'; // ShoppingBag eklendi

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

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="p-8 border-b border-neutral-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none">
                edi-<br/>TION
            </h1>
            <p className="text-xs text-neutral-400 mt-2 font-light tracking-wider">COFFEE ROASTERY</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden p-1 text-neutral-400 hover:bg-neutral-100"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {/* ANA MENÜ */}
          <SidebarItem to="/" icon={LayoutDashboard} label="GENEL BAKIŞ" onClick={closeSidebar} />
          
          {/* KATEGORİ 1: GİRDİLER (STOK) */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Envanter Yönetimi</p>
          </div>
          {/* YENİ EKLENEN KISIM: Envanterin başına eklendi çünkü stok burayla başlar */}
          <SidebarItem to="/purchases" icon={ShoppingBag} label="Satın Alımlar" onClick={closeSidebar} />
          
          <SidebarItem to="/green-coffee" icon={Bean} label="Yeşil Çekirdek" onClick={closeSidebar} />
          <SidebarItem to="/packaging-materials" icon={Package} label="Ambalaj & Malzeme" onClick={closeSidebar} />
          <SidebarItem to="/finished-products" icon={Box} label="Hazır Ürünler" onClick={closeSidebar} />
        
          {/* KATEGORİ 2: SÜREÇLER (İŞLEME) */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Operasyon</p>
          </div>
          <SidebarItem to="/roasting" icon={Coffee} label="Kavurma" onClick={closeSidebar} />
          <SidebarItem to="/production" icon={ClipboardList} label="Üretim & Paketleme" onClick={closeSidebar} />
          
          {/* KATEGORİ 3: ÇIKTILAR (SATIŞ) */}
          <div className="pt-6 pb-3">
            <p className="px-4 text-[10px] font-medium text-neutral-400 uppercase tracking-[0.15em]">Lojistik & Satış</p>
          </div>
            <SidebarItem to="/orders" icon={Truck} label="Sipariş & Sevkiyat" onClick={closeSidebar} />
            
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <SidebarItem to="/settings" icon={Settings} label="Ayarlar" onClick={closeSidebar} />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 transition-colors"
             >
               <Menu size={24} strokeWidth={1.5} />
             </button>
             <span className="font-bold text-neutral-900 tracking-wide text-lg leading-none">
               edi-<br/>TION
             </span>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};