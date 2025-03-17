import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Star, FileSpreadsheet, Link as LinkIcon } from 'lucide-react';
import { SupplierSearch } from '../components/SupplierSearch';
import type { EvaluationFormData, Supplier } from '../types';

export function EvaluationForm() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { suppliers, addEvaluation, linkGoogleSheet } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    supplierId && supplierId !== 'new' 
      ? suppliers.find((s) => s.id === supplierId) || null 
      : null
  );

  const [formData, setFormData] = useState<EvaluationFormData>({
    supplierId: supplierId || '',
    quality: 0,
    price: 0,
    delivery: 0,
    communication: 0,
    comments: '',
    purchaseOrderNumber: '',
  });

  const [sheetUrl, setSheetUrl] = useState('');
  const [showSheetModal, setShowSheetModal] = useState(false);

  const [hoveredRatings, setHoveredRatings] = useState({
    quality: 0,
    price: 0,
    delivery: 0,
    communication: 0,
  });

  const handleRatingChange = (
    category: 'quality' | 'price' | 'delivery' | 'communication',
    rating: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: rating,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplier) {
      alert('Por favor, selecione um fornecedor');
      return;
    }

    if (!formData.purchaseOrderNumber) {
      alert('Por favor, insira o número da ordem de compra');
      return;
    }

    const evaluation = {
      id: crypto.randomUUID(),
      supplierId: selectedSupplier.id,
      evaluator: 'Current User', // In a real app, this would come from auth context
      date: new Date().toISOString(),
      ratings: {
        quality: formData.quality,
        price: formData.price,
        delivery: formData.delivery,
        communication: formData.communication,
        overall:
          (formData.quality +
            formData.price +
            formData.delivery +
            formData.communication) /
          4,
      },
      comments: formData.comments,
      purchaseOrderNumber: formData.purchaseOrderNumber,
    };

    addEvaluation(evaluation);
    navigate('/suppliers');
  };

  const handleLinkSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      await linkGoogleSheet(selectedSupplier.id, sheetUrl);
      setShowSheetModal(false);
      setSheetUrl('');
    } catch (error) {
      console.error('Error linking sheet:', error);
    }
  };

  const renderStars = (
    category: 'quality' | 'price' | 'delivery' | 'communication',
    label: string
  ) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onMouseEnter={() =>
                setHoveredRatings((prev) => ({ ...prev, [category]: rating }))
              }
              onMouseLeave={() =>
                setHoveredRatings((prev) => ({ ...prev, [category]: 0 }))
              }
              onClick={() => handleRatingChange(category, rating)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  rating <= (hoveredRatings[category] || formData[category])
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill={
                  rating <= (hoveredRatings[category] || formData[category])
                    ? 'currentColor'
                    : 'none'
                }
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Supplier Selection */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Selecionar Fornecedor</h2>
            <SupplierSearch
              onSelect={(supplier) => {
                setSelectedSupplier(supplier);
                setFormData(prev => ({ ...prev, supplierId: supplier.id }));
              }}
              placeholder="Busque pelo nome ou CNPJ do fornecedor..."
            />
          </div>
        </div>

        {selectedSupplier && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                <p className="text-gray-600">{selectedSupplier.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSheetModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <FileSpreadsheet className="h-5 w-5" />
                Vincular Planilha
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* Purchase Order Number */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Número da Ordem de Compra *
            </label>
            <input
              type="text"
              value={formData.purchaseOrderNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purchaseOrderNumber: e.target.value }))
              }
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="Digite o número da ordem de compra..."
            />
          </div>

          <h3 className="text-lg font-medium text-gray-900">
            Critérios de Avaliação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderStars('quality', 'Qualidade')}
            {renderStars('price', 'Preço')}
            {renderStars('delivery', 'Prazo de Entrega')}
            {renderStars('communication', 'Comunicação')}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-gray-700"
            >
              Comentários
            </label>
            <textarea
              id="comments"
              rows={4}
              value={formData.comments}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comments: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Adicione observações ou comentários sobre o fornecedor..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/suppliers')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Salvar Avaliação
            </button>
          </div>
        </div>
      </form>

      {/* Google Sheets Modal */}
      {showSheetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Vincular Planilha do Google Sheets
            </h3>
            <form onSubmit={handleLinkSheet} className="space-y-4">
              <div>
                <label
                  htmlFor="sheetUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL da Planilha
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <LinkIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="sheetUrl"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cole a URL da planilha aqui"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}