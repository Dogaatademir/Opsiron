import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import CraftOps from './pages/CraftOps';
import ServeOps from './pages/ServeOps';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
         <Route path="craftops" element={<CraftOps />} />
        <Route path="serveops" element={<ServeOps />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>
    </Routes>
  );
}

export default App;