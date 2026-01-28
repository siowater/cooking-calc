# エラーデバッグガイド

## "there was a problem running the requested app" エラーの対処

### 1. エラーログの確認方法

ターミナルに表示されるエラーメッセージを確認してください。以下のような情報が表示されます：

```
ERROR  Error: ...
```

### 2. よくある原因と解決方法

#### 原因1: インポートエラー

**症状**: `Unable to resolve module` エラー

**解決方法**:
```bash
npm install --legacy-peer-deps
npx expo start --clear
```

#### 原因2: 型エラー

**症状**: TypeScriptの型エラー

**解決方法**:
- `tsconfig.json`の設定を確認
- 型定義ファイルが不足している場合はインストール

#### 原因3: ナビゲーションエラー

**症状**: `navigation is undefined` エラー

**解決方法**:
- ナビゲーションのnullチェックを追加（既に実装済み）

#### 原因4: Supabase接続エラー

**症状**: Supabaseへの接続に失敗

**解決方法**:
- `.env`ファイルの設定を確認
- ネットワーク接続を確認
- アプリはオフラインでも動作するように修正済み

### 3. デバッグ手順

1. **ターミナルのエラーメッセージを確認**
   - 赤い文字で表示されるエラーを探す
   - `ERROR`で始まる行を確認

2. **エラーメッセージをコピー**
   - エラーメッセージ全体をコピー
   - 特に`Unable to resolve`や`Cannot find module`などのメッセージ

3. **該当するファイルを確認**
   - エラーメッセージにファイル名が含まれている場合、そのファイルを確認

### 4. 簡易テスト

アプリが起動するか確認するため、最小限のコードでテスト：

```typescript
// App.tsxを最小限に
export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello World</Text>
    </View>
  )
}
```

これで起動する場合は、段階的に機能を追加して問題箇所を特定します。

### 5. ログの確認

Expo Goアプリでエラーが発生した場合：
1. デバイスをシェイク
2. 「Debug Remote JS」を選択
3. Chrome DevToolsでエラーを確認
