import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export interface PosProduct {
  id: number;
  code: string;
  name: string;
  stock?: number;
  [key: string]: any;
}

interface PosItemSelectProps {
  products: PosProduct[];
  value: number;
  onChange: (productId: number) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export const PosItemSelect: React.FC<PosItemSelectProps> = ({
  products,
  value,
  onChange,
  autoFocus = false,
  placeholder = 'Scan barcode or type to search...',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected product to display its name when not focused
  const selectedProduct = products.find((p) => p.id === value);

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return products.slice(0, 50); // Show top 50 by default
    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(lowerSearch) ||
        p.name.toLowerCase().includes(lowerSearch)
    ).slice(0, 50);
  }, [searchTerm, products]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== 'Tab') {
      setIsOpen(true);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's an exact barcode match, select it instantly (even if selectedIndex is wrong)
      const exactMatch = products.find(p => p.code.toLowerCase() === searchTerm.toLowerCase());
      
      if (exactMatch) {
        handleSelect(exactMatch.id);
      } else if (filteredProducts.length > 0) {
        handleSelect(filteredProducts[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelect = (productId: number) => {
    onChange(productId);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-2 py-1.5 pl-8 border border-[#CBD5E1] rounded text-[13px] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] bg-white transition-all font-bold text-[#0F172A]"
          placeholder={selectedProduct ? `${selectedProduct.code} - ${selectedProduct.name}` : placeholder}
          value={isOpen ? searchTerm : selectedProduct ? `${selectedProduct.code} - ${selectedProduct.name}` : ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (value !== 0) {
              setSearchTerm(''); // Clear to allow searching new
            }
          }}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        
        {selectedProduct && !isOpen && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onChange(0);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[450px] mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          <div className="flex bg-[#F8FAFC] border-b border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            <div className="w-[100px]">Code</div>
            <div className="flex-1">Product Name</div>
            <div className="w-[60px] text-right">Stock</div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-gray-500 text-center">No products found.</div>
            ) : (
              filteredProducts.map((p, index) => (
                <div
                  key={p.id}
                  className={`flex items-center px-3 py-2 cursor-pointer border-b border-gray-50 last:border-0 transition-colors text-[13px] ${
                    index === selectedIndex ? 'bg-[#EFF6FF] border-l-4 border-l-[#3B82F6]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                  onClick={() => handleSelect(p.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="w-[100px] font-bold text-[#3B82F6] truncate pr-2">{p.code}</div>
                  <div className="flex-1 font-bold text-gray-800 truncate pr-2">{p.name}</div>
                  <div className={`w-[60px] text-right font-bold ${Number(p.stock) <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {p.stock || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PosItemSelect;
