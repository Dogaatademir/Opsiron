import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Common Components
import Layout from './components/Layout';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Work = lazy(() => import('./pages/Work'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const KVKK = lazy(() => import('./pages/KVKK'));

import './App.css';

function App() {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-[#F7F7F5]">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#A1A1AA] animate-pulse">
            Yükleniyor...
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Ana Rotalar */}
            <Route index element={<Home />} />
            <Route path="work" element={<Work />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* Yasal Rotalar */}
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="kvkk" element={<KVKK />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;