import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  icon?: React.ElementType;
}

export function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Seçiniz",
  icon: Icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const searchString = useRef("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menü her açıldığında seçili öğeye odaklan ve scroll yap
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((o) => o.value === value);
      const indexToFocus = currentIndex !== -1 ? currentIndex : 0;
      setFocusedIndex(indexToFocus);
      
      setTimeout(() => {
        if (optionsRef.current[indexToFocus]) {
          optionsRef.current[indexToFocus]?.scrollIntoView({ block: "nearest" });
        }
      }, 10); // DOM'un render olması için minimal gecikme
    } else {
      searchString.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Sadece açılıp kapanmaya duyarlı yapıldı

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Sadece harf, rakam vb. karakter tuşlarına basıldığında (Ctrl vb. hariç)
    const isChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (isChar) {
      e.preventDefault();
      searchString.current += e.key.toLocaleLowerCase("tr-TR");

      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        searchString.current = "";
      }, 500);

      const searchLower = searchString.current;

      // 1. Önce ismin en başından eşleşen var mı bak (Örn: "Kemal")
      let matchIndex = options.findIndex((opt) => 
        opt.label.trim().toLocaleLowerCase("tr-TR").startsWith(searchLower)
      );

      // 2. Yoksa ismin içindeki kelimelerin başından eşleşen var mı bak (Örn: "Ali Kemal")
      if (matchIndex === -1) {
        matchIndex = options.findIndex((opt) => 
          opt.label.toLocaleLowerCase("tr-TR").includes(` ${searchLower}`)
        );
      }

      if (matchIndex !== -1) {
        if (isOpen) {
          // Menü açıksa sadece üzerine git
          setFocusedIndex(matchIndex);
          scrollToIndex(matchIndex);
        } else {
          // Menü kapalıysa Native HTML Select gibi doğrudan değeri değiştir
          onChange(options[matchIndex].value);
        }
      }
      return;
    }

    // Yön tuşları ve Enter / Boşluk kontrolleri
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const nextIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : focusedIndex;
      setFocusedIndex(nextIndex);
      scrollToIndex(nextIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) return;
      const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : 0;
      setFocusedIndex(prevIndex);
      scrollToIndex(prevIndex);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen) {
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        }
      } else {
        setIsOpen(true);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < options.length && optionsRef.current[index]) {
      optionsRef.current[index]?.scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <div 
     className="relative outline-none focus:outline-none"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {label && (
        <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 px-4 bg-white border text-left flex items-center justify-between transition-colors outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 ${
          isOpen ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-300"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={18} className="text-neutral-400" />}
          <span className={`font-light truncate ${!value ? "text-neutral-300" : "text-neutral-900"}`}>
             {selectedLabel || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          <ul className="py-1">
            {options.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  ref={(el) => { optionsRef.current[index] = el; }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between group transition-colors ${
                    focusedIndex === index ? "bg-neutral-100 font-medium text-neutral-900" : "hover:bg-neutral-50 text-neutral-600"
                  }`}
                >
                  <span className="font-light truncate pr-2">
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check size={14} className="text-neutral-900 flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}