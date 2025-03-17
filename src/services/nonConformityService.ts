import { supabase, type NonConformity } from '../lib/supabase'

export const nonConformityService = {
  // Buscar todas as não conformidades
  async getAllNonConformities() {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as NonConformity[]
  },

  // Buscar não conformidades por fornecedor
  async getNonConformitiesBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as NonConformity[]
  },

  // Criar nova não conformidade
  async createNonConformity(nonConformity: Omit<NonConformity, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('non_conformities')
      .insert([nonConformity])
      .select()
      .single()

    if (error) throw error
    return data as NonConformity
  },

  // Atualizar não conformidade
  async updateNonConformity(id: string, updates: Partial<NonConformity>) {
    const { data, error } = await supabase
      .from('non_conformities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as NonConformity
  },

  // Deletar não conformidade
  async deleteNonConformity(id: string) {
    const { error } = await supabase
      .from('non_conformities')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Buscar não conformidades por status
  async getNonConformitiesByStatus(status: string) {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as NonConformity[]
  },

  // Buscar não conformidades por severidade
  async getNonConformitiesBySeverity(severity: string) {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .eq('severity', severity)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as NonConformity[]
  }
} 