import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useStore } from '../store';
import type { Supplier } from '../types';

interface SupplierSearchProps {
  onSelect: (supplier: Supplier) => void;
  placeholder?: string;
}

export function SupplierSearch({ onSelect, placeholder = 'Buscar fornecedor...' }: SupplierSearchProps) {
  const { suppliers } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    const supplierOptions = suppliers.map(supplier => ({
      value: supplier.id,
      label: `${supplier.name} (${supplier.documentNumber})`,
      supplier
    }));
    setOptions(supplierOptions);
  }, [suppliers]);

  const filterSuppliers = (input: string) => {
    return options.filter(option =>
      option.label.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleChange = (selected: any) => {
    if (selected) {
      const supplier = suppliers.find(s => s.id === selected.value);
      if (supplier) {
        onSelect(supplier);
      }
    }
  };

  return (
    <Select
      options={options}
      onChange={handleChange}
      onInputChange={(value) => setInputValue(value)}
      placeholder={placeholder}
      isClearable
      isSearchable
      className="w-full"
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({
          ...base,
          minHeight: '42px',
          borderRadius: '0.5rem',
          borderColor: '#E5E7EB',
          '&:hover': {
            borderColor: '#3B82F6'
          }
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected ? '#3B82F6' : state.isFocused ? '#EFF6FF' : 'white',
          color: state.isSelected ? 'white' : '#1F2937',
          '&:active': {
            backgroundColor: '#2563EB'
          }
        })
      }}
    />
  );
}