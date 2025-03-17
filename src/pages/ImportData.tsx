import React, { useState, useCallback } from 'react';
import { useStore } from '../store';
import { read, utils } from 'xlsx';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  AlertCircle,
  Download,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import type { Supplier } from '../types';

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
}

const REQUIRED_FIELDS = [
  { field: 'name', label: 'Nome' },
  { field: 'email', label: 'Email' },
  { field: 'category', label: 'Categoria' },
];

const OPTIONAL_FIELDS = [
  { field: 'phone', label: 'Telefone' },
  { field: 'address', label: 'Endereço' },
  { field: 'status', label: 'Status' },
];

export function ImportData() {
  const navigate = useNavigate();
  const { addSuppliers, columnMappings, setColumnMappings } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    let data: any[] = [];
    let headers: string[] = [];

    try {
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        data = result.data;
        headers = result.meta.fields || [];
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = utils.sheet_to_json(worksheet);
        headers = Object.keys(data[0] || {});
      }

      setPreviewData(data);
      setColumns(headers);
      setMappings(
        headers.map((header) => ({
          sourceColumn: header,
          targetField: columnMappings[header] || '',
          required: false,
        }))
      );
      setStep('mapping');
    } catch (error) {
      setErrors(['Erro ao processar o arquivo. Verifique o formato e tente novamente.']);
    }
  }, [columnMappings]);

  const validateMappings = () => {
    const errors: string[] = [];
    const mappedFields = new Set(mappings.map((m) => m.targetField));

    REQUIRED_FIELDS.forEach(({ field, label }) => {
      if (!mappedFields.has(field)) {
        errors.push(`O campo "${label}" é obrigatório e deve ser mapeado.`);
      }
    });

    return errors;
  };

  const handleMappingChange = (sourceColumn: string, targetField: string) => {
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.sourceColumn === sourceColumn
          ? {
              ...mapping,
              targetField,
              required: REQUIRED_FIELDS.some((f) => f.field === targetField),
            }
          : mapping
      )
    );

    // Save mapping for future use
    setColumnMappings({ ...columnMappings, [sourceColumn]: targetField });
  };

  const handleImport = () => {
    const mappingErrors = validateMappings();
    if (mappingErrors.length > 0) {
      setErrors(mappingErrors);
      return;
    }

    const suppliers: Supplier[] = previewData.map((row) => {
      const supplier: any = {
        id: crypto.randomUUID(),
        averageRating: 0,
        lastEvaluation: '-',
        metrics: {
          deliveryRate: 100,
          nonConformityRate: 0,
          npsScore: 0,
          responseTime: 0,
          qualityScore: 0,
          lastUpdated: new Date().toISOString(),
          historicalData: [],
        },
        nonConformities: [],
        recommendations: [],
      };

      mappings.forEach((mapping) => {
        if (mapping.targetField) {
          supplier[mapping.targetField] = row[mapping.sourceColumn];
        }
      });

      return supplier;
    });

    addSuppliers(suppliers);
    setStep('complete');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {['upload', 'mapping', 'preview', 'complete'].map((s, index) => (
          <div
            key={s}
            className={`flex items-center ${
              index <= ['upload', 'mapping', 'preview', 'complete'].indexOf(step)
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= ['upload', 'mapping', 'preview', 'complete'].indexOf(step)
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}
            >
              {index + 1}
            </div>
            {index < 3 && <ArrowRight className="mx-2" />}
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Erros encontrados</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium">Upload de Arquivo</h2>
            <p className="mt-2 text-sm text-gray-500">
              Arraste um arquivo ou clique para selecionar
            </p>
          </div>
          <div className="mt-6">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
        </div>
      )}

      {step === 'mapping' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-medium">Mapeamento de Colunas</h2>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Campos Obrigatórios</h3>
            {REQUIRED_FIELDS.map(({ field, label }) => (
              <div key={field} className="flex items-center gap-4">
                <div className="w-1/3">
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                  <span className="text-red-500">*</span>
                </div>
                <div className="w-2/3">
                  <select
                    value={mappings.find((m) => m.targetField === field)?.sourceColumn || ''}
                    onChange={(e) => handleMappingChange(e.target.value, field)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma coluna</option>
                    {columns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <h3 className="text-sm font-medium text-gray-700 mt-6">Campos Opcionais</h3>
            {OPTIONAL_FIELDS.map(({ field, label }) => (
              <div key={field} className="flex items-center gap-4">
                <div className="w-1/3">
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </div>
                <div className="w-2/3">
                  <select
                    value={mappings.find((m) => m.targetField === field)?.sourceColumn || ''}
                    onChange={(e) => handleMappingChange(e.target.value, field)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma coluna</option>
                    {columns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Voltar
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              Importar
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-medium">Importação Concluída</h2>
          <p className="mt-2 text-sm text-gray-500">
            Os fornecedores foram importados com sucesso!
          </p>
          <button
            onClick={() => navigate('/suppliers')}
            className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
          >
            Ver Fornecedores
          </button>
        </div>
      )}
    </div>
  );
}