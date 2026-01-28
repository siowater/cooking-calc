# 開発環境セットアップガイド：Baker's Lens

## 1. 前提条件

### 1.1 必要なソフトウェア

- **Node.js**: v18.0.0以上
- **npm**: v9.0.0以上（またはyarn v1.22.0以上）
- **Git**: 最新版
- **Expo CLI**: 最新版
- **EAS CLI**: 最新版（ビルド用）

### 1.2 開発環境

- **OS**: Windows 10/11（本プロジェクトの開発環境）
- **エディタ**: VS Code推奨（Cursorも可）
- **実機**: iOS/Android実機（開発ビルドの検証用）

## 2. プロジェクトのセットアップ

### 2.1 リポジトリのクローン

```bash
git clone <repository-url>
cd cooking-calc
```

### 2.2 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 2.3 Expo CLIのインストール（グローバル）

```bash
npm install -g expo-cli
npm install -g eas-cli
```

### 2.4 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定：

```env
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# EAS設定（オプション）
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
```

`.env.example`ファイルを参考にしてください（存在する場合）。

## 3. Supabaseのセットアップ

**詳細な手順は [Supabase設定ガイド](./supabase-setup.md) を参照してください。**

### 3.1 クイックセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. APIキーを取得（Settings > API）
3. `.env`ファイルに設定を記入（`.env.example`をコピー）
4. データベーステーブルを作成（`docs/supabase-setup.md`のSQLを実行）

### 3.2 詳細手順

完全なセットアップ手順、データベース作成、RLSポリシー設定については、[Supabase設定ガイド](./supabase-setup.md)を参照してください。

## 4. 開発ビルドの作成

### 4.1 EASアカウントの設定

```bash
eas login
```

### 4.2 プロジェクトの初期化

```bash
eas init
```

### 4.3 Development Buildの作成

**iOS用**:
```bash
eas build --profile development --platform ios
```

**Android用**:
```bash
eas build --profile development --platform android
```

**注意**: Windows環境ではiOSビルドは実行できません。Mac環境またはEAS Buildサービスを使用してください。

### 4.4 実機へのインストール

ビルド完了後、QRコードまたはダウンロードリンクから実機にインストール。

## 5. ローカル開発の開始

### 5.1 開発サーバーの起動

```bash
npm start
# または
expo start
```

### 5.2 実機での実行

1. Expo Goアプリを実機にインストール（基本機能のみ）
2. 開発ビルドを実機にインストール（カメラ機能を含む全機能）
3. QRコードをスキャンしてアプリを起動

### 5.3 開発モードの機能

- **Hot Reload**: コード変更が自動的に反映
- **Fast Refresh**: Reactコンポーネントの高速リロード
- **デバッグ**: React Native DebuggerまたはChrome DevTools

## 6. 開発ツールの設定

### 6.1 VS Code拡張機能

推奨拡張機能：

- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット
- **React Native Tools**: React Native開発支援
- **TypeScript**: 型チェック

### 6.2 ESLint設定

`.eslintrc.js`ファイルを作成：

```javascript
module.exports = {
  extends: [
    'expo',
    'prettier',
    '@react-native-community',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // プロジェクト固有のルール
  },
}
```

### 6.3 Prettier設定

`.prettierrc`ファイルを作成：

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## 7. テスト環境のセットアップ

### 7.1 Jestの設定

`jest.config.js`ファイルを作成：

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

### 7.2 テストの実行

```bash
npm test
# または
yarn test
```

## 8. トラブルシューティング

### 8.1 よくある問題

#### カメラが起動しない

**原因**: 権限が設定されていない

**解決策**:
1. `app.json`でカメラ権限を設定
2. 実機の設定でアプリのカメラ権限を有効化

#### OCRが動作しない

**原因**: ML Kitの設定が不完全

**解決策**:
1. `@bear-block/vision-camera-ocr`が正しくインストールされているか確認
2. 開発ビルドを使用しているか確認（Expo Goでは動作しない可能性）

#### Supabase接続エラー

**原因**: 環境変数が設定されていない

**解決策**:
1. `.env`ファイルが正しく配置されているか確認
2. 環境変数が正しく読み込まれているか確認
3. SupabaseプロジェクトのURLとキーが正しいか確認

### 8.2 デバッグ方法

#### ログの確認

```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

#### React Native Debugger

1. アプリを起動
2. デバイスをシェイク（またはメニューから「Debug」を選択）
3. Chrome DevToolsが開く

## 9. 開発ワークフロー

### 9.1 ブランチ戦略

- `main`: 本番環境用
- `develop`: 開発環境用
- `feature/*`: 機能開発用
- `fix/*`: バグ修正用

### 9.2 コミット規約

`.cursorrules`の`rules/git-workflow.md`を参照。

### 9.3 コードレビュー

1. プルリクエストを作成
2. コードレビューを依頼
3. 承認後にマージ

## 10. パフォーマンス最適化の確認

### 10.1 パフォーマンスモニタリング

```bash
# メモリ使用量の確認
npx react-native run-ios --verbose

# フレームレートの確認
# React Native Performance Monitorを使用
```

### 10.2 プロファイリング

React DevTools Profilerを使用してパフォーマンスボトルネックを特定。

## 11. 参考資料

### 11.1 公式ドキュメント

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Vision Camera](https://react-native-vision-camera.com/)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [Supabase Documentation](https://supabase.com/docs)

### 11.2 プロジェクト内ドキュメント

- `docs/requirements.md`: 要件定義書
- `docs/architecture.md`: アーキテクチャ設計書
- `docs/database-design.md`: データベース設計書
- `docs/api-design.md`: API設計書
- `docs/technical-specification.md`: 技術仕様書

## 12. 次のステップ

セットアップ完了後、以下を確認：

1. ✅ 開発サーバーが起動する
2. ✅ 実機でアプリが起動する
3. ✅ カメラが動作する
4. ✅ Supabaseに接続できる
5. ✅ テストが実行できる

問題が発生した場合は、`docs/`フォルダ内の関連ドキュメントを参照するか、チームに相談してください。
