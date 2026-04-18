import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants/content';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFFFF] pt-24 pb-12 border-t border-[#E4E4E7] relative z-20 font-sans selection:bg-[#0F0F10] selection:text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">

        {/* ÜST KISIM */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">

          {/* 1. Kolon: Marka */}
          <div className="md:col-span-5 flex flex-col gap-8">
            <Link
              to="/"
              className="text-2xl tracking-[0.2em] uppercase font-normal text-[#0F0F10] hover:text-[#6B6B73] transition-colors"
              aria-label="Ana Sayfaya Dön"
            >
              OPSIRON
            </Link>
            <p className="text-[14px] font-light leading-relaxed text-[#6B6B73] max-w-sm">
              Markalara özel dijital deneyimler tasarlayan butik web design stüdyosu. Estetik ve fonksiyonun kusursuz dengesi.
            </p>
          </div>

          {/* 2. Kolon: Stüdyo */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA]">Stüdyo</h4>
            <nav aria-label="Stüdyo Linkleri">
              <ul className="flex flex-col gap-4">
                <li>
                  <Link to="/about" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link to="/work" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    Seçkin İşler
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    Uzmanlıklar
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    İletişim
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* 3. Kolon: Sosyal */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA]">Sosyal</h4>
            <nav aria-label="Sosyal Medya Linkleri">
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="https://instagram.com/opsiron" target="_blank" rel="noopener noreferrer" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/opsiron" target="_blank" rel="noopener noreferrer" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://behance.net/opsiron" target="_blank" rel="noopener noreferrer" className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300">
                    Behance
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* 4. Kolon: İletişim */}
          <div className="md:col-span-3 flex flex-col gap-8">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#A1A1AA]">Bize Ulaşın</h4>
            <address className="not-italic flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-[13px] font-light text-[#0F0F10] hover:text-[#6B6B73] transition-colors duration-300 inline-block"
              >
                {CONTACT_INFO.email}
              </a>
              <span className="text-[13px] font-light text-[#6B6B73] leading-relaxed block mt-1">
                {CONTACT_INFO.address.city}, <br /> {CONTACT_INFO.address.country}
              </span>
            </address>
          </div>
        </div>

        {/* ALT KISIM */}
        <div className="pt-8 border-t border-[#E4E4E7] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-[0.15em] font-light order-2 md:order-1">
            &copy; {currentYear} OPSIRON. TÜM HAKLARI SAKLIDIR.
          </div>

          <div className="flex items-center order-1 md:order-2">
            <nav aria-label="Yasal Linkler">
              <ul className="flex gap-8">
                <li>
                  <Link to="/privacy" className="text-[10px] uppercase tracking-[0.15em] text-[#A1A1AA] hover:text-[#0F0F10] font-light transition-colors duration-300">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-[10px] uppercase tracking-[0.15em] text-[#A1A1AA] hover:text-[#0F0F10] font-light transition-colors duration-300">
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link to="/kvkk" className="text-[10px] uppercase tracking-[0.15em] text-[#A1A1AA] hover:text-[#0F0F10] font-light transition-colors duration-300">
                    KVKK
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

      </div>
    </footer>
  );
}