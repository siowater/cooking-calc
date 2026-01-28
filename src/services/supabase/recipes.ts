import { supabase } from './client'
import { Recipe, RecipeCreate, RecipeUpdate } from '../../types/recipe'

/**
 * レシピ一覧を取得
 */
export async function fetchRecipes(userId: string | null = null) {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.is('user_id', null)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`)
  }

  return (data || []) as Recipe[]
}

/**
 * レシピ詳細を取得
 */
export async function fetchRecipeById(recipeId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // レシピが見つからない場合
      return null
    }
    throw new Error(`Failed to fetch recipe: ${error.message}`)
  }

  return data as Recipe
}

/**
 * レシピを作成
 */
export async function createRecipe(
  recipe: RecipeCreate
): Promise<Recipe> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipe,
      user_id: user?.id || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create recipe: ${error.message}`)
  }

  return data as Recipe
}

/**
 * レシピを更新
 */
export async function updateRecipe(
  recipeId: string,
  updates: RecipeUpdate
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', recipeId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update recipe: ${error.message}`)
  }

  return data as Recipe
}

/**
 * レシピを削除
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId)

  if (error) {
    throw new Error(`Failed to delete recipe: ${error.message}`)
  }
}

/**
 * レシピのお気に入りを切り替え
 */
export async function toggleRecipeFavorite(
  recipeId: string,
  isFavorite: boolean
): Promise<Recipe> {
  return updateRecipe(recipeId, { is_favorite: isFavorite })
}
