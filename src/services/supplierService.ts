import { supabase, type Supplier as SupabaseSupplier } from '../lib/supabase'
import type { Supplier } from '../types'

// Função para converter de Supabase para tipo da aplicação
function fromSupabase(supabaseSupplier: SupabaseSupplier): Supplier {
  return {
    id: supabaseSupplier.id,
    name: supabaseSupplier.name,
    legalName: supabaseSupplier.legal_name,
    documentNumber: supabaseSupplier.document_number,
    category: supabaseSupplier.category,
    email: supabaseSupplier.email,
    phone: supabaseSupplier.phone,
    whatsapp: supabaseSupplier.whatsapp,
    address: supabaseSupplier.address,
    locationUrl: supabaseSupplier.location_url,
    averageRating: supabaseSupplier.average_rating,
    lastEvaluation: supabaseSupplier.last_evaluation || '',
    status: supabaseSupplier.status as Supplier['status'],
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
    customFields: supabaseSupplier.custom_fields || {},
    documents: [],
    createdAt: supabaseSupplier.created_at,
    updatedAt: supabaseSupplier.updated_at,
  };
}

// Função para converter para formato do Supabase
function toSupabase(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Omit<SupabaseSupplier, 'id' | 'created_at' | 'updated_at'> {
  const supabaseSupplier: Omit<SupabaseSupplier, 'id' | 'created_at' | 'updated_at'> = {
    name: supplier.name,
    legal_name: supplier.legalName,
    document_number: supplier.documentNumber,
    category: supplier.category,
    email: supplier.email,
    phone: supplier.phone,
    average_rating: supplier.averageRating,
    status: supplier.status,
  };

  // Adiciona campos opcionais apenas se existirem
  if (supplier.whatsapp) supabaseSupplier.whatsapp = supplier.whatsapp;
  if (supplier.address) supabaseSupplier.address = supplier.address;
  if (supplier.locationUrl) supabaseSupplier.location_url = supplier.locationUrl;
  if (supplier.lastEvaluation) supabaseSupplier.last_evaluation = supplier.lastEvaluation;
  if (supplier.customFields && Object.keys(supplier.customFields).length > 0) {
    supabaseSupplier.custom_fields = supplier.customFields;
  }

  return supabaseSupplier;
}

export const supplierService = {
  // Buscar todos os fornecedores
  async getAllSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar fornecedores:', error)
      throw new Error('Não foi possível buscar os fornecedores')
    }

    return (data as SupabaseSupplier[]).map(fromSupabase)
  },

  // Buscar fornecedor por ID
  async getSupplierById(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar fornecedor:', error)
      throw new Error('Não foi possível buscar o fornecedor')
    }

    return fromSupabase(data as SupabaseSupplier)
  },

  // Criar novo fornecedor
  async createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const supabaseSupplier = toSupabase(supplier)
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supabaseSupplier])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar fornecedor:', error)
        throw new Error('Não foi possível criar o fornecedor')
      }

      return fromSupabase(data as SupabaseSupplier)
    } catch (error) {
      console.error('Erro detalhado ao criar fornecedor:', error)
      throw error
    }
  },

  // Atualizar fornecedor
  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const supabaseUpdates = toSupabase(updates as Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>)
    const { data, error } = await supabase
      .from('suppliers')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error)
      throw new Error('Não foi possível atualizar o fornecedor')
    }

    return fromSupabase(data as SupabaseSupplier)
  },

  // Deletar fornecedor
  async deleteSupplier(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar fornecedor:', error)
      throw new Error('Não foi possível deletar o fornecedor')
    }
  },

  // Buscar fornecedores por categoria
  async getSuppliersByCategory(category: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SupabaseSupplier[]).map(fromSupabase)
  },

  // Buscar fornecedores por status
  async getSuppliersByStatus(status: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SupabaseSupplier[]).map(fromSupabase)
  }
} 