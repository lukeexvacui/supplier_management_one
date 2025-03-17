import { create } from 'zustand';
import { Supplier, Evaluation, NonConformity } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';
import { supplierService } from '../services/supplierService';
import { evaluationService } from '../services/evaluationService';
import { nonConformityService } from '../services/nonConformityService';

interface StoreState {
  suppliers: Supplier[];
  evaluations: Evaluation[];
  columnMappings: Record<string, string>;
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  addSuppliers: (suppliers: Omit<Supplier, 'id'>[]) => Promise<void>;
  updateSupplier: (supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => Promise<void>;
  updateEvaluation: (evaluation: Evaluation) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  addNonConformity: (nonConformity: Omit<NonConformity, 'id'>) => Promise<void>;
  updateNonConformity: (nonConformity: NonConformity) => Promise<void>;
  setColumnMappings: (mappings: Record<string, string>) => void;
  linkGoogleSheet: (supplierId: string, sheetUrl: string) => Promise<void>;
  loadInitialData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  suppliers: [],
  evaluations: [],
  columnMappings: {},
  
  setSuppliers: (suppliers) => set({ suppliers }),
  
  addSupplier: async (supplier) => {
    try {
      const newSupplier = await supplierService.createSupplier(supplier);
      set((state) => ({
        suppliers: [...state.suppliers, newSupplier],
      }));
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      throw error;
    }
  },
  
  addSuppliers: async (suppliers) => {
    try {
      const newSuppliers = await Promise.all(
        suppliers.map(supplier => supplierService.createSupplier(supplier))
      );
      
      set((state) => ({
        suppliers: [...state.suppliers, ...newSuppliers],
      }));
    } catch (error) {
      console.error('Erro ao adicionar fornecedores:', error);
      throw error;
    }
  },
  
  updateSupplier: async (supplier) => {
    try {
      const updatedSupplier = await supplierService.updateSupplier(supplier.id, supplier);
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === updatedSupplier.id ? updatedSupplier : s
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  },
  
  deleteSupplier: async (id) => {
    try {
      await supplierService.deleteSupplier(id);
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar fornecedor:', error);
      throw error;
    }
  },
  
  addEvaluation: async (evaluation) => {
    try {
      const newEvaluation = await evaluationService.createEvaluation(evaluation);
      set((state) => ({
        evaluations: [...state.evaluations, newEvaluation],
      }));
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  },
  
  updateEvaluation: async (evaluation) => {
    try {
      const updatedEvaluation = await evaluationService.updateEvaluation(
        evaluation.id,
        evaluation
      );
      set((state) => ({
        evaluations: state.evaluations.map((e) =>
          e.id === updatedEvaluation.id ? updatedEvaluation : e
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  },
  
  deleteEvaluation: async (id) => {
    try {
      await evaluationService.deleteEvaluation(id);
      set((state) => ({
        evaluations: state.evaluations.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      throw error;
    }
  },

  addNonConformity: async (nonConformity) => {
    try {
      const newNonConformity = await nonConformityService.createNonConformity(
        nonConformity
      );
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === newNonConformity.supplierId
            ? {
                ...s,
                nonConformities: [...s.nonConformities, newNonConformity],
              }
            : s
        ),
      }));
    } catch (error) {
      console.error('Erro ao adicionar não conformidade:', error);
      throw error;
    }
  },

  updateNonConformity: async (nonConformity) => {
    try {
      const updatedNonConformity = await nonConformityService.updateNonConformity(
        nonConformity.id,
        nonConformity
      );
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === updatedNonConformity.supplierId
            ? {
                ...s,
                nonConformities: s.nonConformities.map((n) =>
                  n.id === updatedNonConformity.id ? updatedNonConformity : n
                ),
              }
            : s
        ),
      }));
    } catch (error) {
      console.error('Erro ao atualizar não conformidade:', error);
      throw error;
    }
  },

  setColumnMappings: (mappings) =>
    set({ columnMappings: mappings }),

  linkGoogleSheet: async (supplierId, sheetUrl) => {
    try {
      await GoogleSheetsService.linkSheet(supplierId, sheetUrl);
    } catch (error) {
      console.error('Erro ao vincular planilha:', error);
      throw error;
    }
  },

  loadInitialData: async () => {
    try {
      const [suppliers, evaluations] = await Promise.all([
        supplierService.getAllSuppliers(),
        evaluationService.getAllEvaluations(),
      ]);

      set({
        suppliers,
        evaluations,
      });
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      throw error;
    }
  }
}));