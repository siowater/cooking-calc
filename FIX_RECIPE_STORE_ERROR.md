# recipeStoreモジュール解決エラーの修正

## エラー内容

```
Unable to resolve "../../stores/recipeStore" from "src\screens\SettingsScreen.tsx"
```

## 実施した修正

### 1. キャッシュのクリア

以下のキャッシュをクリアしました：
- `.expo`フォルダ
- `node_modules/.cache`フォルダ

### 2. Metro設定ファイルの作成

`metro.config.js`を作成して、TypeScriptファイルの解決を改善しました。

## 次のステップ

### ステップ1: 開発サーバーを停止

現在実行中の`npm start`を停止してください（`Ctrl+C`）。

### ステップ2: トンネルモードでキャッシュをクリアして再起動

```bash
npm run start:tunnel:clear
```

### ステップ3: それでも解決しない場合

完全にクリアして再起動：

```powershell
# すべてのキャッシュを削除
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue

# トンネルモードでキャッシュをクリアして起動
npm run start:tunnel:clear
```

### ステップ4: それでも解決しない場合

依存関係を再インストール：

```powershell
# node_modulesを削除
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 依存関係を再インストール
npm install --legacy-peer-deps

# トンネルモードでキャッシュをクリアして起動
npm run start:tunnel:clear
```

## 確認事項

以下のファイルが正しく存在することを確認しました：

- ✅ `src/stores/recipeStore.ts` - 存在する
- ✅ `src/types/recipe.ts` - 存在する
- ✅ `src/utils/calculations.ts` - 存在する

## 原因

このエラーは、Metro Bundlerのキャッシュが原因である可能性が高いです。キャッシュをクリアすることで解決するはずです。

## まとめ

1. ✅ キャッシュをクリア済み
2. ✅ Metro設定ファイルを作成済み
3. 🔄 開発サーバーを再起動してください
