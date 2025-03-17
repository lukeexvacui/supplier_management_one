import { create } from 'zustand';
import { Supplier, Evaluation, NonConformity } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';

interface StoreState {
  suppliers: Supplier[];
  evaluations: Evaluation[];
  columnMappings: Record<string, string>;
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  addSuppliers: (suppliers: Supplier[]) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (evaluation: Evaluation) => void;
  deleteEvaluation: (id: string) => void;
  addNonConformity: (nonConformity: NonConformity) => void;
  updateNonConformity: (nonConformity: NonConformity) => void;
  setColumnMappings: (mappings: Record<string, string>) => void;
  linkGoogleSheet: (supplierId: string, sheetUrl: string) => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  suppliers: [],
  evaluations: [],
  columnMappings: {},
  
  setSuppliers: (suppliers) => set({ suppliers }),
  
  addSupplier: (supplier) =>
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    })),
  
  addSuppliers: (newSuppliers) =>
    set((state) => ({
      suppliers: [...state.suppliers, ...newSuppliers],
    })),
  
  updateSupplier: (supplier) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === supplier.id ? supplier : s
      ),
    })),
  
  deleteSupplier: (id) =>
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    })),
  
  addEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: [...state.evaluations, evaluation],
    })),
  
  updateEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: state.evaluations.map((e) =>
        e.id === evaluation.id ? evaluation : e
      ),
    })),
  
  deleteEvaluation: (id) =>
    set((state) => ({
      evaluations: state.evaluations.filter((e) => e.id !== id),
    })),

  addNonConformity: (nonConformity) =>
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === nonConformity.supplierId
          ? {
              ...supplier,
              nonConformities: [...supplier.nonConformities, nonConformity],
            }
          : supplier
      ),
    })),

  updateNonConformity: (nonConformity) =>
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === nonConformity.supplierId
          ? {
              ...supplier,
              nonConformities: supplier.nonConformities.map((nc) =>
                nc.id === nonConformity.id ? nonConformity : nc
              ),
            }
          : supplier
      ),
    })),

  setColumnMappings: (mappings) =>
    set({ columnMappings: mappings }),

  linkGoogleSheet: async (supplierId: string, sheetUrl: string) => {
    try {
      const urlParts = sheetUrl.split('/');
      const spreadsheetId = urlParts[urlParts.length - 2];
      const sheetsService = new GoogleSheetsService();
      const employeeData = await sheetsService.fetchEmployeeData(spreadsheetId);
      const goals = await sheetsService.fetchGoals(spreadsheetId);
      const competencies = await sheetsService.fetchCompetencies(spreadsheetId);
      const feedbacks = await sheetsService.fetchFeedbacks(spreadsheetId);

      set((state) => ({
        suppliers: state.suppliers.map((supplier) =>
          supplier.id === supplierId
            ? {
                ...supplier,
                googleSheetId: spreadsheetId,
              }
            : supplier
        ),
      }));
    } catch (error) {
      console.error('Error linking Google Sheet:', error);
      throw error;
    }
  },
}));