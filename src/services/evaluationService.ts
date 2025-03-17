import { supabase, type Evaluation } from '../lib/supabase'

export const evaluationService = {
  // Buscar todas as avaliações
  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Evaluation[]
  },

  // Buscar avaliações por fornecedor
  async getEvaluationsBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Evaluation[]
  },

  // Criar nova avaliação
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([evaluation])
      .select()
      .single()

    if (error) throw error
    return data as Evaluation
  },

  // Atualizar avaliação
  async updateEvaluation(id: string, updates: Partial<Evaluation>) {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Evaluation
  },

  // Deletar avaliação
  async deleteEvaluation(id: string) {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Buscar avaliações por tipo
  async getEvaluationsByType(type: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Evaluation[]
  }
} 