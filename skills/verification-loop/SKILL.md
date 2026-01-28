これもおねがいします

---

## name: verification-loop description: Comprehensive verification phases for build, type checking, linting, testing, security, and diff review to ensure code quality.

# 検証ループスキル (Verification Loop Skill)

Cursorセッションのための包括的な検証システム。

## 使用タイミング (When to Use)

このスキルを呼び出すタイミング：

* 機能の実装や重要なコード変更の完了後
* PRを作成する前
* 品質ゲートの通過を確認したいとき
* リファクタリング後

## 検証フェーズ (Verification Phases)

### フェーズ 1: ビルド検証

```bash
# プロジェクトがビルドできるか確認
npm run build 2>&1 | tail -20
# または
pnpm build 2>&1 | tail -20

```

ビルドが失敗した場合、**停止**して修正してから続行してください。

### フェーズ 2: 型チェック

```bash
# TypeScriptプロジェクト
npx tsc --noEmit 2>&1 | head -30

# Pythonプロジェクト
pyright . 2>&1 | head -30

```

すべての型エラーを報告します。続行する前に重大なエラーを修正してください。

### フェーズ 3: リントチェック

```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30

```

### フェーズ 4: テストスイート

```bash
# カバレッジ付きでテストを実行
npm run test -- --coverage 2>&1 | tail -50

# カバレッジ閾値を確認
# 目標: 最低80%

```

報告内容：

* テスト総数: X
* 合格: X
* 失敗: X
* カバレッジ: X%

### フェーズ 5: セキュリティスキャン

```bash
# シークレットのチェック
grep -rn "sk-" --include="*.ts" --include="*.js" . 2>/dev/null | head -10
grep -rn "api_key" --include="*.ts" --include="*.js" . 2>/dev/null | head -10

# console.log のチェック
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -10

```

### フェーズ 6: 差分レビュー

```bash
# 何が変更されたかを表示
git diff --stat
git diff HEAD~1 --name-only

```

変更された各ファイルについて以下を確認します：

* 意図しない変更
* 欠落しているエラーハンドリング
* 潜在的なエッジケース

## 出力フォーマット (Output Format)

すべてのフェーズを実行した後、検証レポートを作成します：

```
VERIFICATION REPORT (検証レポート)
==================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X エラー)
Lint:      [PASS/FAIL] (X 警告)
Tests:     [PASS/FAIL] (X/Y 通過, Z% カバレッジ)
Security:  [PASS/FAIL] (X 問題点)
Diff:      [X ファイル変更]

全体:       PRの準備 [READY/NOT READY]

修正すべき問題:
1. ...
2. ...

```

## 継続モード (Continuous Mode)

長いセッションの場合、15分ごと、または大きな変更の後に検証を実行します：

```markdown
メンタルチェックポイントを設定:
- 各関数の完了後
- コンポーネントの完了後
- 次のタスクに移る前

実行: /verify

```

## フックとの統合 (Integration with Hooks)

このスキルは PostToolUse フックを補完しますが、より深い検証を提供します。
フックは問題を即座に捕捉しますが、このスキルは包括的なレビューを提供します。


