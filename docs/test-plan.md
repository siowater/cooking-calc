# テスト計画書：Baker's Lens

## 1. テスト概要

### 1.1 テスト目的

Baker's Lensアプリの品質を保証し、以下の観点でテストを実施：

- **機能性**: 要件定義書に記載された機能が正しく動作するか
- **パフォーマンス**: 60FPS描画、リアルタイムOCR処理が要件を満たすか
- **ユーザビリティ**: 直感的な操作が可能か
- **信頼性**: エラー処理が適切か、クラッシュしないか

### 1.2 テスト範囲

**対象**:
- OCR処理（材料名・数値・単位の認識）
- スケーリング計算ロジック
- ARオーバーレイ描画
- レシピの保存・読み込み
- UI/UX操作

**対象外**:
- サードパーティライブラリの内部実装
- Supabaseのバックエンド機能（既存テストに依存）

## 2. テスト戦略

### 2.1 テストピラミッド

```
        ┌─────────┐
       ╱  E2E     ╱  ← 少数（主要フローのみ）
      ╱─────────╱
     ╱ Integration ╱  ← 中程度（コンポーネント間の連携）
    ╱─────────────╱
   ╱   Unit Test   ╱  ← 多数（計算ロジック、ユーティリティ）
  ╱───────────────╱
```

### 2.2 テストレベル

1. **ユニットテスト**: 計算ロジック、ユーティリティ関数
2. **統合テスト**: OCR → 計算 → 表示のフロー
3. **E2Eテスト**: 主要ユーザーフロー
4. **実機テスト**: パフォーマンス、カメラ機能

## 3. ユニットテスト

### 3.1 計算ロジックのテスト

#### 3.1.1 スケーリング計算

**テストケース**:

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
  
  it('should handle ratio less than 1', () => {
    const ingredients = [
      { id: '1', name: '強力粉', amount: 250, unit: 'g' },
    ]
    
    const result = calculateScaling(ingredients, { ratio: 0.5 })
    
    expect(result['1']).toBe(125)
  })
  
  it('should handle locked ingredients', () => {
    const ingredients = [
      { id: '1', name: '強力粉', amount: 250, unit: 'g' },
      { id: '2', name: '卵', amount: 1, unit: '個' },
    ]
    
    const result = calculateScaling(ingredients, {
      ratio: 2.0,
      lockedIngredients: new Set(['2']),
    })
    
    expect(result['1']).toBe(500) // スケーリングされる
    expect(result['2']).toBe(1)   // ロックされている
  })
})
```

#### 3.1.2 丸め処理

```typescript
describe('roundAmount', () => {
  it('should round to integer', () => {
    expect(roundAmount(123.7, 'integer')).toBe(124)
    expect(roundAmount(123.3, 'integer')).toBe(123)
  })
  
  it('should round to decimal places', () => {
    expect(roundAmount(123.456, 'decimal', 1)).toBe(123.5)
    expect(roundAmount(123.456, 'decimal', 2)).toBe(123.46)
  })
})
```

#### 3.1.3 ベーカーズパーセント計算

```typescript
describe('calculateBakersPercentages', () => {
  it('should calculate percentages correctly', () => {
    const ingredients = [
      { id: '1', name: '強力粉', amount: 250, unit: 'g', is_base: true },
      { id: '2', name: '水', amount: 150, unit: 'ml', is_base: false },
    ]
    
    const result = calculateBakersPercentages(ingredients)
    
    expect(result['1']).toBe(100) // 基準は100%
    expect(result['2']).toBe(60)  // 150/250 * 100
  })
})
```

### 3.2 OCR処理のテスト

#### 3.2.1 数値抽出

```typescript
describe('extractAmount', () => {
  it('should extract integer', () => {
    expect(extractAmount('250')).toBe(250)
  })
  
  it('should extract decimal', () => {
    expect(extractAmount('1.5')).toBe(1.5)
  })
  
  it('should extract fraction', () => {
    expect(extractAmount('1/2')).toBe(0.5)
    expect(extractAmount('3/4')).toBe(0.75)
  })
  
  it('should return null for invalid input', () => {
    expect(extractAmount('abc')).toBeNull()
  })
})
```

#### 3.2.2 単位抽出

```typescript
describe('extractUnit', () => {
  it('should extract weight units', () => {
    expect(extractUnit('250g')).toBe('g')
    expect(extractUnit('250グラム')).toBe('g')
  })
  
  it('should extract volume units', () => {
    expect(extractUnit('150ml')).toBe('ml')
    expect(extractUnit('150cc')).toBe('ml')
  })
  
  it('should return default unit', () => {
    expect(extractUnit('250')).toBe('g')
  })
})
```

#### 3.2.3 Y座標による紐付け

```typescript
describe('pairIngredientsAndAmounts', () => {
  it('should pair ingredients and amounts by Y position', () => {
    const textBlocks = [
      {
        text: '強力粉',
        boundingBox: { x: 10, y: 100, width: 50, height: 20 },
      },
      {
        text: '250',
        boundingBox: { x: 200, y: 105, width: 30, height: 20 },
      },
      {
        text: '水',
        boundingBox: { x: 10, y: 130, width: 30, height: 20 },
      },
      {
        text: '150',
        boundingBox: { x: 200, y: 135, width: 30, height: 20 },
      },
    ]
    
    const result = pairIngredientsAndAmounts(textBlocks)
    
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('強力粉')
    expect(result[0].amount).toBe(250)
    expect(result[1].name).toBe('水')
    expect(result[1].amount).toBe(150)
  })
})
```

## 4. 統合テスト

### 4.1 OCR → 計算 → 表示フロー

```typescript
describe('OCR to Display Flow', () => {
  it('should process OCR result and update UI', async () => {
    // OCR結果のモック
    const ocrResult = {
      ingredients: [
        {
          id: 'temp-1',
          name: '強力粉',
          amount: 250,
          unit: 'g',
          y_position: 100,
        },
        {
          id: 'temp-2',
          name: '水',
          amount: 150,
          unit: 'ml',
          y_position: 120,
        },
      ],
    }
    
    // 状態を更新
    useRecipeStore.getState().setIngredients(ocrResult.ingredients)
    
    // スケーリングを実行
    useRecipeStore.getState().calculateScaling(2.0)
    
    // 結果を確認
    const calculatedAmounts = useRecipeStore.getState().calculatedAmounts
    expect(calculatedAmounts['temp-1']).toBe(500)
    expect(calculatedAmounts['temp-2']).toBe(300)
    
    // UIが更新されているか確認（コンポーネントテスト）
    const { getByText } = render(<IngredientList />)
    expect(getByText('500g')).toBeTruthy()
    expect(getByText('300ml')).toBeTruthy()
  })
})
```

### 4.2 レシピ保存フロー

```typescript
describe('Recipe Save Flow', () => {
  it('should save recipe to Supabase', async () => {
    const recipe = {
      title: 'テストレシピ',
      ingredients_json: [
        { id: '1', name: '強力粉', amount: 250, unit: 'g' },
      ],
    }
    
    // Supabaseのモック
    const mockInsert = jest.fn().mockResolvedValue({ data: [recipe] })
    supabase.from('recipes').insert = mockInsert
    
    // レシピを保存
    await saveRecipe(recipe)
    
    // Supabaseが呼ばれたか確認
    expect(mockInsert).toHaveBeenCalledWith(recipe)
  })
})
```

## 5. E2Eテスト

### 5.1 主要ユーザーフロー

#### 5.1.1 新規レシピ作成フロー

```typescript
describe('New Recipe Creation Flow', () => {
  it('should create a new recipe from OCR', async () => {
    // 1. カメラ画面を開く
    const { getByTestId } = render(<CameraScreen />)
    
    // 2. OCR開始ボタンをタップ
    fireEvent.press(getByTestId('ocr-start-button'))
    
    // 3. OCR結果が表示されるのを待つ
    await waitFor(() => {
      expect(getByTestId('ingredient-list')).toBeTruthy()
    })
    
    // 4. レシピ編集画面に遷移
    fireEvent.press(getByTestId('edit-recipe-button'))
    
    // 5. タイトルを入力
    fireEvent.changeText(getByTestId('title-input'), 'テストレシピ')
    
    // 6. 基準材料を選択
    fireEvent.press(getByTestId('base-ingredient-selector'))
    fireEvent.press(getByTestId('ingredient-option-0'))
    
    // 7. スライダーで倍率を調整
    fireEvent(getByTestId('scaling-slider'), 'onValueChange', 2.0)
    
    // 8. 保存ボタンをタップ
    fireEvent.press(getByTestId('save-button'))
    
    // 9. レシピ一覧に追加されることを確認
    await waitFor(() => {
      expect(getByText('テストレシピ')).toBeTruthy()
    })
  })
})
```

### 5.2 パフォーマンステスト

#### 5.2.1 スライダー操作のレスポンス

```typescript
describe('Slider Performance', () => {
  it('should update amounts within 16ms', async () => {
    const startTime = performance.now()
    
    // スライダーを操作
    fireEvent(getByTestId('scaling-slider'), 'onValueChange', 2.0)
    
    // 更新が完了するのを待つ
    await waitFor(() => {
      expect(getByText('500g')).toBeTruthy()
    })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // 16ms以内（60FPS）で更新されることを確認
    expect(duration).toBeLessThan(16)
  })
})
```

#### 5.2.2 ARオーバーレイの描画フレームレート

```typescript
describe('AR Overlay Frame Rate', () => {
  it('should maintain 60 FPS', async () => {
    const frameTimes: number[] = []
    let lastFrameTime = performance.now()
    
    // フレーム更新を監視
    const onFrameUpdate = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastFrameTime
      frameTimes.push(frameTime)
      lastFrameTime = currentTime
    }
    
    // スライダーを連続操作
    for (let i = 0; i < 60; i++) {
      fireEvent(getByTestId('scaling-slider'), 'onValueChange', 1.0 + i * 0.01)
      onFrameUpdate()
      await new Promise(resolve => setTimeout(resolve, 16))
    }
    
    // 平均フレーム時間を計算
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    const avgFPS = 1000 / avgFrameTime
    
    // 60FPS以上を維持していることを確認
    expect(avgFPS).toBeGreaterThanOrEqual(60)
  })
})
```

## 6. 実機テスト

### 6.1 テスト項目

#### 6.1.1 カメラ機能

- [ ] カメラが起動する
- [ ] フレームレートが30FPS以上
- [ ] OCRが動作する
- [ ] ARオーバーレイが表示される
- [ ] ARオーバーレイが60FPSで描画される

#### 6.1.2 OCR精度

- [ ] 日本語材料名が認識される
- [ ] 数値が正確に認識される
- [ ] 単位が正確に認識される
- [ ] Y座標による紐付けが正確

#### 6.1.3 計算機能

- [ ] スケーリング計算が正確
- [ ] ロック機能が動作する
- [ ] 丸め処理が正確
- [ ] ベーカーズパーセントが正確

#### 6.1.4 UI/UX

- [ ] タップ操作が反応する
- [ ] スライダー操作がスムーズ
- [ ] エラーメッセージが表示される
- [ ] オフライン時も動作する

### 6.2 テストデバイス

**iOS**:
- iPhone 12以上（推奨）
- iOS 15.0以上

**Android**:
- Android 10以上
- カメラ2 API対応デバイス

## 7. テスト自動化

### 7.1 CI/CD統合

GitHub Actionsでの自動テスト実行：

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

### 7.2 テストカバレッジ

目標カバレッジ: 80%以上

```bash
npm test -- --coverage
```

## 8. バグ管理

### 8.1 バグの分類

- **Critical**: アプリがクラッシュする、主要機能が動作しない
- **High**: 機能が部分的に動作しない、パフォーマンスが著しく低下
- **Medium**: 軽微な機能不具合、UIの問題
- **Low**: 軽微な表示の問題、改善提案

### 8.2 バグレポート形式

```markdown
## バグレポート

**タイトル**: [簡潔な説明]

**優先度**: Critical / High / Medium / Low

**再現手順**:
1. 
2. 
3. 

**期待される動作**:

**実際の動作**:

**環境**:
- デバイス: 
- OS: 
- アプリバージョン: 

**スクリーンショット**:
```

## 9. テストスケジュール

### 9.1 開発フェーズ

- **ユニットテスト**: 機能実装と並行して実施
- **統合テスト**: 機能完成後に実施
- **E2Eテスト**: 主要機能完成後に実施

### 9.2 リリース前

- **実機テスト**: 全機能の動作確認
- **パフォーマンステスト**: 60FPS描画の確認
- **回帰テスト**: 既存機能の動作確認

## 10. テスト結果の報告

### 10.1 テストレポート

テスト完了後、以下の情報をレポート：

- テスト実施日
- テスト環境
- テスト結果サマリー
- 発見されたバグ一覧
- カバレッジレポート

### 10.2 品質メトリクス

- テストカバレッジ: 80%以上
- パフォーマンス: 60FPS維持
- バグ密度: 1バグ/1000行以下
