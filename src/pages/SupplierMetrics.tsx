import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Award,
  Download,
  Filter,
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const COLORS = ['#3b82f6', '#34d399', '#f59e0b', '#ef4444'];

export function SupplierMetrics() {
  const { suppliers } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => 
    ['all', ...new Set(suppliers.map((s) => s.category))],
    [suppliers]
  );

  const filteredSuppliers = selectedCategory === 'all'
    ? suppliers
    : suppliers.filter((s) => s.category === selectedCategory);

  const calculateAverages = () => {
    const total = filteredSuppliers.length;
    if (total === 0) return { deliveryRate: 0, nonConformityRate: 0, npsScore: 0 };
    
    return {
      deliveryRate: filteredSuppliers.reduce((acc, s) => acc + s.metrics.deliveryRate, 0) / total,
      nonConformityRate: filteredSuppliers.reduce((acc, s) => acc + s.metrics.nonConformityRate, 0) / total,
      npsScore: filteredSuppliers.reduce((acc, s) => acc + s.metrics.npsScore, 0) / total,
    };
  };

  const averages = calculateAverages();

  const getStatusColor = (value: number, threshold: number, inverse = false) => {
    if (inverse) {
      return value > threshold ? 'text-red-600' : 'text-green-600';
    }
    return value < threshold ? 'text-red-600' : 'text-green-600';
  };

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Relatório de Métricas de Fornecedores', 20, 20);
    
    // Add filters info
    doc.setFontSize(12);
    doc.text(`Categoria: ${selectedCategory === 'all' ? 'Todas' : selectedCategory}`, 20, 35);
    doc.text(`Período: ${timeRange}`, 20, 45);
    
    // Add averages
    doc.text('Médias:', 20, 60);
    doc.text(`Taxa de Entrega: ${averages.deliveryRate.toFixed(1)}%`, 25, 70);
    doc.text(`Taxa de Não Conformidade: ${averages.nonConformityRate.toFixed(1)}%`, 25, 80);
    doc.text(`NPS: ${averages.npsScore.toFixed(1)}`, 25, 90);
    
    // Add top performers
    doc.text('Melhores Fornecedores:', 20, 110);
    filteredSuppliers
      .sort((a, b) => b.metrics.npsScore - a.metrics.npsScore)
      .slice(0, 3)
      .forEach((supplier, index) => {
        doc.text(`${index + 1}. ${supplier.name}`, 25, 120 + (index * 10));
        doc.text(`   NPS: ${supplier.metrics.npsScore.toFixed(1)}`, 35, 120 + (index * 10));
      });
    
    doc.save('metricas-fornecedores.pdf');
  };

  const pieData = useMemo(() => {
    const statusCount = filteredSuppliers.reduce((acc, supplier) => {
      acc[supplier.status] = (acc[supplier.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [filteredSuppliers]);

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-5 w-5" />
            Filtros
          </button>
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-5 w-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1m">Último Mês</option>
                <option value="3m">Últimos 3 Meses</option>
                <option value="6m">Últimos 6 Meses</option>
                <option value="1y">Último Ano</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taxa de Entrega no Prazo</p>
              <p className={`text-2xl font-bold ${getStatusColor(averages.deliveryRate, 95)}`}>
                {averages.deliveryRate.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              averages.deliveryRate >= 95 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {averages.deliveryRate >= 95 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Meta: 95%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taxa de Não Conformidade</p>
              <p className={`text-2xl font-bold ${getStatusColor(averages.nonConformityRate, 3, true)}`}>
                {averages.nonConformityRate.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              averages.nonConformityRate <= 3 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {averages.nonConformityRate <= 3 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Meta: {'<'}3%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">NPS</p>
              <p className={`text-2xl font-bold ${getStatusColor(averages.npsScore, 8)}`}>
                {averages.npsScore.toFixed(1)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              averages.npsScore >= 8 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {averages.npsScore >= 8 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Meta: {'>'}8</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Rate Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Evolução da Taxa de Entrega</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredSuppliers[0]?.metrics.historicalData || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Entrega']}
                  labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="deliveryRate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Distribuição por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Non-Conformities by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Não Conformidades por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories.map((category) => ({
                  category: category === 'all' ? 'Todas' : category,
                  nonConformities: filteredSuppliers
                    .filter((s) => category === 'all' || s.category === category)
                    .reduce((acc, s) => acc + s.nonConformities.length, 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="nonConformities" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NPS Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Evolução do NPS</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredSuppliers[0]?.metrics.historicalData || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}`, 'NPS']}
                  labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                />
                <Line
                  type="monotone"
                  dataKey="npsScore"
                  stroke="#34d399"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Melhores Fornecedores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSuppliers
            .sort((a, b) => b.metrics.npsScore - a.metrics.npsScore)
            .slice(0, 3)
            .map((supplier) => (
              <div
                key={supplier.id}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                    <p className="text-sm text-gray-500">{supplier.category}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">NPS</p>
                    <p className="font-medium">{supplier.metrics.npsScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Entregas</p>
                    <p className="font-medium">{supplier.metrics.deliveryRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}