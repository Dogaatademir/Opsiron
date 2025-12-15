import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GreenCoffeePage } from './pages/GreenCoffeePage';
import { RoastingPage } from './pages/RoastingPage';
import { PackagingPage } from './pages/PackagingPage';
import { ProductionPage } from './pages/ProductionPage';
import { OverviewPage } from './pages/OverviewPage';
import { FinishedProductPage } from './pages/FinishedProductPage';
import { OrdersPage } from './pages/OrdersPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SettingsPage } from './pages/Settings';
import { StoreProvider } from './context/StoreContext';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename="/craftops/editioncoffeeroastery">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OverviewPage />} />
            
            <Route path="purchases" element={<PurchasesPage />} /> 
            <Route path="green-coffee" element={<GreenCoffeePage />} />
            <Route path="packaging-materials" element={<PackagingPage />} />
            <Route path="finished-products" element={<FinishedProductPage />} />
            
            <Route path="roasting" element={<RoastingPage />} />
            <Route path="production" element={<ProductionPage />} />
            
            <Route path="orders" element={<OrdersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;