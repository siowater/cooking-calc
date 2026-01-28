# エラー解決手順

## 現在のエラー

ターミナルに表示されているエラーを解決するための手順です。

## 解決手順

### ステップ1: 開発サーバーを停止

現在実行中の`npm start`または`npm run start:tunnel:clear`を停止してください（`Ctrl+C`）。

### ステップ2: 完全にキャッシュをクリア

以下のコマンドを順番に実行してください：

```powershell
# .expoフォルダを削除
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# node_modules/.cacheを削除
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Metro Bundlerのキャッシュを削除
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue
```

### ステップ3: ファイルの存在確認

以下のコマンドで、必要なファイルが存在するか確認：

```powershell
# recipeStore.tsが存在するか確認
Test-Path src\stores\recipeStore.ts

# すべての必要なファイルを確認
Test-Path src\stores\recipeStore.ts
Test-Path src\types\recipe.ts
Test-Path src\utils\calculations.ts
Test-Path src\services\supabase\recipes.ts
```

### ステップ4: トンネルモードでキャッシュをクリアして再起動

```bash
npm run start:tunnel:clear
```

### ステップ5: それでも解決しない場合

依存関係を再インストール：

```powershell
# node_modulesを削除
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# package-lock.jsonを削除（存在する場合）
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 依存関係を再インストール
npm install --legacy-peer-deps

# トンネルモードでキャッシュをクリアして起動
npm run start:tunnel:clear
```

## よくあるエラーと解決方法

### エラー1: "Unable to resolve module"

**原因**: Metro Bundlerがモジュールを見つけられない

**解決方法**:
1. キャッシュをクリア（上記のステップ2）
2. ファイルが存在するか確認（ステップ3）
3. 依存関係を再インストール（ステップ5）

### エラー2: "Cannot find module"

**原因**: ファイルパスの問題

**解決方法**:
1. インポートパスが正しいか確認
2. ファイルが存在するか確認
3. キャッシュをクリア

### エラー3: "TypeError: Cannot read property"

**原因**: コードの実行時エラー

**解決方法**:
1. エラーメッセージのファイル名と行番号を確認
2. 該当するコードを確認
3. ターミナルに表示されるエラーログを確認

## エラーログの確認方法

ターミナルに表示されるエラーメッセージを確認してください：

1. **エラーの種類**（例: "Unable to resolve", "TypeError"）
2. **ファイル名と行番号**（例: "RecipeListScreen.tsx:11"）
3. **エラーメッセージの全文**

これらの情報を共有していただければ、より具体的な解決策を提案できます。

## 次のステップ

1. 上記の手順を実行
2. エラーが解決しない場合、ターミナルのエラーメッセージ全文を共有してください
