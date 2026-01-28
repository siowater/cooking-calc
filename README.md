# Baker's Lens

パン・お菓子作りのレシピをOCRで読み取り、材料の分量を動的にスケーリングするモバイルアプリケーション。

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、Supabaseの設定を追加：

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

詳細は [docs/supabase-setup.md](./docs/supabase-setup.md) を参照してください。

### 3. アプリの起動

```bash
npm start
```

## 📚 ドキュメント

詳細なドキュメントは `docs/` フォルダを参照してください：

- [要件定義書](./docs/requirements.md)
- [アーキテクチャ設計書](./docs/architecture.md)
- [開発環境セットアップガイド](./docs/setup-guide.md)
- [Supabase設定ガイド](./docs/supabase-setup.md)

## 🛠️ 技術スタック

- **Frontend**: Expo (SDK 51+)
- **Camera/OCR**: React Native Vision Camera v4 + ML Kit OCR
- **Graphics**: React Native Skia
- **Backend**: Supabase (Auth, DB, Storage)
- **State**: Zustand
- **Language**: TypeScript

## 📝 開発

### スクリプト

- `npm start` - Expo開発サーバーを起動
- `npm test` - テストを実行
- `npm run lint` - ESLintでコードをチェック

## 📄 ライセンス

Private
