import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function SearchableSelect({ options, value, onChange, placeholder }: {
  options: { label: string, value: any }[],
  value: any,
  onChange: (val: any) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} className="relative w-full text-[13px]">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded bg-white flex justify-between items-center cursor-pointer focus-within:border-[#3B82F6]"
      >
        <span className={selectedOption ? "text-[#1F2937]" : "text-gray-400 truncate"}>
          {selectedOption ? selectedOption.label : (placeholder || "Select...")}
        </span>
        <ChevronDown size={14} className="text-gray-500 shrink-0" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D1D5DB] rounded shadow-lg">
          <div className="p-2 border-b border-[#E5E7EB]">
            <div className="flex items-center px-2 py-1 border border-[#D1D5DB] rounded bg-[#F9FAFB]">
              <Search size={12} className="text-gray-400 mr-2 shrink-0" />
              <input 
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent outline-none text-[12px]"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-center">No results found</div>
            ) : (
              filteredOptions.map(option => (
                <div 
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-[#EFF6FF] transition-colors ${String(value) === String(option.value) ? 'bg-[#EFF6FF] text-[#3B82F6] font-bold' : 'text-[#374151]'}`}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
