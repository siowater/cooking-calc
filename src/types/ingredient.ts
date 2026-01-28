/**
 * 材料マスタの型定義
 */
export interface IngredientMaster {
  id: string
  name: string
  name_kana: string | null
  category: 'flour' | 'liquid' | 'yeast' | 'salt' | 'other'
  specific_gravity: number | null
  is_bakers_base: boolean
  unit_default: string
  is_micro_ingredient: boolean
  substitute_suggestions: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

/**
 * 材料カテゴリーの型
 */
export type IngredientCategory = 'flour' | 'liquid' | 'yeast' | 'salt' | 'other'
