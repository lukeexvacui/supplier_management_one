import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  Star,
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  MessageSquare,
  Download,
  Plus,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';
import { NonConformityModal } from '../components/NonConformityModal';
import { FileUpload } from '../components/FileUpload';
import { jsPDF } from 'jspdf';

export function SupplierProfile() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { suppliers, evaluations } = useStore();
  const [showNonConformityModal, setShowNonConformityModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluations' | 'nonconformities' | 'documents'>('overview');

  const supplier = suppliers.find((s) => s.id === supplierId);
  const supplierEvaluations = evaluations.filter((e) => e.supplierId === supplierId);

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fornecedor não encontrado.</p>
      </div>
    );
  }

  const generateReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(`Relatório do Fornecedor: ${supplier.name}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`CNPJ: ${supplier.documentNumber}`, 20, 35);
    doc.text(`Email: ${supplier.email}`, 20, 45);
    doc.text(`Telefone: ${supplier.phone}`, 20, 55);
    doc.text(`Status: ${supplier.status}`, 20, 65);
    
    doc.text('Métricas:', 20, 80);
    doc.text(`Taxa de Entrega: ${supplier.metrics.deliveryRate}%`, 25, 90);
    doc.text(`NPS: ${supplier.metrics.npsScore}`, 25, 100);
    doc.text(`Qualidade: ${supplier.metrics.qualityScore}`, 25, 110);
    
    doc.save(`relatorio-${supplier.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-50 text-green-700',
      inactive: 'bg-gray-50 text-gray-700',
      blocked: 'bg-red-50 text-red-700',
      temporarily_blocked: 'bg-yellow-50 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      blocked: 'Bloqueado',
      temporarily_blocked: 'Bloqueado Temporariamente',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
              <p className="text-gray-600">{supplier.legalName}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(supplier.status)}`}>
                  {getStatusLabel(supplier.status)}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <span className="font-medium">{supplier.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateReport}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
              >
                <Download className="h-5 w-5" />
                Exportar PDF
              </button>
              <button
                onClick={() => navigate(`/evaluate/${supplier.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Nova Avaliação
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">CNPJ</p>
                <p className="font-medium">{supplier.documentNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${supplier.email}`} className="font-medium text-blue-600 hover:text-blue-800">
                  {supplier.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <a href={`tel:${supplier.phone}`} className="font-medium text-blue-600 hover:text-blue-800">
                  {supplier.phone}
                </a>
              </div>
            </div>
            {supplier.whatsapp && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <a href={`https://wa.me/${supplier.whatsapp}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {supplier.whatsapp}
                  </a>
                </div>
              </div>
            )}
          </div>

          {supplier.address && (
            <div className="mt-4 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="font-medium">{supplier.address}</p>
                {supplier.locationUrl && (
                  <a
                    href={supplier.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ver no mapa
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('evaluations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'evaluations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Avaliações
            </button>
            <button
              onClick={() => setActiveTab('nonconformities')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'nonconformities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Não Conformidades
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documentos
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Taxa de Entrega</p>
                  <p className="text-2xl font-bold">{supplier.metrics.deliveryRate}%</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">NPS</p>
                  <p className="text-2xl font-bold">{supplier.metrics.npsScore}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Não Conformidades</p>
                  <p className="text-2xl font-bold">{supplier.nonConformities.length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avaliações</p>
                  <p className="text-2xl font-bold">{supplierEvaluations.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {[...supplierEvaluations]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((evaluation) => (
                  <div key={evaluation.id} className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Star className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Nova Avaliação</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(evaluation.date), 'dd/MM/yyyy')} por {evaluation.evaluator}
                      </p>
                      {evaluation.comments && (
                        <p className="mt-1 text-sm text-gray-600">{evaluation.comments}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evaluations' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Histórico de Avaliações</h2>
            <div className="space-y-6">
              {supplierEvaluations
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((evaluation) => (
                  <div key={evaluation.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {format(new Date(evaluation.date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Avaliado por {evaluation.evaluator}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                        <span className="font-medium">
                          {evaluation.ratings.overall.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Qualidade</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                          <span>{evaluation.ratings.quality}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Preço</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                          <span>{evaluation.ratings.price}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Entrega</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                          <span>{evaluation.ratings.delivery}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Comunicação</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                          <span>{evaluation.ratings.communication}</span>
                        </div>
                      </div>
                    </div>

                    {evaluation.comments && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Comentários:</p>
                        <p className="mt-1 text-gray-700">{evaluation.comments}</p>
                      </div>
                    )}
                  </div>
                ))}

              {supplierEvaluations.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhuma avaliação encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nonconformities' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Não Conformidades</h2>
              <button
                onClick={() => setShowNonConformityModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                Nova Não Conformidade
              </button>
            </div>

            <div className="space-y-6">
              {supplier.nonConformities
                .sort(
                  (a, b) =>
                    new Date(b.reportedDate).getTime() -
                    new Date(a.reportedDate).getTime()
                )
                .map((nc) => (
                  <div
                    key={nc.id}
                    className="border-b pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{nc.type}</h3>
                        <p className="text-sm text-gray-500">
                          Reportado em{' '}
                          {format(new Date(nc.reportedDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          nc.status === 'open'
                            ? 'bg-red-50 text-red-700'
                            : nc.status === 'in_progress'
                            ? 'bg-yellow-50 text-yellow-700'
                            : nc.status === 'resolved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {nc.status === 'open'
                          ? 'Em Aberto'
                          : nc.status === 'in_progress'
                          ? 'Em Andamento'
                          : nc.status === 'resolved'
                          ? 'Resolvido'
                          : 'Escalado'}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-600">{nc.description}</p>

                    {nc.resolution && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Resolução:</p>
                        <p className="mt-1 text-gray-700">{nc.resolution}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Severidade: {nc.severity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Prazo: {format(new Date(nc.resolutionDeadline), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                ))}

              {supplier.nonConformities.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhuma não conformidade encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Documentos</h2>
            
            <div className="mb-6">
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

            <div className="space-y-4">
              {supplier.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(doc.uploadedAt), 'dd/MM/yyyy')} •{' '}
                        {(doc.size / 1024).toFixed(0)}KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </div>
              ))}

              {supplier.documents.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhum documento encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <NonConformityModal
        isOpen={showNonConformityModal}
        onClose={() => setShowNonConformityModal(false)}
        supplierId={supplier.id}
      />
    </div>
  );
}