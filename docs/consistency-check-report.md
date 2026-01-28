# ドキュメントとソースコードの整合性チェックレポート

**作成日**: 2026年1月28日  
**対象ドキュメント**: 
- `docs/requirements.md` - 要件定義書
- `docs/architecture.md` - アーキテクチャ設計書

---

## 1. docs/requirements.md（要件定義書）

### ✅ 整合している点

1. **基本機能の実装状況**
   - ✅ レシピ管理機能（作成・更新・削除・一覧表示）が実装済み
   - ✅ スケーリング計算機能が実装済み（`src/utils/calculations.ts`）
   - ✅ ベーカーズパーセント計算が実装済み
   - ✅ 材料のロック機能が実装済み
   - ✅ 丸め処理（整数/小数）が実装済み
   - ✅ Supabase連携が実装済み（認証、データベース、ストレージ）

2. **状態管理**
   - ✅ Zustandによる状態管理が実装済み（`src/stores/recipeStore.ts`）

3. **画面構成**
   - ✅ CameraScreen、RecipeEditScreen、RecipeListScreen、SettingsScreenが実装済み

### ❌ 不整合な点（詳細）

#### 1.1 OCR・スキャン機能の実装方法の相違

**ドキュメント記載**:
- リアルタイム抽出: カメラ越しに「材料名」「数値」「単位」を自動認識
- React Native Vision Camera v4 + ML Kit OCRを使用

**実際の実装**:
- ❌ Vision Cameraは使用されていない（`package.json`に存在しない）
- ❌ ML Kit OCRは使用されていない
- ✅ 代わりに`expo-image-picker`で画像を選択し、Cloud Vision APIでOCR処理
- ✅ リアルタイム処理ではなく、画像選択後の一括処理

**影響**: 要件定義の「リアルタイム抽出」が実現されていない

#### 1.2 ARオーバーレイ機能の未実装

**ドキュメント記載**:
- ARオーバーレイ: カメラ映像上のテキスト位置に、計算後の数値をSkiaで直接描画
- React Native Skiaを使用

**実際の実装**:
- ❌ ARオーバーレイコンポーネントが存在しない（`src/components/camera/AROverlay.tsx`が存在しない）
- ❌ React Native Skiaが`package.json`に存在しない
- ❌ カメラ映像上への描画機能が実装されていない

**影響**: 要件定義の「ARオーバーレイ」機能が完全に未実装

#### 1.3 調理・計量支援機能の一部未実装

**ドキュメント記載**:
- ✅ 計量済みチェック: 実装済み（`toggleIngredientCheck`）
- ❌ 残量リミッター: 在庫上限設定と警告表示が未実装
- ❌ ワンタップタイマー: 抽出した時間をタップしてタイマー起動が未実装
- ❌ 微量材料アラート: 塩・イーストなどの強調表示が未実装

#### 1.4 パン作り特化ロジックの一部未実装

**ドキュメント記載**:
- ✅ ベーカーズパーセント: 実装済み
- ❌ 代替材料サジェスト: 牛乳→豆乳などの代替案と換算比率の提示が未実装

#### 1.5 技術スタックの相違

**ドキュメント記載**:
- OCR/Camera: React Native Vision Camera v4 + ML Kit OCR
- Graphics: React Native Skia (AR Overlay)

**実際の実装**:
- ❌ `react-native-vision-camera`が`package.json`に存在しない
- ❌ `@bear-block/vision-camera-ocr`が`package.json`に存在しない
- ❌ `react-native-skia`が`package.json`に存在しない
- ✅ 代わりに`expo-image-picker`とCloud Vision APIを使用

---

## 2. docs/architecture.md（アーキテクチャ設計書）

### ✅ 整合している点

1. **基本アーキテクチャ**
   - ✅ Expo SDK 50+を使用（実際はSDK 54）
   - ✅ TypeScriptを使用
   - ✅ React Navigationを使用
   - ✅ Zustandによる状態管理
   - ✅ Supabase連携（Auth、Database、Storage）

2. **データフロー**
   - ✅ OCR処理フロー（画像選択→OCR→パース→状態更新）が実装済み
   - ✅ スケーリング計算フロー（基準材料選択→倍率変更→計算→状態更新）が実装済み
   - ✅ レシピ保存フロー（保存ボタン→Supabase保存）が実装済み

3. **サービス層**
   - ✅ OCRサービス（`src/services/ocr/ocrService.ts`）
   - ✅ Supabaseサービス（`src/services/supabase/recipes.ts`, `ingredients.ts`）

4. **ユーティリティ層**
   - ✅ 計算ロジック（`src/utils/calculations.ts`）
   - ✅ OCRパーサー（`src/utils/ocr-parser.ts`）

5. **型定義層**
   - ✅ レシピ型（`src/types/recipe.ts`）
   - ✅ 材料型（`src/types/ingredient.ts`）
   - ✅ OCR型（`src/types/ocr.ts`）

### ❌ 不整合な点（詳細）

#### 2.1 ディレクトリ構造の相違

**ドキュメント記載**:
```
src/
├── app/                    # アプリケーション層
│   ├── screens/           # 画面コンポーネント
│   │   ├── CameraScreen.tsx
│   │   ├── RecipeScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── navigation/        # ナビゲーション設定
│       └── AppNavigator.tsx
```

**実際の構造**:
```
src/
├── screens/               # app/ディレクトリがない
│   ├── CameraScreen.tsx
│   ├── RecipeEditScreen.tsx  # RecipeScreen.tsxではない
│   ├── RecipeListScreen.tsx  # ドキュメントに記載なし
│   ├── SettingsScreen.tsx
│   └── navigation/        # screens/配下にある
│       └── AppNavigator.tsx
```

**不整合**:
- ❌ `app/`ディレクトリが存在しない
- ❌ `RecipeScreen.tsx`が存在せず、代わりに`RecipeEditScreen.tsx`と`RecipeListScreen.tsx`が存在
- ❌ `navigation/`が`screens/`配下にある

#### 2.2 コンポーネント層の未実装

**ドキュメント記載**:
```
├── components/            # UIコンポーネント層
│   ├── camera/           # カメラ関連コンポーネント
│   │   ├── CameraView.tsx
│   │   └── AROverlay.tsx
│   ├── recipe/           # レシピ関連コンポーネント
│   │   ├── IngredientList.tsx
│   │   ├── ScalingSlider.tsx
│   │   └── TimerButton.tsx
│   └── common/           # 共通コンポーネント
│       ├── Button.tsx
│       └── Input.tsx
```

**実際の構造**:
```
├── components/
│   └── common/           # 共通コンポーネントのみ
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ErrorBoundary.tsx  # ドキュメントに記載なし
```

**不整合**:
- ❌ `components/camera/`ディレクトリが存在しない
- ❌ `CameraView.tsx`が存在しない
- ❌ `AROverlay.tsx`が存在しない
- ❌ `components/recipe/`ディレクトリが存在しない
- ❌ `IngredientList.tsx`が存在しない（機能は`RecipeEditScreen.tsx`に統合）
- ❌ `ScalingSlider.tsx`が存在しない（機能は`RecipeEditScreen.tsx`に統合）
- ❌ `TimerButton.tsx`が存在しない

#### 2.3 カスタムフック層の未実装

**ドキュメント記載**:
```
├── hooks/                 # カスタムフック層
│   ├── useOCR.ts         # OCR処理フック
│   ├── useScaling.ts     # スケーリング計算フック
│   └── useRecipe.ts      # レシピ管理フック
```

**実際の構造**:
- ❌ `hooks/`ディレクトリが存在しない
- ❌ すべてのフックが未実装（機能は各コンポーネントやストアに直接実装）

#### 2.4 ストア層の相違

**ドキュメント記載**:
```
├── stores/                # 状態管理層（Zustand）
│   ├── recipeStore.ts    # レシピ状態管理
│   └── settingsStore.ts  # 設定状態管理
```

**実際の構造**:
```
├── stores/
│   └── recipeStore.ts    # レシピ状態管理のみ
```

**不整合**:
- ❌ `settingsStore.ts`が存在しない
- ✅ 設定機能（丸めモードなど）は`recipeStore.ts`に統合されている

#### 2.5 サービス層の一部未実装

**ドキュメント記載**:
```
├── services/              # サービス層
│   ├── ocr/              # OCRサービス
│   │   └── ocrService.ts
│   ├── supabase/         # Supabaseサービス
│   │   ├── auth.ts
│   │   ├── recipes.ts
│   │   └── ingredients.ts
│   └── storage/          # ローカルストレージ
│       └── localStorage.ts
```

**実際の構造**:
```
├── services/
│   ├── ocr/
│   │   ├── ocrService.ts
│   │   └── cloudVisionService.ts  # ドキュメントに記載なし
│   └── supabase/
│       ├── client.ts      # ドキュメントに記載なし
│       ├── recipes.ts
│       ├── ingredients.ts
│       └── test-connection.ts  # ドキュメントに記載なし
```

**不整合**:
- ❌ `services/supabase/auth.ts`が存在しない（認証機能は`client.ts`に統合されている可能性）
- ❌ `services/storage/localStorage.ts`が存在しない
- ✅ `cloudVisionService.ts`が実装されているが、ドキュメントに記載なし

#### 2.6 ユーティリティ層の一部未実装

**ドキュメント記載**:
```
├── utils/                 # ユーティリティ層
│   ├── calculations.ts   # 計算ロジック
│   ├── formatters.ts     # フォーマット処理
│   └── validators.ts     # バリデーション
```

**実際の構造**:
```
├── utils/
│   ├── calculations.ts
│   └── ocr-parser.ts     # ドキュメントに記載なし
```

**不整合**:
- ❌ `formatters.ts`が存在しない
- ❌ `validators.ts`が存在しない
- ✅ `ocr-parser.ts`が実装されているが、ドキュメントに記載なし

#### 2.7 OCR処理フローの相違

**ドキュメント記載**:
```
1. Camera Frame → Vision Camera
2. Frame Processor → OCR Service
3. ML Kit OCR → テキスト抽出
4. Parser → 材料名・数値・単位の解析
5. Y座標マッチング → 行の紐付け
6. Recipe Store → 状態更新
```

**実際の実装**:
```
1. 画像選択 → expo-image-picker
2. OCR Service → Cloud Vision API
3. Cloud Vision API → テキスト抽出
4. Parser → 材料名・数値・単位の解析（ocr-parser.ts）
5. Y座標マッチング → 行の紐付け（実装済み）
6. Recipe Store → 状態更新
```

**不整合**:
- ❌ Vision CameraとFrame Processorを使用していない
- ❌ ML Kit OCRを使用していない
- ✅ Cloud Vision APIを使用（ドキュメントに記載なし）

#### 2.8 AR描画フローの未実装

**ドキュメント記載**:
```
1. ユーザーが基準材料を選択
2. スライダー操作で倍率変更
3. Zustand Store → 全材料の倍率計算
4. 計算結果 → Recipe Store更新
5. AR Overlay → リアルタイム描画更新
```

**実際の実装**:
```
1. ユーザーが基準材料を選択 ✅
2. スライダー操作で倍率変更 ✅（ボタン操作）
3. Zustand Store → 全材料の倍率計算 ✅
4. 計算結果 → Recipe Store更新 ✅
5. AR Overlay → リアルタイム描画更新 ❌（未実装）
```

**不整合**:
- ❌ AR Overlayによるリアルタイム描画が未実装
- ✅ 計算結果は画面に表示されるが、カメラ映像上への描画はない

#### 2.9 技術スタックの相違

**ドキュメント記載**:
- react-native-vision-camera v4: カメラアクセス
- @bear-block/vision-camera-ocr: ML Kit OCR統合
- react-native-skia: ARオーバーレイ描画

**実際の実装**:
- ❌ すべてのパッケージが`package.json`に存在しない
- ✅ 代わりに`expo-image-picker`とCloud Vision APIを使用

---

## 3. 推奨修正

### 3.1 要件定義書（requirements.md）の修正

1. **OCR機能の記載を修正**
   - 現在の実装（画像選択 + Cloud Vision API）を明記
   - リアルタイムOCRは「将来実装予定」として記載

2. **ARオーバーレイ機能の記載を修正**
   - 現在は未実装であることを明記
   - 将来実装予定として記載

3. **技術スタックの記載を修正**
   - 現在使用している技術スタック（expo-image-picker、Cloud Vision API）を追加
   - Vision Camera + ML Kit OCRは「将来実装予定」として記載

4. **未実装機能の明記**
   - 残量リミッター、ワンタップタイマー、微量材料アラート、代替材料サジェストを「将来実装予定」として記載

### 3.2 アーキテクチャ設計書（architecture.md）の修正

1. **ディレクトリ構造の更新**
   - 実際の構造（`src/screens/`、`src/screens/navigation/`）に合わせて修正
   - `RecipeScreen.tsx`を`RecipeEditScreen.tsx`と`RecipeListScreen.tsx`に修正

2. **コンポーネント構成の更新**
   - 未実装コンポーネント（CameraView、AROverlay、IngredientList、ScalingSlider、TimerButton）を削除または「将来実装予定」として記載
   - 実際に存在するコンポーネント（ErrorBoundary）を追加

3. **フック層の記載を削除または修正**
   - `hooks/`ディレクトリが存在しないため、該当セクションを削除または「将来実装予定」として記載

4. **ストア層の修正**
   - `settingsStore.ts`が存在しないことを明記
   - 設定機能が`recipeStore.ts`に統合されていることを記載

5. **サービス層の更新**
   - `auth.ts`と`localStorage.ts`が存在しないことを明記
   - `cloudVisionService.ts`と`test-connection.ts`を追加

6. **ユーティリティ層の更新**
   - `formatters.ts`と`validators.ts`が存在しないことを明記
   - `ocr-parser.ts`を追加

7. **データフローの更新**
   - OCR処理フローを実際の実装（画像選択→Cloud Vision API）に合わせて修正
   - AR描画フローを「将来実装予定」として記載

8. **技術スタックの更新**
   - 実際に使用している技術スタックを記載
   - Vision Camera + ML Kit OCR + Skiaは「将来実装予定」として記載

### 3.3 実装の優先順位

1. **高優先度（ドキュメントとの整合性を保つため）**
   - ドキュメントを実際の実装に合わせて更新

2. **中優先度（機能実装）**
   - ARオーバーレイ機能の実装（Vision Camera + Skia）
   - リアルタイムOCR機能の実装（Vision Camera + ML Kit OCR）
   - 未実装の調理支援機能（残量リミッター、タイマー、アラート）

3. **低優先度（リファクタリング）**
   - コンポーネントの分離（IngredientList、ScalingSlider等）
   - カスタムフックの作成（useOCR、useScaling、useRecipe）
   - 設定ストアの分離

---

## 4. まとめ

### 整合性スコア

- **要件定義書**: 約60%整合（基本機能は実装済み、OCR/AR機能は未実装）
- **アーキテクチャ設計書**: 約50%整合（基本構造は実装済み、詳細コンポーネントは未実装）

### 主な不整合の原因

1. **技術スタックの変更**: Vision Camera + ML Kit OCRからCloud Vision APIへの変更
2. **実装フェーズの違い**: 基本機能を優先し、AR/リアルタイム機能は後回し
3. **アーキテクチャの簡略化**: コンポーネントやフックを統合して実装

### 推奨アクション

1. **即座に実施**: ドキュメントを実際の実装に合わせて更新
2. **短期**: 未実装機能の実装計画を策定
3. **長期**: Vision Camera + ML Kit OCR + Skiaへの移行計画を策定
