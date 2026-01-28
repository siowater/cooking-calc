/**
 * 材料の型定義
 */
export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  y_position?: number // OCR時のY座標
  is_base?: boolean // ベーカーズパーセントの基準か
  is_locked?: boolean // 分量ロックフラグ
  is_checked?: boolean // 計量済みフラグ
}

/**
 * レシピの型定義
 */
export interface Recipe {
  id: string
  user_id: string | null
  title: string
  source_image_url: string | null
  source_image_path: string | null
  ingredients_json: Ingredient[]
  original_ingredients_json: Ingredient[] | null
  baking_percentages: Record<string, number> | null
  notes: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

/**
 * レシピ作成用の型（IDとタイムスタンプを除く）
 */
export type RecipeCreate = Omit<Recipe, 'id' | 'created_at' | 'updated_at'>

/**
 * レシピ更新用の型（部分更新可能）
 */
export type RecipeUpdate = Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>
