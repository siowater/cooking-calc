# Expo SDK 54へのアップグレードガイド

## 変更内容

プロジェクトをExpo SDK 51からSDK 54にアップグレードしました。

### 主な変更点

- **Expo SDK**: 51 → 54
- **React Native**: 0.74.5 → 0.81.0
- **React**: 18.2.0 → 19.1.0
- **expo-constants**: ~16.0.2 → ~17.0.0
- **expo-status-bar**: ~1.12.1 → ~2.0.0
- **react-native-safe-area-context**: 4.10.5 → 4.12.0

## アップグレード手順

### ステップ1: 依存関係を更新

以下のコマンドを実行して、互換性のあるバージョンを自動的にインストールします：

```bash
npx expo install expo@latest --fix
```

このコマンドは、Expo SDK 54と互換性のあるすべてのパッケージバージョンを自動的に調整します。

### ステップ2: 依存関係を再インストール

```bash
npm install --legacy-peer-deps
```

### ステップ3: キャッシュをクリア

```bash
npx expo start --clear
```

## 重要な注意点

### React 19への変更

Expo SDK 54はReact 19を使用します。React 19にはいくつかの変更点がありますが、基本的なAPIは互換性があります。

### React Native 0.81への変更

React Native 0.81にはいくつかの変更がありますが、Expoが管理しているため、通常は問題ありません。

### 互換性の確認

アップグレード後、以下を確認してください：

1. **アプリが起動するか**
2. **既存の機能が動作するか**
3. **エラーが発生しないか**

## トラブルシューティング

### エラーが発生した場合

1. **node_modulesを削除して再インストール**
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

2. **キャッシュをクリア**
   ```bash
   npx expo start --clear
   ```

3. **Expo CLIを更新**
   ```bash
   npm install -g expo-cli@latest
   ```

### パッケージの互換性エラー

特定のパッケージで互換性エラーが発生した場合：

1. **Expoの公式コマンドを使用**
   ```bash
   npx expo install [パッケージ名]
   ```

2. **パッケージのバージョンを確認**
   - Expo SDK 54のドキュメントを確認
   - 互換性のあるバージョンをインストール

## 次のステップ

1. **依存関係を更新**（上記のコマンドを実行）
2. **アプリを起動して動作確認**
3. **エラーが発生した場合は、エラーメッセージを確認**

## 参考資料

- [Expo SDK 54 Documentation](https://docs.expo.dev/versions/v54.0.0/)
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [Upgrading Expo SDK Guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
