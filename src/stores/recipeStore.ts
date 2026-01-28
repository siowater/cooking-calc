import { create } from 'zustand'
import { Ingredient, Recipe } from '../types/recipe'
import {
  calculateScaling,
  ScalingState,
  ScalingResult,
  roundAmount,
  calculateBakersPercentages,
} from '../utils/calculations'

/**
 * レシピストアの状態
 */
interface RecipeStoreState {
  // 現在編集中のレシピ
  currentRecipe: Recipe | null
  
  // 材料リスト
  ingredients: Ingredient[]
  
  // 元の材料リスト（OCR結果）
  originalIngredients: Ingredient[]
  
  // スケーリング状態
  scalingState: ScalingState
  
  // 計算結果
  calculatedAmounts: Record<string, number>
  
  // ベーカーズパーセント
  bakingPercentages: Record<string, number>
  
  // 丸めモード
  roundingMode: 'integer' | 'decimal'
  decimalPlaces: number
  
  // アクション
  setIngredients: (ingredients: Ingredient[]) => void
  setOriginalIngredients: (ingredients: Ingredient[]) => void
  setCurrentRecipe: (recipe: Recipe | null) => void
  setBaseIngredient: (ingredientId: string | null) => void
  setScalingRatio: (ratio: number) => void
  toggleIngredientLock: (ingredientId: string) => void
  toggleIngredientCheck: (ingredientId: string) => void
  updateIngredient: (ingredientId: string, updates: Partial<Ingredient>) => void
  setRoundingMode: (mode: 'integer' | 'decimal', decimalPlaces?: number) => void
  calculateScaling: () => void
  resetScaling: () => void
}

/**
 * レシピストア
 */
export const useRecipeStore = create<RecipeStoreState>((set, get) => ({
  // 初期状態
  currentRecipe: null,
  ingredients: [],
  originalIngredients: [],
  scalingState: {
    baseIngredientId: null,
    ratio: 1.0,
    lockedIngredients: [],
  },
  calculatedAmounts: {},
  bakingPercentages: {},
  roundingMode: 'decimal',
  decimalPlaces: 1,
  
  // 材料リストを設定
  setIngredients: (ingredients) => {
    set({ ingredients })
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // 元の材料リストを設定
  setOriginalIngredients: (ingredients) => {
    set({ originalIngredients: ingredients })
  },
  
  // 現在のレシピを設定
  setCurrentRecipe: (recipe) => {
    set({ currentRecipe: recipe })
    if (recipe) {
      get().setIngredients(recipe.ingredients_json)
      get().setOriginalIngredients(recipe.original_ingredients_json || recipe.ingredients_json)
      if (recipe.baking_percentages) {
        set({ bakingPercentages: recipe.baking_percentages as Record<string, number> })
      }
    }
  },
  
  // 基準材料を設定
  setBaseIngredient: (ingredientId) => {
    set((state) => ({
      scalingState: {
        ...state.scalingState,
        baseIngredientId: ingredientId,
      },
    }))
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // スケーリング倍率を設定
  setScalingRatio: (ratio) => {
    // 倍率の範囲を制限（0.1倍 ～ 5.0倍）
    const clampedRatio = Math.max(0.1, Math.min(5.0, ratio))
    set((state) => ({
      scalingState: {
        ...state.scalingState,
        ratio: clampedRatio,
      },
    }))
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // 材料のロックを切り替え
  toggleIngredientLock: (ingredientId) => {
    set((state) => {
      const currentLocked = state.scalingState.lockedIngredients
      const newLockedIngredients = currentLocked.includes(ingredientId)
        ? currentLocked.filter(id => id !== ingredientId)
        : [...currentLocked, ingredientId]
      return {
        scalingState: {
          ...state.scalingState,
          lockedIngredients: newLockedIngredients,
        },
      }
    })
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // 材料のチェック状態を切り替え（計量済み）
  toggleIngredientCheck: (ingredientId) => {
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === ingredientId
          ? { ...ing, is_checked: !ing.is_checked }
          : ing
      ),
    }))
  },
  
  // 材料を更新
  updateIngredient: (ingredientId, updates) => {
    set((state) => ({
      ingredients: state.ingredients.map((ing) =>
        ing.id === ingredientId ? { ...ing, ...updates } : ing
      ),
    }))
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // 丸めモードを設定
  setRoundingMode: (mode, decimalPlaces = 1) => {
    set({
      roundingMode: mode,
      decimalPlaces: decimalPlaces || 1,
    })
    // 自動的にスケーリングを再計算
    get().calculateScaling()
  },
  
  // スケーリングを計算
  calculateScaling: () => {
    const state = get()
    const result = calculateScaling(state.ingredients, state.scalingState)
    
    // 丸め処理を適用
    const roundedAmounts: Record<string, number> = {}
    Object.entries(result.calculatedAmounts).forEach(([id, amount]) => {
      roundedAmounts[id] = roundAmount(
        amount,
        state.roundingMode,
        state.decimalPlaces
      )
    })
    
    // ベーカーズパーセントを計算
    const bakingPercentages = calculateBakersPercentages(state.ingredients)
    
    set({
      calculatedAmounts: roundedAmounts,
      bakingPercentages,
    })
  },
  
  // スケーリングをリセット
  resetScaling: () => {
    set({
      scalingState: {
        baseIngredientId: null,
        ratio: 1.0,
        lockedIngredients: [],
      },
      calculatedAmounts: {},
    })
    // 元の材料リストに戻す
    const state = get()
    if (state.originalIngredients.length > 0) {
      get().setIngredients(state.originalIngredients)
    }
  },
}))
