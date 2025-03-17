import React, { useState } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';
import type { NonConformity } from '../types';

interface NonConformityModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: string;
}

export function NonConformityModal({ isOpen, onClose, supplierId }: NonConformityModalProps) {
  const { suppliers, addNonConformity } = useStore();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    selectedSupplierId: supplierId || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nonConformity: NonConformity = {
      id: crypto.randomUUID(),
      supplierId: formData.selectedSupplierId,
      type: formData.type as NonConformity['type'],
      severity: 'medium',
      description: formData.description,
      reportedDate: new Date().toISOString(),
      status: 'open',
      resolutionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      impact: 'Pendente de avaliação',
    };

    addNonConformity(nonConformity);
    onClose();
    setFormData({ type: '', description: '', selectedSupplierId: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nova Não Conformidade</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!supplierId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <select
                value={formData.selectedSupplierId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    selectedSupplierId: e.target.value,
                  }))
                }
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Não Conformidade
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="delivery">Atraso</option>
              <option value="quality">Problemas de Qualidade</option>
              <option value="documentation">Problemas Financeiros</option>
              <option value="communication">Comunicação</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              required
              placeholder="Descreva o problema detalhadamente..."
            />
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
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}