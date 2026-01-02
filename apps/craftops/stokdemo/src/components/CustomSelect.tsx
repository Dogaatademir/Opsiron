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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Dışarı tıklandığında kapanması için
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

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-neutral-500 mb-3 tracking-wider">
          {label}
        </label>
      )}
      
      {/* BUTON: h-14 eklendi, border ve renkler input ile eşitlendi */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 px-4 bg-white border text-left flex items-center justify-between transition-colors outline-none focus:border-neutral-900 ${
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

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 shadow-xl max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-neutral-50 flex items-center justify-between group"
                >
                  <span
                    className={`font-light ${
                      value === option.value ? "text-neutral-900 font-normal" : "text-neutral-600"
                    }`}
                  >
                    {option.label}
                  </span>
                  {value === option.value && (
                    <Check size={14} className="text-neutral-900" />
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