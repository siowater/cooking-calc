# エージェントオーケストレーション (Agent Orchestration)

## 利用可能なエージェント

`~/.cursor/agents/` に配置されています:

| エージェント | 目的 | 使用するタイミング |
| --- | --- | --- |
| planner | 実装計画 | 複雑な機能、リファクタリング |
| architect | システム設計 | アーキテクチャ上の決定 |
| tdd-guide | テスト駆動開発 | 新機能、バグ修正 |
| code-reviewer | コードレビュー | コードを書いた後 |
| security-reviewer | セキュリティ分析 | コミット前 |
| build-error-resolver | ビルドエラー修正 | ビルド失敗時 |
| e2e-runner | E2Eテスト | 重要なユーザーフロー |
| refactor-cleaner | デッドコードのクリーンアップ | コード保守 |
| doc-updater | ドキュメンテーション | ドキュメント更新時 |

## 即時のエージェント使用

ユーザープロンプトは不要です：

1. 複雑な機能リクエスト - **planner** エージェントを使用
2. コードを書いた/修正した直後 - **code-reviewer** エージェントを使用
3. バグ修正または新機能 - **tdd-guide** エージェントを使用
4. アーキテクチャ上の決定 - **architect** エージェントを使用

## 並列タスク実行

独立した操作には「常に」並列タスク実行を使用してください：

```markdown
# GOOD: 並列実行
3つのエージェントを並列に起動:
1. Agent 1: auth.ts のセキュリティ分析
2. Agent 2: キャッシュシステムのパフォーマンスレビュー
3. Agent 3: utils.ts の型チェック

# BAD: 不必要な順次実行
まずエージェント1、次にエージェント2、そしてエージェント3

```

## 多角的分析

複雑な問題については、役割を分担したサブエージェントを使用してください：

* 事実確認レビュアー (Factual reviewer)
* シニアエンジニア (Senior engineer)
* セキュリティ専門家 (Security expert)
* 一貫性レビュアー (Consistency reviewer)
* 冗長性チェッカー (Redundancy checker)


