import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useStore } from '../store';
import { Supplier } from '../types';
import { Search, ArrowUpDown, Star, Mail, Phone, Plus, Edit } from 'lucide-react';
import { SupplierForm } from '../components/SupplierForm';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<Supplier>();

export function SupplierList() {
  const navigate = useNavigate();
  const { suppliers, addSupplier, updateSupplier, loadInitialData } = useStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadInitialData();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadInitialData]);

  const handleSubmit = async (data: Partial<Supplier>) => {
    try {
      if (selectedSupplier) {
        await updateSupplier({
          ...selectedSupplier,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } else {
        const newSupplier: Omit<Supplier, 'id'> = {
          name: data.name || '',
          legalName: data.legalName || '',
          documentNumber: data.documentNumber || '',
          category: 'Novo',
          email: data.email || '',
          phone: data.phone || '',
          averageRating: 0,
          lastEvaluation: new Date().toISOString(),
          status: 'active',
          metrics: {
            deliveryRate: 0,
            nonConformityRate: 0,
            npsScore: 0,
            responseTime: 0,
            qualityScore: 0,
            lastUpdated: new Date().toISOString(),
            historicalData: [],
            positiveEvaluations: 0,
            negativeEvaluations: 0,
            totalEvaluations: 0,
          },
          nonConformities: [],
          recommendations: [],
          customFields: {},
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Adiciona campos opcionais apenas se existirem
        if (data.whatsapp) newSupplier.whatsapp = data.whatsapp;
        if (data.address) newSupplier.address = data.address;
        if (data.locationUrl) newSupplier.locationUrl = data.locationUrl;

        await addSupplier(newSupplier);
      }
      setShowForm(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting()}
          >
            Nome
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: (info) => (
          <button
            onClick={() => navigate(`/suppliers/${info.row.original.id}`)}
            className="font-medium text-gray-900 hover:text-blue-600"
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor('legalName', {
        header: 'Razão Social',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('documentNumber', {
        header: 'CNPJ',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:text-blue-800">
              {info.getValue()}
            </a>
          </div>
        ),
      }),
      columnHelper.accessor('phone', {
        header: 'Telefone',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <a href={`tel:${info.getValue()}`} className="text-blue-600 hover:text-blue-800">
              {info.getValue()}
            </a>
          </div>
        ),
      }),
      columnHelper.accessor('averageRating', {
        header: ({ column }) => (
          <button
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting()}
          >
            Média de Avaliação
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: (info) => (
          <div className="flex items-center gap-1">
            <Star
              className={`h-5 w-5 ${
                info.getValue() >= 4
                  ? 'text-yellow-400'
                  : info.getValue() >= 3
                  ? 'text-yellow-200'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
            />
            <span>{info.getValue().toFixed(1)}</span>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const statusStyles = {
            active: 'bg-green-50 text-green-700',
            inactive: 'bg-gray-50 text-gray-700',
            blocked: 'bg-red-50 text-red-700',
            temporarily_blocked: 'bg-yellow-50 text-yellow-700',
          };

          const statusLabels = {
            active: 'Ativo',
            inactive: 'Inativo',
            blocked: 'Bloqueado',
            temporarily_blocked: 'Bloqueado Temporariamente',
          };

          return (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusStyles[status]
              }`}
            >
              {statusLabels[status]}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        cell: (info) => (
          <button
            onClick={() => {
              setSelectedSupplier(info.row.original);
              setShowForm(true);
            }}
            className="text-gray-400 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </button>
        ),
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data: suppliers,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const uniqueCategories = useMemo(
    () => ['all', ...new Set(suppliers.map((s) => s.category))],
    [suppliers]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
        <button
          onClick={() => {
            setSelectedSupplier(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Adicionar Fornecedor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar fornecedores..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as Categorias' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Form Modal */}
      <SupplierForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedSupplier || undefined}
      />
    </div>
  );
}