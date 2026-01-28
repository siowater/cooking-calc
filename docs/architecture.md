# アーキテクチャ設計書：Baker's Lens

## 1. システム概要

Baker's Lensは、パン・お菓子作りのレシピをOCRで読み取り、材料の分量を動的にスケーリングするモバイルアプリケーションです。

### 1.1 システムアーキテクチャ図

#### 現在の構成（Phase 1 - Expo Go対応）

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo SDK 54)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ ImagePicker  │  │   OCR        │  │   Recipe     │    │
│  │   (expo)     │→ │ (Cloud       │→ │   Editor     │    │
│  │              │  │  Vision API) │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   State      │  │   Scaling    │  │   Recipe     │    │
│  │   (Zustand)  │← │   Logic      │← │   Manager    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Cloud Vision │  │   Supabase   │  │   Supabase   │    │
│  │   API (OCR)  │  │   (Database) │  │   (Storage)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### 将来の構成（Phase 2 - Development Build）

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
├── screens/               # 画面コンポーネント
│   ├── CameraScreen.tsx        # スキャン画面（ImagePicker + OCR）
│   ├── RecipeEditScreen.tsx    # 計算画面（スケーリング）
│   ├── RecipeListScreen.tsx    # 保存レシピ一覧
│   ├── SettingsScreen.tsx      # 設定画面
│   └── navigation/             # ナビゲーション設定
│       └── AppNavigator.tsx
│
├── components/            # UIコンポーネント層
│   └── common/           # 共通コンポーネント
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ErrorBoundary.tsx
│
├── stores/                # 状態管理層（Zustand）
│   └── recipeStore.ts    # レシピ・設定状態管理
│
├── services/              # サービス層
│   ├── ocr/              # OCRサービス
│   │   ├── ocrService.ts       # OCRサービス本体
│   │   └── cloudVisionService.ts  # Cloud Vision API連携
│   └── supabase/         # Supabaseサービス
│       ├── client.ts           # Supabaseクライアント
│       ├── recipes.ts          # レシピCRUD
│       ├── ingredients.ts      # 材料マスタ
│       └── test-connection.ts  # 接続テスト
│
├── utils/                 # ユーティリティ層
│   ├── calculations.ts   # スケーリング・ベーカーズ%計算
│   ├── formatters.ts     # フォーマット処理
│   └── ocr-parser.ts     # OCR結果パーサー（高精度）
│
└── types/                 # 型定義層
    ├── recipe.ts
    ├── ingredient.ts
    └── ocr.ts
```

#### 将来追加予定（Phase 2）

```
src/
├── components/
│   ├── camera/           # カメラ関連（Development Build必要）
│   │   ├── CameraView.tsx
│   │   └── AROverlay.tsx
│   └── recipe/           # レシピ関連
│       ├── IngredientList.tsx
│       ├── ScalingSlider.tsx
│       └── TimerButton.tsx
│
├── hooks/                 # カスタムフック層
│   ├── useOCR.ts         # OCR処理フック
│   ├── useScaling.ts     # スケーリング計算フック
│   └── useRecipe.ts      # レシピ管理フック
```

### 2.2 主要コンポーネントの責任範囲

#### CameraScreen【実装済み】
- expo-image-pickerによる画像選択（カメラ/ライブラリ）
- Cloud Vision API経由でのOCR処理
- 認識結果のプレビュー表示
- 「この結果を使用」でRecipeEditScreenへ遷移

#### OCRService【実装済み】
- Cloud Vision APIへの画像送信
- テキスト抽出結果の受信
- 材料名・数値・単位のパース（ocr-parser.ts）
- Y座標による行の紐付け（名寄せ）
- 200+の材料キーワード、信頼度スコアリング

#### ScalingLogic (Zustand Store)【実装済み】
- 基準材料の選択
- 倍率計算（$Target = Original \times Ratio$）
- 分量ロック機能
- 丸め処理

#### 将来実装予定（Phase 2 - Development Build必要）

##### VisionCameraScreen
- カメラの起動・停止制御
- リアルタイムOCR処理のトリガー
- ARオーバーレイの表示制御

##### AROverlay (Skia)
- カメラ映像上のテキスト位置の追跡
- 計算後の数値のリアルタイム描画
- 60FPSでの描画パフォーマンス維持

## 3. データフロー

### 3.1 OCR処理フロー

#### 現在の実装（Phase 1）

```
1. ユーザーが画像を選択 → expo-image-picker
2. 画像をBase64エンコード → expo-file-system/legacy
3. Cloud Vision API → テキスト抽出
4. ocr-parser.ts → 材料名・数値・単位の解析
5. 行グルーピング → Y座標による紐付け
6. 信頼度スコアリング → 材料判定
7. Recipe Store → 状態更新
```

#### 将来の実装（Phase 2）

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

- **Expo SDK 54**: React Nativeフレームワーク（React 19.1.0, React Native 0.81.0）
- **TypeScript**: 型安全性の確保
- **React Navigation**: 画面遷移管理（Bottom Tabs + Native Stack）
- **Zustand**: 軽量な状態管理（計算ロジック用）

### 4.2 画像選択・OCR（Phase 1 - 現在）

- **expo-image-picker**: カメラ/フォトライブラリから画像選択
- **expo-file-system/legacy**: 画像のBase64エンコード
- **Google Cloud Vision API**: クラウドOCR処理

### 4.3 カメラ・OCR（Phase 2 - 将来、Development Build必要）

- **react-native-vision-camera v4**: カメラアクセス
- **@bear-block/vision-camera-ocr**: ML Kit OCR統合
- **Frame Processor**: リアルタイムフレーム処理

### 4.4 グラフィックス（Phase 2 - 将来、Development Build必要）

- **react-native-skia**: ARオーバーレイ描画
- **60FPS描画**: スライダー操作への低遅延対応

### 4.5 バックエンド

- **Supabase Auth**: 認証（オプション）
- **Supabase Database**: PostgreSQL（レシピ・材料マスタ）
- **Supabase Storage**: OCR元画像の保存

## 5. パフォーマンス要件

### 5.1 処理速度

#### Phase 1（現在）
- **OCR処理**: Cloud Vision API経由（ネットワーク依存、通常1-3秒）
- **スケーリング計算**: ボタン操作に対して即座に反映（<16ms）

#### Phase 2（将来）
- **OCR処理**: フレームごとに実行（最大30FPS）
- **AR描画**: 60FPS維持

### 5.2 メモリ管理

- 画像のBase64エンコード時の効率的な処理
- OCR結果のキャッシュ戦略
- 画像のメモリリーク防止

### 5.3 ネットワーク対応

#### Phase 1（現在）
- Cloud Vision APIを使用するためネットワーク接続が必要
- 計算ロジックはローカルで実行

#### Phase 2（将来）
- OCR処理はデバイス上で実行（ML Kit）でオフライン対応
- レシピ保存はオフラインキューに追加

## 6. セキュリティ設計

### 6.1 認証

- ノーログイン利用を許可（基本機能）
- ログイン時のみレシピ保存機能を有効化

### 6.2 データ保護

- Supabase RLS（Row Level Security）によるデータアクセス制御
- 画像のストレージアクセス権限管理

### 6.3 プライバシー

#### Phase 1（現在）
- OCR処理はGoogle Cloud Vision APIを使用（画像がクラウドに送信される）
- レシピデータはユーザー所有

#### Phase 2（将来）
- OCR処理はデバイス上で実行（ML Kit、クラウド送信なし）
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

**決定**: Expo SDK 54のManaged Workflowを使用する

**理由**:
- ネイティブモジュールの管理が容易
- EAS Buildとの統合が簡単
- Windows環境での開発が可能
- Expo Goでの初期開発が可能

**トレードオフ**:
- Vision Camera、Skiaなどのネイティブ機能はDevelopment Buildが必要
- Phase 1ではCloud Vision APIを使用することで回避

### ADR-002: Zustandによる状態管理

**決定**: ReduxではなくZustandを使用する

**理由**:
- 軽量でシンプルなAPI
- TypeScriptとの統合が良好
- 計算ロジックの実装が容易

**トレードオフ**:
- 大規模アプリではReduxの方が適している場合もある
- 現時点の規模ではZustandで十分

### ADR-003: OCR実装のフェーズ分け

**決定**: Phase 1ではGoogle Cloud Vision API、Phase 2でML Kit OCRを使用する

#### Phase 1（現在）: Cloud Vision API

**理由**:
- Expo Goで動作可能（Development Build不要）
- 高精度なOCR認識
- 迅速な開発・テストサイクル

**トレードオフ**:
- ネットワーク接続が必要
- 画像がクラウドに送信される（プライバシー配慮が必要）

#### Phase 2（将来）: ML Kit OCR

**理由**:
- デバイス上で実行可能（プライバシー保護）
- オフライン動作が可能
- リアルタイム処理が可能

**トレードオフ**:
- Development Buildが必要
- 初期セットアップが複雑
