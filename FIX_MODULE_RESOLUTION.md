# モジュール解決エラーの修正方法

## エラー内容

```
Unable to resolve "../../stores/recipeStore" from "src\screens\RecipeListScreen.tsx"
```

## 解決方法

### 方法1: キャッシュをクリアして再起動（推奨）

1. **現在の開発サーバーを停止**
   - ターミナルで`Ctrl+C`を押す

2. **キャッシュをクリアして再起動**
   ```bash
   npm run start:clear
   ```
   または
   ```bash
   npx expo start --clear --port 8083
   ```

3. **それでも解決しない場合、完全にクリア**
   ```bash
   # .expoフォルダを削除
   Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
   
   # node_modules/.cacheを削除
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   
   # 再起動
   npm run start:clear
   ```

### 方法2: インポートパスを絶対パスに変更

`tsconfig.json`に`paths`が設定されているので、絶対パスを使用することもできます。

ただし、Metro Bundlerは`tsconfig.json`の`paths`を自動的に解決しないため、`babel.config.js`に設定を追加する必要があります。

### 方法3: ファイル拡張子を明示的に指定

インポートパスに`.ts`拡張子を追加：

```typescript
import { useRecipeStore } from '../../stores/recipeStore.ts'
```

ただし、これは通常推奨されません。

## 推奨される手順

1. **まず方法1を試す**（キャッシュクリア）
2. **それでも解決しない場合、方法2を試す**（絶対パス）

## トラブルシューティング

### エラーが続く場合

1. **ファイルが存在するか確認**
   ```bash
   Test-Path src\stores\recipeStore.ts
   ```

2. **ファイルの内容を確認**
   - `recipeStore.ts`が正しくエクスポートしているか確認

3. **依存関係を再インストール**
   ```bash
   npm install --legacy-peer-deps
   ```
