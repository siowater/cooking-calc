# アーキテクチャ設計書：Baker's Lens

## 1. システム概要

Baker's Lensは、パン・お菓子作りのレシピをOCRで読み取り、材料の分量を動的にスケーリングするモバイルアプリケーションです。

### 1.1 システムアーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Camera     │  │   OCR        │  │   AR Overlay │    │
│  │   (Vision)   │→ │   (ML Kit)   │→ │   (Skia)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   State      │  │   Scaling    │  │   Recipe     │    │
│  │   (Zustand)  │← │   Logic      │← │   Manager    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth       │  │   Database    │  │   Storage    │    │
│  │   (Optional) │  │   (PostgreSQL)│  │   (Images)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 2. コンポーネント構成

### 2.1 レイヤー構造

```
src/
├── app/                    # アプリケーション層（画面・ナビゲーション）
│   ├── screens/           # 画面コンポーネント
│   │   ├── CameraScreen.tsx
│   │   ├── RecipeScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── navigation/        # ナビゲーション設定
│       └── AppNavigator.tsx
│
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
│
├── hooks/                 # カスタムフック層
│   ├── useOCR.ts         # OCR処理フック
│   ├── useScaling.ts     # スケーリング計算フック
│   └── useRecipe.ts      # レシピ管理フック
│
├── stores/                # 状態管理層（Zustand）
│   ├── recipeStore.ts    # レシピ状態管理
│   └── settingsStore.ts  # 設定状態管理
│
├── services/              # サービス層
│   ├── ocr/              # OCRサービス
│   │   └── ocrService.ts
│   ├── supabase/         # Supabaseサービス
│   │   ├── auth.ts
│   │   ├── recipes.ts
│   │   └── ingredients.ts
│   └── storage/          # ローカルストレージ
│       └── localStorage.ts
│
├── utils/                 # ユーティリティ層
│   ├── calculations.ts   # 計算ロジック
│   ├── formatters.ts     # フォーマット処理
│   └── validators.ts     # バリデーション
│
└── types/                 # 型定義層
    ├── recipe.ts
    ├── ingredient.ts
    └── ocr.ts
```

### 2.2 主要コンポーネントの責任範囲

#### CameraScreen
- カメラの起動・停止制御
- OCR処理のトリガー
- ARオーバーレイの表示制御

#### OCRService
- Vision Cameraからのフレーム取得
- ML Kit OCRによるテキスト抽出
- 材料名・数値・単位のパース
- Y座標による行の紐付け（名寄せ）

#### ScalingLogic (Zustand Store)
- 基準材料の選択
- 倍率計算（$Target = Original \times Ratio$）
- 分量ロック機能
- 丸め処理

#### AROverlay (Skia)
- カメラ映像上のテキスト位置の追跡
- 計算後の数値のリアルタイム描画
- 60FPSでの描画パフォーマンス維持

## 3. データフロー

### 3.1 OCR処理フロー

```
1. Camera Frame → Vision Camera
2. Frame Processor → OCR Service
3. ML Kit OCR → テキスト抽出
4. Parser → 材料名・数値・単位の解析
5. Y座標マッチング → 行の紐付け
6. Recipe Store → 状態更新
```

### 3.2 スケーリング計算フロー

```
1. ユーザーが基準材料を選択
2. スライダー操作で倍率変更
3. Zustand Store → 全材料の倍率計算
4. 計算結果 → Recipe Store更新
5. AR Overlay → リアルタイム描画更新
```

### 3.3 レシピ保存フロー

```
1. ユーザーが「保存」ボタンをタップ
2. Recipe Store → 現在のレシピデータ取得
3. Supabase Client → recipes テーブルに保存
4. Storage → OCR元画像をアップロード
5. 成功通知 → UI更新
```

## 4. 技術スタック詳細

### 4.1 フロントエンド

- **Expo SDK 50+**: React Nativeフレームワーク
- **TypeScript**: 型安全性の確保
- **React Navigation**: 画面遷移管理
- **Zustand**: 軽量な状態管理（計算ロジック用）

### 4.2 カメラ・OCR

- **react-native-vision-camera v4**: カメラアクセス
- **@bear-block/vision-camera-ocr**: ML Kit OCR統合
- **Frame Processor**: リアルタイムフレーム処理

### 4.3 グラフィックス

- **react-native-skia**: ARオーバーレイ描画
- **60FPS描画**: スライダー操作への低遅延対応

### 4.4 バックエンド

- **Supabase Auth**: 認証（オプション）
- **Supabase Database**: PostgreSQL（レシピ・材料マスタ）
- **Supabase Storage**: OCR元画像の保存

## 5. パフォーマンス要件

### 5.1 リアルタイム処理

- **OCR処理**: フレームごとに実行（最大30FPS）
- **AR描画**: 60FPS維持
- **スケーリング計算**: スライダー操作に対して即座に反映（<16ms）

### 5.2 メモリ管理

- Frame Processor内での重い処理を避ける
- OCR結果のキャッシュ戦略
- 画像のメモリリーク防止

### 5.3 オフライン対応

- OCR処理はデバイス上で実行（ML Kit）
- 計算ロジックはローカルで実行
- レシピ保存はオフラインキューに追加

## 6. セキュリティ設計

### 6.1 認証

- ノーログイン利用を許可（基本機能）
- ログイン時のみレシピ保存機能を有効化

### 6.2 データ保護

- Supabase RLS（Row Level Security）によるデータアクセス制御
- 画像のストレージアクセス権限管理

### 6.3 プライバシー

- OCR処理はデバイス上で実行（クラウド送信なし）
- レシピデータはユーザー所有

## 7. エラーハンドリング戦略

### 7.1 OCRエラー

- 認識失敗時のリトライ機能
- マニュアル修正UIの提供
- エラーメッセージの日本語表示

### 7.2 ネットワークエラー

- オフライン時の動作保証
- 保存失敗時のリトライキュー
- エラー通知の表示

### 7.3 計算エラー

- 不正な入力値の検証
- ゼロ除算の防止
- エラーメッセージの表示

## 8. 拡張性の考慮

### 8.1 将来の機能追加

- モジュール化されたコンポーネント設計
- プラグイン可能な計算ロジック
- 拡張可能な材料マスタ

### 8.2 スケーラビリティ

- レシピ数の増加に対応
- 画像ストレージの最適化
- データベースクエリの最適化

## 9. 開発環境

### 9.1 ローカル開発

- Windows OSでの開発
- Expo Development Client
- 実機検証（iOS/Android）

### 9.2 ビルド・デプロイ

- EAS Buildによるクラウドビルド
- iOS/Android実機での検証
- ステージング環境でのテスト

## 10. アーキテクチャ決定記録 (ADR)

### ADR-001: Expo Managed Workflowの採用

**決定**: Expo SDK 50+のManaged Workflowを使用する

**理由**:
- ネイティブモジュールの管理が容易
- EAS Buildとの統合が簡単
- Windows環境での開発が可能

**トレードオフ**:
- カスタムネイティブコードの追加が制限される
- ただし、必要な機能（Vision Camera、Skia）は利用可能

### ADR-002: Zustandによる状態管理

**決定**: ReduxではなくZustandを使用する

**理由**:
- 軽量でシンプルなAPI
- TypeScriptとの統合が良好
- 計算ロジックの実装が容易

**トレードオフ**:
- 大規模アプリではReduxの方が適している場合もある
- 現時点の規模ではZustandで十分

### ADR-003: ML Kit OCRの採用

**決定**: Google ML Kit OCRを使用する

**理由**:
- デバイス上で実行可能（プライバシー保護）
- オフライン動作が可能
- 日本語対応

**トレードオフ**:
- クラウドOCR（Google Cloud Vision等）の方が精度が高い場合がある
- ただし、プライバシーとオフライン要件を優先
