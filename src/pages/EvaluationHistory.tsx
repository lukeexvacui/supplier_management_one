import React, { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { Star } from 'lucide-react';

export function EvaluationHistory() {
  const { evaluations, suppliers } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const filteredEvaluations = selectedSupplier === 'all'
    ? evaluations
    : evaluations.filter(e => e.supplierId === selectedSupplier);

  const sortedEvaluations = [...filteredEvaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Histórico de Avaliações</h2>
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todos os Fornecedores</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {sortedEvaluations.map((evaluation) => {
          const supplier = suppliers.find(s => s.id === evaluation.supplierId);
          return (
            <div key={evaluation.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {supplier?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Avaliado por {evaluation.evaluator} em{' '}
                    {format(new Date(evaluation.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                  />
                  <span className="font-medium">
                    {evaluation.ratings.overall.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Qualidade</p>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                    />
                    <span>{evaluation.ratings.quality}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Preço</p>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                    />
                    <span>{evaluation.ratings.price}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prazo de Entrega</p>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                    />
                    <span>{evaluation.ratings.delivery}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Comunicação</p>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                    />
                    <span>{evaluation.ratings.communication}</span>
                  </div>
                </div>
              </div>

              {evaluation.comments && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">Comentários:</p>
                  <p className="mt-1 text-gray-700">{evaluation.comments}</p>
                </div>
              )}
            </div>
          );
        })}

        {sortedEvaluations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma avaliação encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}