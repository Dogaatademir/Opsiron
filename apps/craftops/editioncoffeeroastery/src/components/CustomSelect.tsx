import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: any;
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: any;
  disabled?: boolean;
}

export const CustomSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  icon: Icon,
  disabled = false
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Label */}
      <label className="block text-xs font-medium text-neutral-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
        {Icon && <Icon size={14} className="text-neutral-400" strokeWidth={1.5} />}
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-4 border text-left transition-all duration-200
          ${disabled ? 'bg-neutral-100 cursor-not-allowed border-neutral-200 text-neutral-400' : 'bg-white hover:border-neutral-400 cursor-pointer'}
          ${isOpen ? 'border-neutral-900' : 'border-neutral-300'}
        `}
      >
        <div className="flex flex-col">
          {selectedOption ? (
            <>
              <span className="font-light text-neutral-900 text-sm tracking-wide">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-xs text-neutral-500 font-light mt-0.5">{selectedOption.subLabel}</span>
              )}
            </>
          ) : (
            <span className="text-neutral-400 text-sm font-light">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={18} 
          strokeWidth={1.5}
          className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 shadow-lg max-h-60 overflow-y-auto">
          <div className="p-1">
            {options.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 font-light">No options</div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    flex items-center justify-between px-4 py-3 cursor-pointer transition-colors group
                    ${option.value === value ? 'bg-neutral-50' : 'hover:bg-neutral-50'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-light tracking-wide ${option.value === value ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                      {option.label}
                    </span>
                    {option.subLabel && (
                      <span className="text-xs text-neutral-400 font-light mt-0.5 group-hover:text-neutral-500">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {option.value === value && <Check size={16} strokeWidth={1.5} className="text-neutral-900" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};