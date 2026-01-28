# Development Build ガイド

## ⚠️ 重要な注意点

**Vision Camera と Skia を使用する場合、標準のExpo Goアプリでは動作しません。**

このプロジェクトでは以下のネイティブモジュールを使用するため、**Development Build（カスタムビルド）が必要**です：

- **react-native-vision-camera v4**: カメラ機能
- **@bear-block/vision-camera-ocr**: ML Kit OCR
- **@shopify/react-native-skia**: ARオーバーレイ描画

## Development Build とは

Development Buildは、Expo Goの代わりに使用するカスタムビルドです。ネイティブモジュールを含むアプリを開発・テストできます。

### Expo Goとの違い

| 機能 | Expo Go | Development Build |
|------|---------|-------------------|
| 標準Expo API | ✅ | ✅ |
| カスタムネイティブモジュール | ❌ | ✅ |
| Vision Camera | ❌ | ✅ |
| Skia | ❌ | ✅ |
| ビルド時間 | 不要（即座に使用可能） | 必要（15-30分） |
| インストール | App Store/Play Storeから | ビルド後に手動インストール |

## Development Build の作成手順

### 1. EAS CLIのインストール

```bash
npm install -g eas-cli
```

### 2. EASアカウントにログイン

```bash
eas login
```

Expoアカウントがない場合は、[expo.dev](https://expo.dev)でアカウントを作成してください。

### 3. プロジェクトの初期化

```bash
eas init
```

### 4. eas.jsonの作成

プロジェクトルートに`eas.json`を作成：

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 5. app.config.jsの更新

`plugins`セクションにVision CameraとSkiaのプラグインを追加（後で実装時に追加）：

```javascript
plugins: [
  [
    "react-native-vision-camera",
    {
      cameraPermissionText: "レシピをスキャンするためにカメラへのアクセスが必要です。"
    }
  ]
]
```

### 6. Development Buildの作成

#### Android用

```bash
eas build --profile development --platform android
```

#### iOS用（Macが必要、またはEAS Buildを使用）

```bash
eas build --profile development --platform ios
```

**注意**: Windows環境では、iOSビルドはEAS Build（クラウドビルド）を使用する必要があります。

### 7. ビルドの完了を待つ

- ビルドには15-30分かかります
- ビルドが完了すると、ダウンロードリンクが表示されます
- EAS Buildダッシュボード（https://expo.dev）でも確認できます

### 8. 実機にインストール

#### Android (.apk)

1. ビルド完了後、`.apk`ファイルをダウンロード
2. Androidデバイスに転送
3. デバイスの設定で「提供元不明のアプリ」を許可
4. `.apk`ファイルをタップしてインストール

#### iOS (.app)

1. ビルド完了後、`.app`ファイルをダウンロード
2. XcodeまたはApple Configurator 2を使用してインストール
3. または、TestFlight経由で配布

### 9. Development Buildアプリを起動

1. インストールしたDevelopment Buildアプリを起動
2. アプリ内に「Scan QR code」または「QRコードをスキャン」画面が表示されます
3. PCのターミナルに表示されているQRコードをスキャン
4. 開発中の最新コードが反映されます

## 現在の状態での推奨アプローチ

### フェーズ1: 基本機能の動作確認（現在）

**Expo Goで動作確認できる機能**:
- ✅ レシピ一覧画面
- ✅ レシピ編集画面（スケーリング計算）
- ✅ 設定画面
- ✅ Supabase連携

**Expo Goで動作しない機能**:
- ❌ カメラ機能（Vision Camera）
- ❌ ARオーバーレイ（Skia）
- ❌ OCR機能（ML Kit）

### フェーズ2: ネイティブ機能の実装

Vision CameraとSkiaを実装する前に、Development Buildを作成：

1. `eas.json`を作成
2. 必要なパッケージをインストール
3. Development Buildを作成
4. 実機にインストール
5. ネイティブ機能を実装・テスト

## コスト

- **EAS Build**: 無料プランでも月に30ビルドまで可能
- **Development Build**: 開発中は何度でも再ビルド可能（無料プランでも）

## トラブルシューティング

### ビルドが失敗する場合

1. `eas.json`の設定を確認
2. `app.config.js`の設定を確認
3. 必要なプラグインが追加されているか確認
4. EAS Buildダッシュボードでエラーログを確認

### アプリがインストールできない場合

**Android**:
- 「提供元不明のアプリ」の許可を確認
- デバイスのストレージ容量を確認

**iOS**:
- 開発者証明書が正しく設定されているか確認
- デバイスのUDIDが登録されているか確認

## 参考資料

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Development Builds Guide](https://docs.expo.dev/development/introduction/)
- [Vision Camera Setup](https://react-native-vision-camera.com/docs/guides)
- [React Native Skia Setup](https://shopify.github.io/react-native-skia/docs/getting-started/installation)
