# オーケストレートコマンド (Orchestrate Command)

複雑なタスクのための連続的なエージェントワークフローを実行します。

## 使用法

`/orchestrate [workflow-type] [task-description]`

## ワークフロータイプ

### feature (機能開発)

完全な機能実装ワークフロー：

```
planner -> tdd-guide -> code-reviewer -> security-reviewer

```

### bugfix (バグ修正)

バグ調査と修正ワークフロー：

```
explorer -> tdd-guide -> code-reviewer

```

### refactor (リファクタリング)

安全なリファクタリングワークフロー：

```
architect -> code-reviewer -> tdd-guide

```

### security (セキュリティ)

セキュリティに焦点を当てたレビュー：

```
security-reviewer -> code-reviewer -> architect

```

## 実行パターン

ワークフロー内の各エージェントについて：

1. 前のエージェントからのコンテキストを使用して**エージェントを呼び出す**
2. 出力を構造化されたハンドオフドキュメントとして**収集する**
3. チェーン内の**次のエージェントに渡す**
4. 結果を最終レポートに**集約する**

## ハンドオフドキュメントフォーマット

エージェント間で、ハンドオフドキュメントを作成します：

```markdown
## HANDOFF: [previous-agent] -> [next-agent]

### Context
[何が行われたかの要約]

### Findings
[主要な発見や決定事項]

### Files Modified
[変更されたファイルのリスト]

### Open Questions
[次のエージェントへの未解決事項]

### Recommendations
[提案される次のステップ]

```

## 例: Feature ワークフロー

```
/orchestrate feature "Add user authentication"

```

実行内容:

1. **Planner Agent**
* 要件を分析する
* 実装計画を作成する
* 依存関係を特定する
* 出力: `HANDOFF: planner -> tdd-guide`


2. **TDD Guide Agent**
* プランナーのハンドオフを読み取る
* 最初にテストを書く
* テストに通るように実装する
* 出力: `HANDOFF: tdd-guide -> code-reviewer`


3. **Code Reviewer Agent**
* 実装をレビューする
* 問題点をチェックする
* 改善を提案する
* 出力: `HANDOFF: code-reviewer -> security-reviewer`


4. **Security Reviewer Agent**
* セキュリティ監査
* 脆弱性チェック
* 最終承認
* 出力: 最終レポート



## 最終レポートフォーマット

```
ORCHESTRATION REPORT
====================
Workflow: feature
Task: Add user authentication
Agents: planner -> tdd-guide -> code-reviewer -> security-reviewer

SUMMARY
-------
[1段落の要約]

AGENT OUTPUTS
-------------
Planner: [要約]
TDD Guide: [要約]
Code Reviewer: [要約]
Security Reviewer: [要約]

FILES CHANGED
-------------
[変更された全ファイルのリスト]

TEST RESULTS
------------
[テスト通過/失敗の要約]

SECURITY STATUS
---------------
[セキュリティ上の発見事項]

RECOMMENDATION
--------------
[SHIP (出荷) / NEEDS WORK (要修正) / BLOCKED (ブロック)]

```

## 並列実行

独立したチェックの場合、エージェントを並列に実行します：

```markdown
### Parallel Phase
同時に実行:
- code-reviewer (品質)
- security-reviewer (セキュリティ)
- architect (設計)

### Merge Results
出力を単一のレポートに結合する

```

## 引数

$ARGUMENTS:

* `feature <description>` - 完全な機能ワークフロー
* `bugfix <description>` - バグ修正ワークフロー
* `refactor <description>` - リファクタリングワークフロー
* `security <description>` - セキュリティレビューワークフロー
* `custom <agents> <description>` - カスタムエージェントシーケンス

## カスタムワークフローの例

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"

```

## ヒント

1. 複雑な機能については **planner** から始める
2. マージ前には必ず **code-reviewer** を含める
3. 認証/支払い/PII（個人情報）については **security-reviewer** を使用する
4. ハンドオフは簡潔に保つ - 次のエージェントが必要とするものに焦点を当てる
5. 必要に応じてエージェント間で検証を実行する


