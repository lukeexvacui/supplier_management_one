import React from 'react';
import { useStore } from '../store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function Dashboard() {
  const { suppliers, evaluations } = useStore();

  const averageRatings = suppliers.map((supplier) => ({
    name: supplier.name,
    rating: supplier.averageRating,
  }));

  const criticalSuppliers = suppliers.filter(
    (supplier) => supplier.status === 'critical'
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Total de Fornecedores
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {suppliers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Avaliações este Mês
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {evaluations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">
                Fornecedores Críticos
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {criticalSuppliers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Média de Avaliações por Fornecedor
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averageRatings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Suppliers */}
      {criticalSuppliers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Fornecedores Críticos
          </h3>
          <div className="space-y-4">
            {criticalSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-red-700">{supplier.name}</p>
                  <p className="text-sm text-red-600">
                    Última avaliação: {supplier.lastEvaluation}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
                  Crítico
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}