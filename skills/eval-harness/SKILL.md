# Evalハーネススキル (Eval Harness Skill)

Cursorセッションのための公式な評価フレームワークであり、評価駆動開発 (Eval-Driven Development: EDD) の原則を実装します。

## 哲学 (Philosophy)

評価駆動開発は、Eval（評価）を「AI開発のユニットテスト」として扱います：

- 実装の「前」に期待される動作を定義する
- 開発中に継続的にEvalを実行する
- 変更ごとにリグレッション（回帰）を追跡する
- 信頼性測定のために pass@k メトリクスを使用する

## Evalタイプ (Eval Types)

### 能力評価 (Capability Evals)

cursorが以前はできなかったことができるようになったかテストします：

```markdown
[CAPABILITY EVAL: feature-name]
タスク: cursorが達成すべきことの説明
成功基準:

- [ ] 基準 1
- [ ] 基準 2
- [ ] 基準 3
      期待される出力: 期待される結果の説明
```

### 回帰評価 (Regression Evals)

変更が既存の機能を壊していないことを確認します：

```markdown
[REGRESSION EVAL: feature-name]
ベースライン: SHA またはチェックポイント名
テスト:

- existing-test-1: PASS/FAIL
- existing-test-2: PASS/FAIL
- existing-test-3: PASS/FAIL
  結果: X/Y 通過 (以前は Y/Y)
```

## グレーダータイプ (Grader Types)

### 1. コードベースグレーダー (Code-Based Grader)

コードを使用した決定論的なチェック：

```bash
# ファイルに期待されるパターンが含まれているか確認
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# テストが通過するか確認
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# ビルドが成功するか確認
npm run build && echo "PASS" || echo "FAIL"

```

### 2. モデルベースグレーダー (Model-Based Grader)

オープンエンドな（自由形式の）出力を評価するためにcursorを使用します：

```markdown
[MODEL GRADER PROMPT]
以下のコード変更を評価してください：

1. 提示された問題を解決しているか？
2. 構造は適切か？
3. エッジケースは処理されているか？
4. エラーハンドリングは適切か？

スコア: 1-5 (1=悪い, 5=素晴らしい)
理由: [説明]
```

### 3. 人間グレーダー (Human Grader)

手動レビューのためのフラグ：

```markdown
[HUMAN REVIEW REQUIRED]
変更: 何が変更されたかの説明
理由: なぜ人間によるレビューが必要なのか
リスクレベル: LOW/MEDIUM/HIGH
```

## メトリクス (Metrics)

### pass@k

「k回の試行のうち少なくとも1回成功する」

- pass@1: 初回試行の成功率
- pass@3: 3回以内の試行での成功
- 一般的な目標: 能力評価において pass@3 > 90%

### pass^k

「k回の試行すべてが成功する」

- より高い信頼性の基準
- pass^3: 3回連続の成功
- クリティカルパスに使用する

## Evalワークフロー (Eval Workflow)

### 1. 定義 (Define) - コーディング前

```markdown
## EVAL DEFINITION: feature-xyz

### 能力評価

1. 新しいユーザーアカウントを作成できる
2. メール形式を検証できる
3. パスワードを安全にハッシュ化できる

### 回帰評価

1. 既存のログインが機能する
2. セッション管理が変更されていない
3. ログアウトフローが無傷である

### 成功メトリクス

- 能力評価において pass@3 > 90%
- 回帰評価において pass^3 = 100%
```

### 2. 実装 (Implement)

定義されたEvalに合格するようにコードを書きます。

### 3. 評価 (Evaluate)

```bash
# 能力評価を実行
[各能力評価を実行し、PASS/FAILを記録]

# 回帰評価を実行
npm test -- --testPathPattern="existing"

# レポートを生成

```

### 4. 報告 (Report)

```markdown
# EVAL REPORT: feature-xyz

能力評価:
create-user: PASS (pass@1)
validate-email: PASS (pass@2)
hash-password: PASS (pass@1)
全体: 3/3 通過

回帰評価:
login-flow: PASS
session-mgmt: PASS
logout-flow: PASS
全体: 3/3 通過

メトリクス:
pass@1: 67% (2/3)
pass@3: 100% (3/3)

ステータス: READY FOR REVIEW (レビュー準備完了)
```

## 統合パターン (Integration Patterns)

### 実装前 (Pre-Implementation)

```
/eval define feature-name

```

`.cursor/evals/feature-name.md` にEval定義ファイルを作成します。

### 実装中 (During Implementation)

```
/eval check feature-name

```

現在のEvalを実行し、ステータスを報告します。

### 実装後 (Post-Implementation)

```
/eval report feature-name

```

完全なEvalレポートを生成します。

## Evalストレージ (Eval Storage)

プロジェクト内にEvalを保存します：

```
.cursor/
  evals/
    feature-xyz.md      # Eval定義
    feature-xyz.log     # Eval実行履歴
    baseline.json       # 回帰ベースライン

```

## ベストプラクティス (Best Practices)

1. **コーディングの「前」にEvalを定義する** - 成功基準について明確に考えることを強制します
2. **頻繁にEvalを実行する** - リグレッションを早期に発見します
3. **pass@k の推移を追跡する** - 信頼性の傾向を監視します
4. **可能な限りコードグレーダーを使用する** - 確率的 < 決定論的
5. **セキュリティには人間によるレビューを行う** - セキュリティチェックを完全に自動化しないでください
6. **Evalを高速に保つ** - 遅いEvalは実行されなくなります
7. **Evalをコードと共にバージョン管理する** - Evalはファーストクラスの成果物です

## 例: 認証の追加 (Adding Authentication)

```markdown
## EVAL: add-authentication

### フェーズ 1: 定義 (10分)

能力評価:

- [ ] ユーザーはメール/パスワードで登録できる
- [ ] ユーザーは有効な資格情報でログインできる
- [ ] 無効な資格情報は適切なエラーで拒否される
- [ ] セッションはページのリロード後も持続する
- [ ] ログアウトでセッションがクリアされる

回帰評価:

- [ ] パブリックルートは依然としてアクセス可能
- [ ] APIレスポンスは変更なし
- [ ] データベーススキーマは互換性がある

### フェーズ 2: 実装 (変動)

[コードを書く]

### フェーズ 3: 評価

実行: /eval check add-authentication

### フェーズ 4: 報告

# EVAL REPORT: add-authentication

能力評価: 5/5 通過 (pass@3: 100%)
回帰評価: 3/3 通過 (pass^3: 100%)
ステータス: SHIP IT (出荷)
```
