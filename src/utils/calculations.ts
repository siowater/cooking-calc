import { Ingredient } from '../types/recipe'

/**
 * スケーリング計算の状態
 */
export interface ScalingState {
  baseIngredientId: string | null
  ratio: number // 倍率（1.0 = 100%）
  lockedIngredients: string[] // ロックされた材料IDの配列（Setの代わりに配列を使用）
}

/**
 * スケーリング計算結果
 */
export interface ScalingResult {
  calculatedAmounts: Record<string, number>
  baseAmount: number
  targetAmount: number
}

/**
 * 基本スケーリング計算
 * Target = Original × Ratio
 */
export function calculateScaling(
  ingredients: Ingredient[],
  state: ScalingState
): ScalingResult {
  const calculatedAmounts: Record<string, number> = {}
  
  // 基準材料の元の分量を取得
  const baseIngredient = ingredients.find(
    ing => ing.id === state.baseIngredientId
  )
  
  if (!baseIngredient) {
    // 基準材料が選択されていない場合は、元の値をそのまま返す
    ingredients.forEach(ing => {
      calculatedAmounts[ing.id] = ing.amount
    })
    return {
      calculatedAmounts,
      baseAmount: 0,
      targetAmount: 0,
    }
  }
  
  const baseOriginalAmount = baseIngredient.amount
  const baseTargetAmount = baseOriginalAmount * state.ratio
  
  // ロックされた材料がある場合の逆算
  const lockedIngredients = ingredients.filter(
    ing => state.lockedIngredients.includes(ing.id)
  )
  
  if (lockedIngredients.length > 0 && !state.lockedIngredients.includes(state.baseIngredientId!)) {
    // ロックされた材料の目標量から逆算
    const lockedIngredient = lockedIngredients[0]
    const lockedTargetAmount = lockedIngredient.amount
    const reverseRatio = lockedTargetAmount / lockedIngredient.amount
    
    // 全材料に逆算比率を適用
    ingredients.forEach(ing => {
      if (state.lockedIngredients.includes(ing.id)) {
        calculatedAmounts[ing.id] = ing.amount // ロックされた材料は変更しない
      } else {
        calculatedAmounts[ing.id] = ing.amount * reverseRatio
      }
    })
    
    return {
      calculatedAmounts,
      baseAmount: baseOriginalAmount,
      targetAmount: baseOriginalAmount * reverseRatio,
    }
  } else {
    // 通常の倍率計算
    ingredients.forEach(ing => {
      if (state.lockedIngredients.includes(ing.id)) {
        calculatedAmounts[ing.id] = ing.amount // ロックされた材料は変更しない
      } else {
        calculatedAmounts[ing.id] = ing.amount * state.ratio
      }
    })
    
    return {
      calculatedAmounts,
      baseAmount: baseOriginalAmount,
      targetAmount: baseTargetAmount,
    }
  }
}

/**
 * 丸め処理
 */
export function roundAmount(
  amount: number,
  mode: 'integer' | 'decimal',
  decimalPlaces: number = 1
): number {
  if (mode === 'integer') {
    return Math.round(amount)
  } else {
    const multiplier = Math.pow(10, decimalPlaces)
    return Math.round(amount * multiplier) / multiplier
  }
}

/**
 * ベーカーズパーセントを計算
 * Baker's % = (材料の重量 / 粉の総重量) × 100
 */
export function calculateBakersPercentages(
  ingredients: Ingredient[]
): Record<string, number> {
  // 粉類の総重量を計算（is_base = trueの材料）
  const flourTotal = ingredients
    .filter(ing => ing.is_base)
    .reduce((sum, ing) => {
      // 単位をグラムに統一（簡易版、実際は単位変換が必要）
      const amountInGrams = convertToGrams(ing.amount, ing.unit)
      return sum + amountInGrams
    }, 0)
  
  if (flourTotal === 0) {
    return {}
  }
  
  // 各材料のパーセンテージを計算
  const percentages: Record<string, number> = {}
  
  ingredients.forEach(ing => {
    const amountInGrams = convertToGrams(ing.amount, ing.unit)
    const percentage = (amountInGrams / flourTotal) * 100
    percentages[ing.id] = roundAmount(percentage, 'decimal', 2)
  })
  
  return percentages
}

/**
 * 単位をグラムに変換（簡易版）
 * 実際の実装では、材料マスタの比重を使用する必要がある
 */
function convertToGrams(amount: number, unit: string): number {
  const unitMap: Record<string, number> = {
    'g': 1,
    'kg': 1000,
    'ml': 1, // 水の場合、1ml = 1g（簡易版）
    'l': 1000,
    'cc': 1,
    '個': 50, // 卵1個 = 50g（簡易版）
    'つ': 50,
    'tsp': 5, // 小さじ1 = 5g（簡易版）
    'tbsp': 15, // 大さじ1 = 15g（簡易版）
  }
  
  const multiplier = unitMap[unit.toLowerCase()] || 1
  return amount * multiplier
}

/**
 * 単位変換（重量 → 体積、またはその逆）
 * 実際の実装では、材料マスタの比重を使用する必要がある
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  specificGravity?: number
): number {
  // 同じ単位の場合は変換不要
  if (fromUnit === toUnit) {
    return amount
  }
  
  // 重量 → 体積（比重を使用）
  if (isWeightUnit(fromUnit) && isVolumeUnit(toUnit)) {
    if (specificGravity) {
      return amount / specificGravity
    }
    // デフォルト比重（水: 1.0）
    return amount / 1.0
  }
  
  // 体積 → 重量（比重を使用）
  if (isVolumeUnit(fromUnit) && isWeightUnit(toUnit)) {
    if (specificGravity) {
      return amount * specificGravity
    }
    return amount * 1.0
  }
  
  // その他の変換は未対応
  return amount
}

/**
 * 重量単位かどうかを判定
 */
function isWeightUnit(unit: string): boolean {
  return ['g', 'kg'].includes(unit.toLowerCase())
}

/**
 * 体積単位かどうかを判定
 */
function isVolumeUnit(unit: string): boolean {
  return ['ml', 'l', 'cc'].includes(unit.toLowerCase())
}
