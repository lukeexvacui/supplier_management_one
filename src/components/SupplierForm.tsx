import React from 'react';
import { useForm } from 'react-hook-form';
import validator from 'validator';
import { X } from 'lucide-react';
import type { Supplier } from '../types';

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Supplier>) => void;
  initialData?: Partial<Supplier>;
}

export function SupplierForm({ isOpen, onClose, onSubmit, initialData }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      legalName: '',
      documentNumber: '',
      address: '',
      phone: '',
      email: '',
      name: '',
      whatsapp: '',
    },
  });

  const validateCNPJ = (value: string) => {
    // Remove non-numeric characters
    const numbers = value.replace(/[^\d]/g, '');
    
    // Check length
    if (numbers.length !== 14) return false;
    
    // Check for repeated numbers
    if (/^(\d)\1+$/.test(numbers)) return false;
    
    // Validate check digits
    let sum = 0;
    let pos = 5;
    
    // First check digit
    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(numbers[12])) return false;
    
    // Second check digit
    sum = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(numbers[13]);
  };

  const onSubmitForm = async (data: any) => {
    onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                {...register('legalName', { required: 'Razão Social é obrigatória' })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.legalName ? 'border-red-500' : ''
                }`}
              />
              {errors.legalName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.legalName.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                {...register('documentNumber', {
                  required: 'CNPJ é obrigatório',
                  validate: (value) =>
                    validateCNPJ(value) || 'CNPJ inválido',
                })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.documentNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.documentNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.documentNumber.message as string}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço Completo *
              </label>
              <input
                type="text"
                {...register('address', { required: 'Endereço é obrigatório' })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : ''
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Contato Principal *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Nome do contato é obrigatório' })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  validate: (value) =>
                    validator.isEmail(value) || 'Email inválido',
                })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'Telefone inválido',
                  },
                })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp *
              </label>
              <input
                type="tel"
                {...register('whatsapp', {
                  required: 'WhatsApp é obrigatório',
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'WhatsApp inválido',
                  },
                })}
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.whatsapp ? 'border-red-500' : ''
                }`}
              />
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.whatsapp.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}