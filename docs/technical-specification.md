# 技術仕様書：Baker's Lens

## 1. OCR処理仕様

### 1.1 Vision Camera設定

```typescript
const cameraConfig = {
  device: cameraDevice, // バックカメラ推奨
  isActive: true,
  fps: 30, // OCR処理用のフレームレート
  pixelFormat: 'yuv', // パフォーマンス最適化
  orientation: 'portrait',
}
```

### 1.2 Frame Processor実装

```typescript
const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  
  // ML Kit OCR実行
  const result = scanOCR(frame)
  
  // メインスレッドに結果を送信
  runOnJS(handleOCRResult)(result)
}, [])
```

### 1.3 テキスト抽出ロジック

#### 1.3.1 材料名の認識

**パターン**:
- 日本語材料名（例: "強力粉", "水", "塩"）
- カタカナ材料名（例: "バター", "イースト"）
- 英語材料名（例: "flour", "water"）

**マッチング戦略**:
1. 材料マスタ（`ingredients_master`）との部分一致検索
2. レーベンシュタイン距離による類似度マッチング
3. カタカナ・ひらがなの正規化

#### 1.3.2 数値の認識

**パターン**:
- 整数（例: "250", "1"）
- 小数（例: "1.5", "0.5"）
- 分数（例: "1/2", "3/4"）→ 小数に変換

**抽出ロジック**:
```typescript
function extractAmount(text: string): number | null {
  // 数値パターンのマッチング
  const integerMatch = text.match(/\d+/)
  const decimalMatch = text.match(/\d+\.\d+/)
  const fractionMatch = text.match(/(\d+)\/(\d+)/)
  
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1])
    const denominator = parseInt(fractionMatch[2])
    return numerator / denominator
  }
  
  if (decimalMatch) {
    return parseFloat(decimalMatch[0])
  }
  
  if (integerMatch) {
    return parseInt(integerMatch[0])
  }
  
  return null
}
```

#### 1.3.3 単位の認識

**対応単位**:
- 重量: "g"（グラム）, "kg"（キログラム）
- 体積: "ml"（ミリリットル）, "l"（リットル）, "cc"（シーシー）
- 個数: "個", "つ"
- 小さじ・大さじ: "tsp"（小さじ）, "tbsp"（大さじ）

**抽出ロジック**:
```typescript
function extractUnit(text: string): string {
  const unitPatterns = [
    { pattern: /(g|グラム|グラム)/i, unit: 'g' },
    { pattern: /(ml|ミリリットル|cc)/i, unit: 'ml' },
    { pattern: /(個|つ)/, unit: '個' },
    { pattern: /(小さじ|tsp)/i, unit: 'tsp' },
    { pattern: /(大さじ|tbsp)/i, unit: 'tbsp' },
  ]
  
  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(text)) {
      return unit
    }
  }
  
  return 'g' // デフォルト
}
```

### 1.4 Y座標による行の紐付け（名寄せ）

**問題**: OCRでは材料名と数値が別々のテキストブロックとして認識される可能性がある

**解決策**: Y座標（縦位置）の近似値に基づいてペアリング

```typescript
interface OCRTextBlock {
  text: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

function pairIngredientsAndAmounts(
  textBlocks: OCRTextBlock[]
): Ingredient[] {
  const ingredients: Ingredient[] = []
  const tolerance = 20 // Y座標の許容誤差（ピクセル）
  
  // 材料名候補と数値候補を分類
  const nameBlocks = textBlocks.filter(isIngredientName)
  const amountBlocks = textBlocks.filter(isAmount)
  
  // Y座標でソート
  nameBlocks.sort((a, b) => a.boundingBox.y - b.boundingBox.y)
  amountBlocks.sort((a, b) => a.boundingBox.y - b.boundingBox.y)
  
  // 最も近いY座標のペアを見つける
  for (const nameBlock of nameBlocks) {
    const closestAmount = amountBlocks.find(amountBlock => {
      const yDiff = Math.abs(
        nameBlock.boundingBox.y - amountBlock.boundingBox.y
      )
      return yDiff <= tolerance
    })
    
    if (closestAmount) {
      ingredients.push({
        name: extractIngredientName(nameBlock.text),
        amount: extractAmount(closestAmount.text),
        unit: extractUnit(closestAmount.text),
        y_position: nameBlock.boundingBox.y,
      })
    }
  }
  
  return ingredients
}
```

### 1.5 時間の認識

**パターン**:
- "発酵 60分"
- "一次発酵 90分"
- "焼成 30分"

**抽出ロジック**:
```typescript
function extractTime(text: string): { step: string; minutes: number } | null {
  const timePattern = /(.+?)\s*(\d+)\s*分/
  const match = text.match(timePattern)
  
  if (match) {
    return {
      step: match[1].trim(),
      minutes: parseInt(match[2]),
    }
  }
  
  return null
}
```

## 2. ARオーバーレイ描画仕様

### 2.1 Skia設定

```typescript
import { Canvas, Text, Group } from '@shopify/react-native-skia'

const AROverlay = ({ frame, ingredients, calculatedAmounts }) => {
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      {ingredients.map((ingredient, index) => {
        const calculatedAmount = calculatedAmounts[ingredient.id]
        const position = getTextPosition(frame, ingredient.y_position)
        
        return (
          <Group key={ingredient.id}>
            <Text
              x={position.x}
              y={position.y}
              text={`${calculatedAmount}${ingredient.unit}`}
              color={ingredient.is_checked ? '#9E9E9E' : '#212121'}
              size={16}
            />
          </Group>
        )
      })}
    </Canvas>
  )
}
```

### 2.2 座標変換

カメラフレームの座標系から画面座標系への変換

```typescript
function getTextPosition(
  frame: Frame,
  originalY: number
): { x: number; y: number } {
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const frameWidth = frame.width
  const frameHeight = frame.height
  
  // Y座標のスケーリング
  const scaleY = screenHeight / frameHeight
  const y = originalY * scaleY
  
  // X座標は中央揃え（材料名の右側に表示）
  const x = screenWidth * 0.7
  
  return { x, y }
}
```

### 2.3 60FPS描画の最適化

**最適化戦略**:
1. 変更された材料のみ再描画
2. テキストの事前レンダリング
3. 不要な再計算の回避

```typescript
const memoizedOverlay = useMemo(() => {
  return ingredients.map(ingredient => {
    const calculatedAmount = calculatedAmounts[ingredient.id]
    // 計算済みの位置情報をキャッシュ
    return {
      ...ingredient,
      calculatedAmount,
      position: getTextPosition(frame, ingredient.y_position),
    }
  })
}, [ingredients, calculatedAmounts, frame])
```

## 3. スケーリング計算仕様

### 3.1 基本計算式

```
Target = Original × Ratio

where:
  Target: 計算後の分量
  Original: 元の分量
  Ratio: 倍率（スライダーの値）
```

### 3.2 実装

```typescript
interface ScalingState {
  baseIngredientId: string | null
  ratio: number // 1.0 = 100%
  lockedIngredients: Set<string> // ロックされた材料IDのセット
}

function calculateScaling(
  ingredients: Ingredient[],
  state: ScalingState
): Record<string, number> {
  const results: Record<string, number> = {}
  
  // 基準材料の元の分量を取得
  const baseIngredient = ingredients.find(
    ing => ing.id === state.baseIngredientId
  )
  
  if (!baseIngredient) {
    return results
  }
  
  const baseOriginalAmount = baseIngredient.amount
  const baseTargetAmount = baseOriginalAmount * state.ratio
  
  // ロックされた材料がある場合の逆算
  const lockedIngredients = ingredients.filter(
    ing => state.lockedIngredients.has(ing.id)
  )
  
  if (lockedIngredients.length > 0) {
    // ロックされた材料の目標量から逆算
    const lockedTargetAmount = lockedIngredients[0].amount
    const reverseRatio = lockedTargetAmount / lockedIngredients[0].amount
    
    // 全材料に逆算比率を適用
    ingredients.forEach(ing => {
      if (state.lockedIngredients.has(ing.id)) {
        results[ing.id] = ing.amount // ロックされた材料は変更しない
      } else {
        results[ing.id] = ing.amount * reverseRatio
      }
    })
  } else {
    // 通常の倍率計算
    ingredients.forEach(ing => {
      results[ing.id] = ing.amount * state.ratio
    })
  }
  
  return results
}
```

### 3.3 丸め処理

```typescript
function roundAmount(
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
```

### 3.4 単位変換

```typescript
function convertUnit(
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
```

## 4. ベーカーズパーセント計算

### 4.1 計算式

```
Baker's % = (材料の重量 / 粉の総重量) × 100

where:
  粉の総重量: is_bakers_base = true の材料の合計
```

### 4.2 実装

```typescript
function calculateBakersPercentages(
  ingredients: Ingredient[]
): Record<string, number> {
  // 粉類の総重量を計算
  const flourTotal = ingredients
    .filter(ing => ing.is_base)
    .reduce((sum, ing) => {
      // 単位をグラムに統一
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
```

## 5. パフォーマンス最適化

### 5.1 Frame Processor最適化

**問題**: Frame Processor内での重い処理はメインスレッドをブロックする

**解決策**:
1. OCR処理を非同期化
2. フレームのスキップ（例: 2フレームに1回のみ処理）
3. 結果のデバウンス

```typescript
let lastProcessedFrame = 0
const FRAME_SKIP = 2 // 2フレームに1回のみ処理

const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  
  // フレームスキップ
  if (frame.timestamp - lastProcessedFrame < FRAME_SKIP * (1000 / 30)) {
    return
  }
  
  lastProcessedFrame = frame.timestamp
  
  // 軽量な処理のみ実行
  const result = scanOCR(frame)
  runOnJS(handleOCRResult)(result)
}, [])
```

### 5.2 状態管理の最適化

**Zustand Storeの最適化**:
```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface RecipeStore {
  ingredients: Ingredient[]
  calculatedAmounts: Record<string, number>
  setIngredients: (ingredients: Ingredient[]) => void
  calculateScaling: (ratio: number) => void
}

export const useRecipeStore = create<RecipeStore>()(
  subscribeWithSelector((set, get) => ({
    ingredients: [],
    calculatedAmounts: {},
    
    setIngredients: (ingredients) => {
      set({ ingredients })
      // 自動的にスケーリングを再計算
      const { ratio } = get()
      get().calculateScaling(ratio)
    },
    
    calculateScaling: (ratio) => {
      const { ingredients } = get()
      const calculatedAmounts = calculateScaling(ingredients, { ratio })
      set({ calculatedAmounts })
    },
  }))
)
```

### 5.3 メモリ管理

**画像のメモリリーク防止**:
```typescript
useEffect(() => {
  return () => {
    // コンポーネントのアンマウント時に画像を解放
    if (cameraRef.current) {
      cameraRef.current.release()
    }
  }
}, [])
```

## 6. エラーハンドリング

### 6.1 OCRエラー

```typescript
try {
  const result = await performOCR(frame)
  return result
} catch (error) {
  if (error.code === 'OCR_TIMEOUT') {
    // タイムアウト時の処理
    return { error: 'OCR処理がタイムアウトしました' }
  } else if (error.code === 'OCR_NO_TEXT') {
    // テキストが認識されない場合
    return { error: 'テキストを認識できませんでした' }
  } else {
    // その他のエラー
    return { error: 'OCR処理中にエラーが発生しました' }
  }
}
```

### 6.2 計算エラー

```typescript
function safeCalculateScaling(
  ingredients: Ingredient[],
  ratio: number
): Record<string, number> {
  try {
    // 入力値の検証
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error('材料リストが空です')
    }
    
    if (ratio <= 0 || ratio > 10) {
      throw new Error('倍率は0より大きく10以下である必要があります')
    }
    
    return calculateScaling(ingredients, { ratio })
  } catch (error) {
    console.error('Scaling calculation error:', error)
    return {}
  }
}
```

## 7. テスト仕様

### 7.1 ユニットテスト

**計算ロジックのテスト**:
```typescript
describe('calculateScaling', () => {
  it('should scale all ingredients by ratio', () => {
    const ingredients = [
      { id: '1', name: '強力粉', amount: 250, unit: 'g' },
      { id: '2', name: '水', amount: 150, unit: 'ml' },
    ]
    
    const result = calculateScaling(ingredients, { ratio: 2.0 })
    
    expect(result['1']).toBe(500)
    expect(result['2']).toBe(300)
  })
  
  it('should handle locked ingredients', () => {
    // ロック機能のテスト
  })
})
```

### 7.2 統合テスト

**OCR → 計算 → 表示のフロー**:
```typescript
describe('OCR to Display Flow', () => {
  it('should process OCR result and display calculated amounts', async () => {
    // OCR結果のモック
    const ocrResult = {
      ingredients: [
        { name: '強力粉', amount: 250, unit: 'g', y_position: 100 },
      ],
    }
    
    // 状態を更新
    useRecipeStore.getState().setIngredients(ocrResult.ingredients)
    
    // スケーリングを実行
    useRecipeStore.getState().calculateScaling(2.0)
    
    // 結果を確認
    const calculatedAmounts = useRecipeStore.getState().calculatedAmounts
    expect(calculatedAmounts['1']).toBe(500)
  })
})
```
