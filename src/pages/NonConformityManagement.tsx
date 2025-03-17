import React, { useState } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  AlertOctagon,
  Plus,
  FileText,
  MessageSquare,
  Filter,
  Download,
  BarChart2,
} from 'lucide-react';
import { NonConformityModal } from '../components/NonConformityModal';
import { FileUpload } from '../components/FileUpload';
import type { NonConformity } from '../types';
import { jsPDF } from 'jspdf';

export function NonConformityManagement() {
  const { suppliers } = useStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<NonConformity['status']>('open');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const nonConformities = suppliers
    .flatMap((s) => s.nonConformities.map((nc) => ({ ...nc, supplierName: s.name })))
    .filter((nc) => {
      const matchesSupplier = !selectedSupplier || nc.supplierId === selectedSupplier;
      const matchesStatus = !selectedStatus || nc.status === selectedStatus;
      const matchesSeverity = selectedSeverity === 'all' || nc.severity === selectedSeverity;
      
      if (dateRange === 'all') return matchesSupplier && matchesStatus && matchesSeverity;
      
      const date = new Date(nc.reportedDate);
      const now = new Date();
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[dateRange];
      
      const isWithinRange = date >= new Date(now.setDate(now.getDate() - days));
      return matchesSupplier && matchesStatus && matchesSeverity && isWithinRange;
    });

  const getStatusColor = (status: NonConformity['status']) => {
    const colors = {
      open: 'text-red-600 bg-red-50',
      in_progress: 'text-yellow-600 bg-yellow-50',
      resolved: 'text-green-600 bg-green-50',
      escalated: 'text-purple-600 bg-purple-50',
    };
    return colors[status];
  };

  const getSeverityIcon = (severity: NonConformity['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Relatório de Não Conformidades', 20, 20);
    
    // Add filters info
    doc.setFontSize(12);
    doc.text(`Período: ${dateRange}`, 20, 35);
    doc.text(`Status: ${selectedStatus || 'Todos'}`, 20, 45);
    doc.text(`Severidade: ${selectedSeverity}`, 20, 55);
    
    // Add non-conformities
    let yPos = 70;
    nonConformities.forEach((nc, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${nc.supplierName}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Tipo: ${nc.type}`, 25, yPos + 7);
      doc.text(`Severidade: ${nc.severity}`, 25, yPos + 14);
      doc.text(`Status: ${nc.status}`, 25, yPos + 21);
      doc.text(`Data: ${format(new Date(nc.reportedDate), 'dd/MM/yyyy')}`, 25, yPos + 28);
      
      yPos += 40;
    });
    
    doc.save('nao-conformidades.pdf');
  };

  const getStatusStats = () => {
    return {
      open: nonConformities.filter(nc => nc.status === 'open').length,
      in_progress: nonConformities.filter(nc => nc.status === 'in_progress').length,
      resolved: nonConformities.filter(nc => nc.status === 'resolved').length,
      escalated: nonConformities.filter(nc => nc.status === 'escalated').length,
    };
  };

  const stats = getStatusStats();

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
          <button
            onClick={() => {}} // Add analytics view
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
          >
            <BarChart2 className="h-5 w-5" />
            Analytics
          </button>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Nova Não Conformidade
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as NonConformity['status'])}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="open">Em Aberto</option>
                <option value="in_progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="escalated">Escalado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severidade
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo período</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(['open', 'in_progress', 'resolved', 'escalated'] as const).map((status) => {
          const count = stats[status];
          return (
            <div key={status} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {status === 'open' && 'Em Aberto'}
                    {status === 'in_progress' && 'Em Andamento'}
                    {status === 'resolved' && 'Resolvidos'}
                    {status === 'escalated' && 'Escalados'}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className={`p-3 rounded-full ${getStatusColor(status)}`}>
                  {status === 'open' && <AlertTriangle className="h-6 w-6" />}
                  {status === 'in_progress' && <Clock className="h-6 w-6" />}
                  {status === 'resolved' && <CheckCircle className="h-6 w-6" />}
                  {status === 'escalated' && <AlertOctagon className="h-6 w-6" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-Conformity List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {nonConformities.map((nc) => (
            <div key={nc.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(nc.severity)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {nc.supplierName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{nc.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(nc.reportedDate), 'dd/MM/yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {nc.type}
                      </span>
                      {nc.resolution && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {nc.resolution}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(nc.status)}`}>
                  {nc.status === 'open' && 'Em Aberto'}
                  {nc.status === 'in_progress' && 'Em Andamento'}
                  {nc.status === 'resolved' && 'Resolvido'}
                  {nc.status === 'escalated' && 'Escalado'}
                </span>
              </div>
              
              {/* File Upload Section */}
              <div className="mt-4">
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024} // 5MB
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg'],
                    'application/pdf': ['.pdf']
                  }}
                />
              </div>
            </div>
          ))}

          {nonConformities.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhuma não conformidade encontrada com os filtros selecionados.
            </div>
          )}
        </div>
      </div>

      <NonConformityModal
        isOpen={showNewForm}
        onClose={() => setShowNewForm(false)}
        supplierId={selectedSupplier}
      />
    </div>
  );
}