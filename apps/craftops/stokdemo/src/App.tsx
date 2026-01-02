import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { InventoryProvider } from './context/InventoryContext';

// Sayfalar
import StockDashboard from './pages/StockDashboard';
import MaterialsPage from './pages/MaterialsPage';
import SemiFinishedPage from './pages/SemiFinishedPage';
import ProductionPage from './pages/ProductionPage';
import FinishedGoodsPage from './pages/FinishedGoodsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <InventoryProvider>
      {/* ÖNEMLİ: Router'a base yolunu tanıtıyoruz */}
      <BrowserRouter basename="/craftops/stokdemo">
        <Routes>
           <Route element={<Layout />}>
              <Route path="/" element={<StockDashboard />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/semi-finished" element={<SemiFinishedPage />} />
              <Route path="/production" element={<ProductionPage />} />
              <Route path="/finished-goods" element={<FinishedGoodsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
           </Route>
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}