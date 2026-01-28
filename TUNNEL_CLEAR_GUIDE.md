# トンネルモードでキャッシュをクリアして起動

## コマンド

トンネルモードでキャッシュをクリアして起動するには、以下のコマンドを実行してください：

```bash
npm run start:tunnel:clear
```

または、直接実行：

```bash
npx expo start --tunnel --clear
```

## 手順

### ステップ1: 現在の開発サーバーを停止

ターミナルで`Ctrl+C`を押して、現在実行中の`npm start`を停止してください。

### ステップ2: トンネルモードでキャッシュをクリアして起動

```bash
npm run start:tunnel:clear
```

### ステップ3: QRコードまたはURLを確認

トンネルモードでは、以下のようなURLが表示されます：

```
› Metro waiting on exp://u.expo.dev/...
```

このURLでExpo Goアプリから接続してください。

## 完全にクリアする場合

それでも解決しない場合、完全にクリアしてから再起動：

```powershell
# .expoフォルダを削除
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# node_modules/.cacheを削除
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# トンネルモードでキャッシュをクリアして起動
npm run start:tunnel:clear
```

## まとめ

- ✅ **トンネルモード**: `npm run start:tunnel:clear`
- ✅ **通常モード**: `npm run start:clear`
- 🌐 **トンネルモードのメリット**: 同じWi-Fiに接続する必要がない
