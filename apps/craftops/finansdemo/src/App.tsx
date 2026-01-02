import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { FinanceProvider } from './context/FinanceContext';
import FinanceDashboard from './pages/FinanceDashboard';
import TransactionsPage from './pages/TransactionsPage';
import EntitiesPage from './pages/EntitiesPage';
import EntityDetailPage from './pages/EntityDetailPage'; // Yeni
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProductionPage from './pages/ProductionPage';
function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<FinanceDashboard />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="entities" element={<EntitiesPage />} />
            <Route path="entities/:id" element={<EntityDetailPage />} /> {/* Yeni Rota */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="production" element={<ProductionPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
}

export default App;