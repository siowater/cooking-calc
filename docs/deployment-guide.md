# デプロイメントガイド：Baker's Lens

## 1. デプロイメント概要

Baker's Lensは、EAS Buildを使用してiOS/Androidアプリをビルド・配布します。

### 1.1 デプロイメント環境

- **ビルド**: EAS Build（クラウドビルド）
- **配布**: App Store（iOS）、Google Play Store（Android）
- **開発環境**: Windows OS（ローカルビルドは不可）

### 1.2 デプロイメントフロー

```
開発 → EAS Build → テスト → ストア申請 → リリース
```

## 2. EAS Buildの設定

### 2.1 EASアカウントの準備

```bash
# EAS CLIのインストール
npm install -g eas-cli

# ログイン
eas login
```

### 2.2 プロジェクトの初期化

```bash
# プロジェクトディレクトリで実行
eas init
```

### 2.3 eas.jsonの設定

`eas.json`ファイルを作成・編集：

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
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
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
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 2.4 app.jsonの設定

`app.json`ファイルを確認・編集：

```json
{
  "expo": {
    "name": "Baker's Lens",
    "slug": "bakers-lens",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.bakerslens",
      "infoPlist": {
        "NSCameraUsageDescription": "レシピをスキャンするためにカメラへのアクセスが必要です。",
        "NSPhotoLibraryUsageDescription": "レシピ画像を保存するためにフォトライブラリへのアクセスが必要です。"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.bakerslens",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "レシピをスキャンするためにカメラへのアクセスが必要です。"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## 3. 環境変数の管理

### 3.1 EAS Secretsの設定

機密情報はEAS Secretsで管理：

```bash
# Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"

# その他の環境変数
eas secret:create --scope project --name EXPO_PUBLIC_EAS_PROJECT_ID --value "your-project-id"
```

### 3.2 環境変数の確認

```bash
eas secret:list
```

## 4. ビルドプロファイル

### 4.1 Development Build

開発用ビルド（カメラ機能を含む全機能が使用可能）：

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android

# 両方
eas build --profile development --platform all
```

### 4.2 Preview Build

内部テスト用ビルド：

```bash
eas build --profile preview --platform all
```

### 4.3 Production Build

本番用ビルド：

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

## 5. iOSデプロイメント

### 5.1 App Store Connectの設定

1. [App Store Connect](https://appstoreconnect.apple.com)にログイン
2. 新しいアプリを作成
3. Bundle IDを設定
4. アプリ情報を入力

### 5.2 証明書とプロビジョニングプロファイル

EAS Buildが自動的に管理しますが、手動設定も可能：

```bash
# 証明書の確認
eas credentials

# 証明書の再生成（必要に応じて）
eas credentials --platform ios
```

### 5.3 ビルドの実行

```bash
eas build --profile production --platform ios
```

### 5.4 App Storeへの提出

```bash
eas submit --platform ios
```

または、App Store Connectから手動でアップロード。

## 6. Androidデプロイメント

### 6.1 Google Play Consoleの設定

1. [Google Play Console](https://play.google.com/console)にログイン
2. 新しいアプリを作成
3. アプリ情報を入力
4. サービスアカウントキーを取得

### 6.2 サービスアカウントキーの設定

1. Google Cloud Consoleでサービスアカウントを作成
2. JSONキーをダウンロード
3. `eas.json`の`submit.production.android.serviceAccountKeyPath`にパスを設定

### 6.3 ビルドの実行

```bash
eas build --profile production --platform android
```

### 6.4 Google Playへの提出

```bash
eas submit --platform android
```

## 7. ビルドの監視

### 7.1 ビルドステータスの確認

```bash
# 最新のビルドを確認
eas build:list

# 特定のビルドの詳細を確認
eas build:view [BUILD_ID]
```

### 7.2 ビルドログの確認

EAS Buildダッシュボードからログを確認：
https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

## 8. バージョン管理

### 8.1 バージョン番号の更新

`app.json`の`version`フィールドを更新：

```json
{
  "expo": {
    "version": "1.0.1"
  }
}
```

### 8.2 ビルド番号の自動インクリメント

`eas.json`で`autoIncrement`を有効化：

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 8.3 手動でのビルド番号指定

```bash
eas build --profile production --platform ios --build-number 10
```

## 9. リリース前チェックリスト

### 9.1 機能チェック

- [ ] 全機能が動作する
- [ ] OCRが正確に動作する
- [ ] 計算ロジックが正確
- [ ] ARオーバーレイが60FPSで描画される
- [ ] オフライン動作が確認できる

### 9.2 パフォーマンスチェック

- [ ] アプリ起動時間が3秒以内
- [ ] メモリリークがない
- [ ] バッテリー消費が適切
- [ ] ネットワーク使用量が適切

### 9.3 セキュリティチェック

- [ ] 環境変数が正しく設定されている
- [ ] 機密情報がコードに含まれていない
- [ ] RLSポリシーが正しく設定されている
- [ ] ストレージのアクセス権限が適切

### 9.4 UI/UXチェック

- [ ] 全画面が正しく表示される
- [ ] エラーメッセージが適切に表示される
- [ ] アクセシビリティが確保されている
- [ ] 多言語対応（将来の拡張）

### 9.5 ドキュメントチェック

- [ ] READMEが最新
- [ ] 変更履歴が更新されている
- [ ] ライセンス情報が正しい

## 10. ロールバック手順

### 10.1 ビルドのロールバック

1. 前のバージョンのビルドを特定
2. App Store Connect / Google Play Consoleで前のバージョンに戻す
3. ユーザーに通知（必要に応じて）

### 10.2 データベースのロールバック

Supabaseのバックアップから復元：

1. Supabaseダッシュボードでバックアップを確認
2. ポイントインタイムリカバリ（PITR）を使用
3. データの整合性を確認

## 11. モニタリング

### 11.1 クラッシュレポート

Sentryなどのクラッシュレポートツールを統合：

```bash
npm install @sentry/react-native
```

### 11.2 アナリティクス

Expo AnalyticsまたはFirebase Analyticsを統合してユーザー行動を追跡。

### 11.3 パフォーマンスモニタリング

- アプリ起動時間
- 画面遷移時間
- APIレスポンス時間
- エラー率

## 12. 継続的デプロイメント（CI/CD）

### 12.1 GitHub Actionsの設定

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --profile production --platform all --non-interactive
      - run: eas submit --platform all --non-interactive
```

### 12.2 自動デプロイメントのトリガー

- `main`ブランチへのマージ時に自動ビルド
- タグ作成時に自動リリース

## 13. トラブルシューティング

### 13.1 ビルドエラー

**問題**: ビルドが失敗する

**解決策**:
1. ビルドログを確認
2. 依存関係のバージョンを確認
3. `eas.json`の設定を確認
4. EAS Buildのステータスを確認

### 13.2 証明書エラー

**問題**: iOS証明書のエラー

**解決策**:
```bash
eas credentials --platform ios
```

### 13.3 ストア申請の却下

**問題**: App Store / Google Playで申請が却下される

**解決策**:
1. 却下理由を確認
2. プライバシーポリシーを追加（必要に応じて）
3. アプリ説明を更新
4. スクリーンショットを追加

## 14. 参考資料

### 14.1 公式ドキュメント

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

### 14.2 プロジェクト内ドキュメント

- `docs/requirements.md`: 要件定義書
- `docs/architecture.md`: アーキテクチャ設計書
- `docs/setup-guide.md`: 開発環境セットアップガイド

## 15. サポート

デプロイメントに関する質問や問題がある場合は、以下を確認：

1. EAS Buildダッシュボードのログ
2. Expo公式フォーラム
3. プロジェクトのIssueトラッカー
