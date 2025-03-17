export interface Supplier {
  id: string;
  name: string;
  legalName: string;
  documentNumber: string; // CNPJ/CPF
  category: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  locationUrl?: string;
  averageRating: number;
  lastEvaluation: string;
  status: 'active' | 'inactive' | 'blocked' | 'temporarily_blocked';
  metrics: SupplierMetrics;
  nonConformities: NonConformity[];
  recommendations: Recommendation[];
  customFields: Record<string, string>;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierMetrics {
  deliveryRate: number;
  nonConformityRate: number;
  npsScore: number;
  responseTime: number;
  qualityScore: number;
  lastUpdated: string;
  historicalData: MetricHistory[];
  positiveEvaluations: number;
  negativeEvaluations: number;
  totalEvaluations: number;
}

export interface MetricHistory {
  date: string;
  deliveryRate: number;
  nonConformityRate: number;
  npsScore: number;
  qualityScore: number;
  positiveEvaluations: number;
  negativeEvaluations: number;
}

export interface NonConformity {
  id: string;
  supplierId: string;
  type: 'quality' | 'delivery' | 'documentation' | 'communication' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedDate: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  resolutionDeadline: string;
  resolutionDate?: string;
  resolution?: string;
  escalationReason?: string;
  impact: string;
  attachments: Document[];
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Recommendation {
  id: string;
  supplierId: string;
  type: 'improvement' | 'warning' | 'action_required' | 'recognition';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  aiGenerated: boolean;
}

export interface Evaluation {
  id: string;
  supplierId: string;
  evaluator: string;
  date: string;
  ratings: {
    quality: number;
    price: number;
    delivery: number;
    communication: number;
    overall: number;
  };
  comments: string;
  attachments: Document[];
  type: 'positive' | 'negative';
  purchaseOrderNumber: string;
}

export interface EvaluationFormData {
  supplierId: string;
  quality: number;
  price: number;
  delivery: number;
  communication: number;
  comments: string;
  purchaseOrderNumber: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

export interface TableConfig {
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}