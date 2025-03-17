import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco de dados
export type Supplier = {
  id: string
  name: string
  legal_name: string
  document_number: string
  category: string
  email: string
  phone: string
  whatsapp?: string
  address?: string
  location_url?: string
  average_rating: number
  last_evaluation?: string
  status: string
  custom_fields?: Record<string, any>
  created_at: string
  updated_at: string
}

export type Metric = {
  id: string
  supplier_id: string
  delivery_rate: number
  non_conformity_rate: number
  nps_score: number
  response_time: number
  quality_score: number
  positive_evaluations: number
  negative_evaluations: number
  total_evaluations: number
  last_updated: string
  historical_data: any[]
}

export type Evaluation = {
  id: string
  supplier_id: string
  evaluator: string
  date: string
  ratings: Record<string, any>
  comments?: string
  type: string
  created_at: string
}

export type NonConformity = {
  id: string
  supplier_id: string
  type: string
  severity: string
  description: string
  reported_date: string
  status: string
  resolution_deadline: string
  resolution_date?: string
  resolution?: string
  escalation_reason?: string
  impact?: string
  created_at: string
  updated_at: string
}

export type Document = {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploaded_by: string
  uploaded_at: string
  supplier_id?: string
  evaluation_id?: string
  non_conformity_id?: string
}

export type CustomField = {
  id: string
  name: string
  type: string
  options?: Record<string, any>
  required: boolean
  created_at: string
} 