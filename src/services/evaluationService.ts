import { supabase, type Evaluation as SupabaseEvaluation } from '../lib/supabase'
import type { Evaluation } from '../types'

// Função para converter de Supabase para tipo da aplicação
function fromSupabase(supabaseEvaluation: SupabaseEvaluation): Evaluation {
  return {
    id: supabaseEvaluation.id,
    supplierId: supabaseEvaluation.supplier_id,
    evaluator: supabaseEvaluation.evaluator,
    date: supabaseEvaluation.date,
    ratings: supabaseEvaluation.ratings,
    comments: supabaseEvaluation.comments || '',
    attachments: [],
    type: supabaseEvaluation.type as Evaluation['type'],
    purchaseOrderNumber: '',
  };
}

// Função para converter para formato do Supabase
function toSupabase(evaluation: Omit<Evaluation, 'id' | 'createdAt'>): Omit<SupabaseEvaluation, 'id' | 'created_at'> {
  return {
    supplier_id: evaluation.supplierId,
    evaluator: evaluation.evaluator,
    date: evaluation.date,
    ratings: evaluation.ratings,
    comments: evaluation.comments,
    type: evaluation.type,
  };
}

export const evaluationService = {
  // Buscar todas as avaliações
  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar avaliações:', error)
      throw new Error('Não foi possível buscar as avaliações')
    }

    return (data as SupabaseEvaluation[]).map(fromSupabase)
  },

  // Buscar avaliação por ID
  async getEvaluationById(id: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar avaliação:', error)
      throw new Error('Não foi possível buscar a avaliação')
    }

    return fromSupabase(data as SupabaseEvaluation)
  },

  // Criar nova avaliação
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>) {
    try {
      const supabaseEvaluation = toSupabase(evaluation)
      const { data, error } = await supabase
        .from('evaluations')
        .insert([supabaseEvaluation])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar avaliação:', error)
        throw new Error('Não foi possível criar a avaliação')
      }

      return fromSupabase(data as SupabaseEvaluation)
    } catch (error) {
      console.error('Erro detalhado ao criar avaliação:', error)
      throw error
    }
  },

  // Atualizar avaliação
  async updateEvaluation(id: string, updates: Partial<Evaluation>) {
    const supabaseUpdates = toSupabase(updates as Omit<Evaluation, 'id' | 'createdAt'>)
    const { data, error } = await supabase
      .from('evaluations')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar avaliação:', error)
      throw new Error('Não foi possível atualizar a avaliação')
    }

    return fromSupabase(data as SupabaseEvaluation)
  },

  // Deletar avaliação
  async deleteEvaluation(id: string) {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar avaliação:', error)
      throw new Error('Não foi possível deletar a avaliação')
    }
  },

  // Buscar avaliações por fornecedor
  async getEvaluationsBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SupabaseEvaluation[]).map(fromSupabase)
  },

  // Buscar avaliações por tipo
  async getEvaluationsByType(type: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as SupabaseEvaluation[]
  }
} 