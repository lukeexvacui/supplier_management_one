import { supabase, type Supplier } from '../lib/supabase'

export const supplierService = {
  // Buscar todos os fornecedores
  async getAllSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Supplier[]
  },

  // Buscar fornecedor por ID
  async getSupplierById(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Supplier
  },

  // Criar novo fornecedor
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplier])
      .select()
      .single()

    if (error) throw error
    return data as Supplier
  },

  // Atualizar fornecedor
  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Supplier
  },

  // Deletar fornecedor
  async deleteSupplier(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Buscar fornecedores por categoria
  async getSuppliersByCategory(category: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Supplier[]
  },

  // Buscar fornecedores por status
  async getSuppliersByStatus(status: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Supplier[]
  }
} 