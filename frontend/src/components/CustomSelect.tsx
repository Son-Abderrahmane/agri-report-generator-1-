import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[] | string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formattedOptions: Option[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-xs font-bold text-[#344E41] bg-[#F9F8F5] border border-[#EBE9E1] rounded-lg px-3 py-2 cursor-pointer shadow-sm hover:border-[#A3B18A] hover:bg-[#F0F2E9] focus:ring-2 focus:ring-[#E9EDC9] focus:outline-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed hover:border-[#EBE9E1] hover:bg-[#F9F8F5]' : ''
        }`}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-400 font-normal' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white border border-[#EBE9E1] rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            {formattedOptions.length === 0 ? (
              <div className="p-3 text-xs text-center text-gray-400 italic">Aucune option</div>
            ) : (
              <ul className="py-1">
                {/* Adding placeholder as an option to clear selection if needed */}
                <li
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600 text-gray-400 italic ${
                    value === '' ? 'bg-gray-50' : ''
                  }`}
                >
                  Désélectionner
                </li>
                {formattedOptions.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      value === opt.value
                        ? 'bg-[#E9EDC9]/30 text-[#344E41] font-bold'
                        : 'text-gray-600 hover:bg-[#F9F8F5] hover:text-[#344E41]'
                    }`}
                  >
                    <span className="truncate pr-2" title={opt.label}>{opt.label}</span>
                    {value === opt.value && <Check className="w-3.5 h-3.5 text-[#5A6352] flex-shrink-0" />}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
