# セキュリティガイドライン (Security Guidelines)

## 必須セキュリティチェック (Mandatory Security Checks)

「いかなる」コミットの前にも以下を確認してください：

* [ ] ハードコードされたシークレット（APIキー、パスワード、トークン）がないこと
* [ ] すべてのユーザー入力が検証されていること
* [ ] SQLインジェクション防止（パラメータ化されたクエリの使用）
* [ ] XSS防止（HTMLのサニタイズ）
* [ ] CSRF保護が有効になっていること
* [ ] 認証/認可が検証されていること
* [ ] すべてのエンドポイントでレート制限（Rate limiting）が行われていること
* [ ] エラーメッセージが機密データを漏洩していないこと

## シークレット管理 (Secret Management)

```typescript
// NEVER: ハードコードされたシークレット
const apiKey = "sk-proj-xxxxx"

// ALWAYS: 環境変数を使用する
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}

```

## セキュリティ対応プロトコル (Security Response Protocol)

セキュリティ問題が見つかった場合：

1. 直ちに作業を停止する
2. **security-reviewer** エージェントを使用する
3. 作業を続行する前に CRITICAL（重大）な問題を修正する
4. 露出したシークレットがあればローテーション（変更）する
5. 同様の問題がないかコードベース全体をレビューする

