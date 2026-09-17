import React from 'react';
import Select from 'react-select';

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number | null | undefined;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select / Search...',
  className = '',
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  isLoading = false,
}) => {
  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(opt: any) => {
        if (!opt) {
          onChange('');
        } else {
          onChange(opt.value);
        }
      }}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isLoading={isLoading}
      className={`text-[13px] ${className}`}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      menuPosition="fixed"
      styles={{
        control: (base: any, state: any) => ({
          ...base,
          minHeight: '38px',
          borderColor: state.isFocused ? '#3B82F6' : '#CBD5E1',
          boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
          '&:hover': {
            borderColor: '#94A3B8',
          },
          borderRadius: '0.375rem',
          backgroundColor: '#FFFFFF',
        }),
        singleValue: (base: any) => ({
          ...base,
          color: '#0F172A',
          fontWeight: '600',
          fontSize: '13px',
        }),
        input: (base: any) => ({
          ...base,
          color: '#0F172A',
          fontSize: '13px',
        }),
        placeholder: (base: any) => ({
          ...base,
          color: '#94A3B8',
          fontSize: '13px',
        }),
        option: (base: any, state: any) => ({
          ...base,
          fontSize: '13px',
          fontWeight: state.isSelected ? '700' : '500',
          color: state.isSelected ? '#FFFFFF' : '#0F172A',
          backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#F1F5F9' : '#FFFFFF',
          cursor: 'pointer',
        }),
        menu: (base: any) => ({
          ...base,
          zIndex: 9999,
          borderRadius: '0.375rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};

export default SearchableSelect;
