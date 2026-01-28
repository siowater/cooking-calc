import { useRecipeStore } from '../recipeStore'
import { Ingredient } from '../../types/recipe'

describe('recipeStore', () => {
  // 各テスト前にストアをリセット
  beforeEach(() => {
    const store = useRecipeStore.getState()
    store.resetScaling()
    useRecipeStore.setState({
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
    })
  })

  const sampleIngredients: Ingredient[] = [
    { id: '1', name: '強力粉', amount: 250, unit: 'g', is_base: true, is_checked: false },
    { id: '2', name: '水', amount: 150, unit: 'ml', is_base: false, is_checked: false },
    { id: '3', name: '塩', amount: 5, unit: 'g', is_base: false, is_checked: false },
  ]

  describe('setIngredients', () => {
    it('材料リストを設定する', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)

      const state = useRecipeStore.getState()
      expect(state.ingredients).toEqual(sampleIngredients)
    })

    it('設定時に自動的にスケーリングが計算される', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)

      const state = useRecipeStore.getState()
      // 倍率1.0なので元の値と同じ
      expect(state.calculatedAmounts['1']).toBe(250)
      expect(state.calculatedAmounts['2']).toBe(150)
    })
  })

  describe('setScalingRatio', () => {
    it('スケーリング倍率を設定する', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      store.setBaseIngredient('1')
      store.setScalingRatio(2.0)

      const state = useRecipeStore.getState()
      expect(state.scalingState.ratio).toBe(2.0)
      expect(state.calculatedAmounts['1']).toBe(500)
      expect(state.calculatedAmounts['2']).toBe(300)
    })

    it('倍率は0.1〜5.0の範囲に制限される', () => {
      const store = useRecipeStore.getState()
      
      store.setScalingRatio(0.01) // 最小値以下
      expect(useRecipeStore.getState().scalingState.ratio).toBe(0.1)
      
      store.setScalingRatio(10.0) // 最大値以上
      expect(useRecipeStore.getState().scalingState.ratio).toBe(5.0)
    })
  })

  describe('setBaseIngredient', () => {
    it('基準材料を設定する', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      store.setBaseIngredient('1')

      const state = useRecipeStore.getState()
      expect(state.scalingState.baseIngredientId).toBe('1')
    })
  })

  describe('toggleIngredientLock', () => {
    it('材料のロック状態を切り替える', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      
      // ロック
      store.toggleIngredientLock('2')
      expect(useRecipeStore.getState().scalingState.lockedIngredients).toContain('2')
      
      // アンロック
      store.toggleIngredientLock('2')
      expect(useRecipeStore.getState().scalingState.lockedIngredients).not.toContain('2')
    })
  })

  describe('toggleIngredientCheck', () => {
    it('材料のチェック状態を切り替える', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      
      // チェック
      store.toggleIngredientCheck('1')
      const checkedState = useRecipeStore.getState()
      const ingredient = checkedState.ingredients.find(i => i.id === '1')
      expect(ingredient?.is_checked).toBe(true)
      
      // アンチェック
      store.toggleIngredientCheck('1')
      const uncheckedState = useRecipeStore.getState()
      const ingredient2 = uncheckedState.ingredients.find(i => i.id === '1')
      expect(ingredient2?.is_checked).toBe(false)
    })
  })

  describe('updateIngredient', () => {
    it('材料を更新する', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      
      store.updateIngredient('1', { amount: 300 })
      
      const state = useRecipeStore.getState()
      const ingredient = state.ingredients.find(i => i.id === '1')
      expect(ingredient?.amount).toBe(300)
    })
  })

  describe('setRoundingMode', () => {
    it('丸めモードを設定する', () => {
      const store = useRecipeStore.getState()
      
      store.setRoundingMode('integer')
      expect(useRecipeStore.getState().roundingMode).toBe('integer')
      
      store.setRoundingMode('decimal', 2)
      expect(useRecipeStore.getState().roundingMode).toBe('decimal')
      expect(useRecipeStore.getState().decimalPlaces).toBe(2)
    })

    it('丸めモードに応じて計算結果が変わる', () => {
      const store = useRecipeStore.getState()
      const ingredientsWithDecimal: Ingredient[] = [
        { id: '1', name: '強力粉', amount: 100, unit: 'g', is_base: true, is_checked: false },
        { id: '2', name: '水', amount: 65, unit: 'ml', is_base: false, is_checked: false },
      ]
      
      store.setIngredients(ingredientsWithDecimal)
      store.setBaseIngredient('1')
      store.setScalingRatio(1.5) // 1.5倍
      
      // 小数モード
      store.setRoundingMode('decimal', 1)
      expect(useRecipeStore.getState().calculatedAmounts['2']).toBe(97.5) // 65 * 1.5
      
      // 整数モード
      store.setRoundingMode('integer')
      expect(useRecipeStore.getState().calculatedAmounts['2']).toBe(98) // 四捨五入
    })
  })

  describe('resetScaling', () => {
    it('スケーリングをリセットする', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      store.setOriginalIngredients(sampleIngredients)
      store.setBaseIngredient('1')
      store.setScalingRatio(2.0)
      
      store.resetScaling()
      
      const state = useRecipeStore.getState()
      expect(state.scalingState.baseIngredientId).toBeNull()
      expect(state.scalingState.ratio).toBe(1.0)
      expect(state.scalingState.lockedIngredients).toEqual([])
    })
  })

  describe('calculateScaling with bakersPercentages', () => {
    it('ベーカーズパーセントが計算される', () => {
      const store = useRecipeStore.getState()
      store.setIngredients(sampleIngredients)
      
      const state = useRecipeStore.getState()
      // 強力粉（ベース）は100%
      expect(state.bakingPercentages['1']).toBe(100)
      // 水は150/250 * 100 = 60%
      expect(state.bakingPercentages['2']).toBe(60)
    })
  })
})
