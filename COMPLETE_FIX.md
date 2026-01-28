# 完全なエラー修正

## 実施した修正

### 1. すべてのインポートパスを直接`recipeStore.ts`に戻しました

以下のファイルを修正：
- ✅ `src/screens/SettingsScreen.tsx`
- ✅ `src/screens/RecipeListScreen.tsx`
- ✅ `src/screens/RecipeEditScreen.tsx`
- ✅ `src/screens/CameraScreen.tsx`

すべてのファイルで：
```typescript
import { useRecipeStore } from '../../stores/recipeStore'
```

### 2. 不要な`index.ts`を削除

`src/stores/index.ts`を削除しました（Metro Bundlerが正しく解決できないため）。

### 3. Metro設定を確認

`metro.config.js`はデフォルト設定のままです。

## 次のステップ

### ステップ1: すべてのNodeプロセスを停止

```powershell
Get-Process node | Stop-Process -Force
```

### ステップ2: すべてのキャッシュを完全にクリア

```powershell
# .expoフォルダを削除
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# node_modules/.cacheを削除
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Metro Bundlerの一時ファイルを削除
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue

# watchmanキャッシュをクリア（存在する場合）
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    watchman watch-del-all
}
```

### ステップ3: 依存関係を再インストール

```powershell
# node_modulesを削除
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 依存関係を再インストール
npm install --legacy-peer-deps
```

### ステップ4: トンネルモードでキャッシュをクリアして起動

```bash
npm run start:tunnel:clear
```

## 確認事項

以下のファイルが正しく存在し、エクスポートも正しく行われていることを確認しました：

- ✅ `src/stores/recipeStore.ts` - 存在する、エクスポートも正しい
- ✅ `src/types/recipe.ts` - 存在する
- ✅ `src/utils/calculations.ts` - 存在する
- ✅ `zustand`パッケージ - インストール済み

## まとめ

1. ✅ すべてのインポートパスを直接`recipeStore.ts`に修正
2. ✅ 不要な`index.ts`を削除
3. 🔄 **すべてのキャッシュをクリアして再起動してください**

これで、Metro Bundlerが正しくモジュールを解決できるはずです。
