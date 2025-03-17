import { supabase, type NonConformity as SupabaseNonConformity } from '../lib/supabase'
import type { NonConformity } from '../types'

// Função para converter de Supabase para tipo da aplicação
function fromSupabase(supabaseNonConformity: SupabaseNonConformity): NonConformity {
  return {
    id: supabaseNonConformity.id,
    supplierId: supabaseNonConformity.supplier_id,
    type: supabaseNonConformity.type as NonConformity['type'],
    severity: supabaseNonConformity.severity as NonConformity['severity'],
    description: supabaseNonConformity.description,
    reportedDate: supabaseNonConformity.reported_date,
    status: supabaseNonConformity.status as NonConformity['status'],
    resolutionDeadline: supabaseNonConformity.resolution_deadline,
    resolutionDate: supabaseNonConformity.resolution_date,
    resolution: supabaseNonConformity.resolution,
    escalationReason: supabaseNonConformity.escalation_reason,
    impact: supabaseNonConformity.impact || '',
    attachments: [],
  };
}

// Função para converter para formato do Supabase
function toSupabase(nonConformity: Omit<NonConformity, 'id' | 'createdAt' | 'updatedAt'>): Omit<SupabaseNonConformity, 'id' | 'created_at' | 'updated_at'> {
  return {
    supplier_id: nonConformity.supplierId,
    type: nonConformity.type,
    severity: nonConformity.severity,
    description: nonConformity.description,
    reported_date: nonConformity.reportedDate,
    status: nonConformity.status,
    resolution_deadline: nonConformity.resolutionDeadline,
    resolution_date: nonConformity.resolutionDate,
    resolution: nonConformity.resolution,
    escalation_reason: nonConformity.escalationReason,
    impact: nonConformity.impact,
  };
}

export const nonConformityService = {
  // Buscar todas as não conformidades
  async getAllNonConformities() {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar não conformidades:', error)
      throw new Error('Não foi possível buscar as não conformidades')
    }

    return (data as SupabaseNonConformity[]).map(fromSupabase)
  },

  // Buscar não conformidade por ID
  async getNonConformityById(id: string) {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar não conformidade:', error)
      throw new Error('Não foi possível buscar a não conformidade')
    }

    return fromSupabase(data as SupabaseNonConformity)
  },

  // Criar nova não conformidade
  async createNonConformity(nonConformity: Omit<NonConformity, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const supabaseNonConformity = toSupabase(nonConformity)
      const { data, error } = await supabase
        .from('non_conformities')
        .insert([supabaseNonConformity])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar não conformidade:', error)
        throw new Error('Não foi possível criar a não conformidade')
      }

      return fromSupabase(data as SupabaseNonConformity)
    } catch (error) {
      console.error('Erro detalhado ao criar não conformidade:', error)
      throw error
    }
  },

  // Atualizar não conformidade
  async updateNonConformity(id: string, updates: Partial<NonConformity>) {
    const supabaseUpdates = toSupabase(updates as Omit<NonConformity, 'id' | 'createdAt' | 'updatedAt'>)
    const { data, error } = await supabase
      .from('non_conformities')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar não conformidade:', error)
      throw new Error('Não foi possível atualizar a não conformidade')
    }

    return fromSupabase(data as SupabaseNonConformity)
  },

  // Deletar não conformidade
  async deleteNonConformity(id: string) {
    const { error } = await supabase
      .from('non_conformities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar não conformidade:', error)
      throw new Error('Não foi possível deletar a não conformidade')
    }
  },

  // Buscar não conformidades por fornecedor
  async getNonConformitiesBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('non_conformities')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SupabaseNonConformity[]).map(fromSupabase)
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