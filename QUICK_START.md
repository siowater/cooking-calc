# クイックスタートガイド

## Expoアプリの起動方法

### 1. 環境変数の確認

`.env`ファイルが正しく設定されているか確認してください：

```env
EXPO_PUBLIC_SUPABASE_URL=https://spjwjbtvholpiwzceaot.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qOKCEDbzSVWdYhH6dmMDTw_Uv78mQ3z
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Expo開発サーバーの起動

```bash
npm start
```

または

```bash
npx expo start
```

### 4. アプリの実行

#### Expo Goアプリを使用する場合（基本機能のみ）

1. スマートフォンに「Expo Go」アプリをインストール
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Expo Goアプリを起動
3. アプリ内の「Scan QR code」または「QRコードをスキャン」ボタンをタップ
4. ターミナルに表示されているQRコードをスキャン
   - **重要**: カメラアプリではなく、Expo Goアプリ内のスキャナーを使用してください
5. アプリがExpo Go内で起動します

**詳細は [Expo Goガイド](./EXPO_GO_GUIDE.md) を参照してください。**

**注意**: Expo Goでは、カメラ機能（Vision Camera）は使用できません。開発ビルドが必要です。

#### 開発ビルドを使用する場合（全機能）

1. EAS Buildで開発ビルドを作成：
   ```bash
   eas build --profile development --platform android
   # または
   eas build --profile development --platform ios
   ```

2. ビルド完了後、実機にインストール
3. 開発ビルドアプリを起動してQRコードをスキャン

### 5. 動作確認

アプリ起動後、以下を確認してください：

1. **Supabase接続確認**: 起動時に自動的に接続テストが実行されます
2. **レシピ一覧画面**: 保存済みレシピが表示されます
3. **カメラ画面**: 「スキャン」タブでOCR機能をテスト（モックデータ）
4. **レシピ編集画面**: 「編集」タブでスケーリング機能をテスト

## トラブルシューティング

### 環境変数が読み込まれない

- `.env`ファイルがプロジェクトルートにあるか確認
- 環境変数名が`EXPO_PUBLIC_`で始まっているか確認
- アプリを再起動（`expo start -c`でキャッシュクリア）

### Supabase接続エラー

- `.env`ファイルの設定を確認
- Supabaseプロジェクトがアクティブか確認
- ネットワーク接続を確認

### アプリが起動しない

- `npm install`を実行して依存関係を再インストール
- `expo start -c`でキャッシュをクリアして再起動
- `node_modules`を削除して再インストール

## 次のステップ

- [開発環境セットアップガイド](./docs/setup-guide.md)を参照
- [Supabase設定ガイド](./docs/supabase-setup.md)を参照
- [要件定義書](./docs/requirements.md)を参照
