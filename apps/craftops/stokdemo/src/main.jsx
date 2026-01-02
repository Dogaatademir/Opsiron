import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 1. Resmi JavaScript dosyası gibi içeri alıyoruz (Import)
// Bu sayede Vite, dosyanın gerçek yolunu otomatik hesaplar.
import faviconUrl from './assets/StokIcon.png'

// 2. İkonu sayfaya ekleyen fonksiyon
const setFavicon = (url) => {
  // Mevcut ikon varsa bul, yoksa oluştur
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  // Yolu ata
  link.href = url;
};

// 3. Fonksiyonu çalıştır
setFavicon(faviconUrl);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)