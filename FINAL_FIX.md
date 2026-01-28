# 最終的なエラー解決手順

## エラー内容

```
Unable to resolve "../../stores/recipeStore" from "src\screens\SettingsScreen.tsx"
```

## 実施した修正

1. ✅ すべてのキャッシュをクリア
2. ✅ Metro設定ファイルを簡素化
3. ✅ `src/stores/index.ts`を作成（再エクスポート用）

## 次のステップ

### 方法1: インポートパスを変更（推奨）

`SettingsScreen.tsx`のインポートパスを変更：

```typescript
// 変更前
import { useRecipeStore } from '../../stores/recipeStore'

// 変更後（index.tsを使用）
import { useRecipeStore } from '../../stores'
```

または、拡張子を明示的に指定：

```typescript
import { useRecipeStore } from '../../stores/recipeStore.ts'
```

### 方法2: 開発サーバーを完全に再起動

1. **すべてのNodeプロセスを停止**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

2. **すべてのキャッシュをクリア**
   ```powershell
   Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue
   ```

3. **依存関係を再インストール**
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   npm install --legacy-peer-deps
   ```

4. **トンネルモードでキャッシュをクリアして起動**
   ```bash
   npm run start:tunnel:clear
   ```

### 方法3: ファイル拡張子を明示的に指定

すべてのインポートで`.ts`拡張子を明示的に指定：

```typescript
import { useRecipeStore } from '../../stores/recipeStore.ts'
```

## 推奨される手順

1. **まず方法1を試す**（インポートパスを`../../stores`に変更）
2. **それでも解決しない場合、方法2を試す**（完全に再起動）
3. **それでも解決しない場合、方法3を試す**（拡張子を明示的に指定）

## 確認事項

以下のファイルが正しく存在することを確認しました：

- ✅ `src/stores/recipeStore.ts` - 存在する
- ✅ `src/stores/index.ts` - 作成済み
- ✅ `src/types/recipe.ts` - 存在する
- ✅ `src/utils/calculations.ts` - 存在する
- ✅ `zustand`パッケージ - インストール済み

## まとめ

最も可能性が高い解決方法は、**インポートパスを`../../stores`に変更**することです。これにより、`index.ts`経由でモジュールが解決されます。
