import { supabase } from './client'
import { IngredientMaster } from '../../types/ingredient'

/**
 * 材料マスタ一覧を取得
 */
export async function fetchIngredients(): Promise<IngredientMaster[]> {
  const { data, error } = await supabase
    .from('ingredients_master')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch ingredients: ${error.message}`)
  }

  return (data || []) as IngredientMaster[]
}

/**
 * 材料を検索
 */
export async function searchIngredients(
  searchTerm: string
): Promise<IngredientMaster[]> {
  const { data, error } = await supabase
    .from('ingredients_master')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,name_kana.ilike.%${searchTerm}%`)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to search ingredients: ${error.message}`)
  }

  return (data || []) as IngredientMaster[]
}

/**
 * カテゴリーで材料を取得
 */
export async function fetchIngredientsByCategory(
  category: IngredientMaster['category']
): Promise<IngredientMaster[]> {
  const { data, error } = await supabase
    .from('ingredients_master')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch ingredients by category: ${error.message}`)
  }

  return (data || []) as IngredientMaster[]
}

/**
 * 材料詳細を取得
 */
export async function fetchIngredientById(
  ingredientId: string
): Promise<IngredientMaster | null> {
  const { data, error } = await supabase
    .from('ingredients_master')
    .select('*')
    .eq('id', ingredientId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch ingredient: ${error.message}`)
  }

  return data as IngredientMaster
}
