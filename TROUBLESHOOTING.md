# トラブルシューティングガイド

## "there was a problem running the requested app" エラー

このエラーが発生した場合、以下の手順で解決してください。

### 1. キャッシュのクリア

```bash
npx expo start --clear
```

### 2. ポートが使用されている場合

別のポートを使用：

```bash
npx expo start --clear --port 8083
```

または、使用中のポートを解放：

```powershell
# PowerShellで実行
Get-NetTCPConnection -LocalPort 8081 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### 3. 環境変数の確認

`.env`ファイルが正しく設定されているか確認：

```env
EXPO_PUBLIC_SUPABASE_URL=https://spjwjbtvholpiwzceaot.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qOKCEDbzSVWdYhH6dmMDTw_Uv78mQ3z
```

### 4. 依存関係の再インストール

```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

### 5. Expo Routerの問題

`src/app`フォルダが存在しないのにExpo Routerが検出される場合：

- `.expo`フォルダを削除
- `node_modules/.cache`を削除
- 再度`npx expo start --clear`を実行

### 6. エラーログの確認

ターミナルに表示されるエラーメッセージを確認し、具体的な問題を特定してください。

## よくある問題

### 環境変数が読み込まれない

- `.env`ファイルがプロジェクトルートにあるか確認
- `app.config.js`で`require('dotenv').config()`が呼ばれているか確認
- 環境変数名が`EXPO_PUBLIC_`で始まっているか確認

### モジュールが見つからない

- `npm install`を実行
- `node_modules`を削除して再インストール
- TypeScriptの型定義が不足している場合は`npm install --save-dev @types/パッケージ名`

### ナビゲーションエラー

- React Navigationの依存関係が正しくインストールされているか確認
- `react-native-screens`と`react-native-safe-area-context`がインストールされているか確認
