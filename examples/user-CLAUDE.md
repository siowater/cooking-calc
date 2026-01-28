
# ユーザーレベル .cursorrules 例 (User-Level .cursorrules Example)

これはユーザーレベルの `.cursorrules` ファイルの例です。`~/.cursor/.cursorrules` に配置してください。

ユーザーレベルの設定は、すべてのプロジェクトにグローバルに適用されます。以下の用途に使用します：

* 個人のコーディング設定
* 常に強制したい普遍的なルール
* モジュール化されたルールへのリンク

---

## コア哲学 (Core Philosophy)

あなたは Cursor です。私は複雑なタスクのために専門のエージェントとスキルを使用します。

**主要原則:**

1. **エージェントファースト (Agent-First)**: 複雑な作業は専門のエージェントに委任する
2. **並列実行 (Parallel Execution)**: 可能な限り、複数のエージェントで Task ツールを使用する
3. **実行前に計画 (Plan Before Execute)**: 複雑な操作には Plan Mode を使用する
4. **テスト駆動 (Test-Driven)**: 実装の前にテストを書く
5. **セキュリティファースト (Security-First)**: セキュリティに関しては決して妥協しない

---

## モジュール化されたルール (Modular Rules)

詳細なガイドラインは `~/.cursor/rules/` にあります：

| ルールファイル | 内容 |
| --- | --- |
| security.md | セキュリティチェック、シークレット管理 |
| coding-style.md | 不変性、ファイル構成、エラーハンドリング |
| testing.md | TDDワークフロー、80%カバレッジ要件 |
| git-workflow.md | コミットフォーマット、PRワークフロー |
| agents.md | エージェントオーケストレーション、どのエージェントをいつ使うか |
| patterns.md | APIレスポンス、リポジトリパターン |
| performance.md | モデル選択、コンテキスト管理 |

---

## 利用可能なエージェント (Available Agents)

`~/.cursor/agents/` に配置されています：

| エージェント | 目的 |
| --- | --- |
| planner | 機能実装計画 |
| architect | システム設計とアーキテクチャ |
| tdd-guide | テスト駆動開発 |
| code-reviewer | 品質/セキュリティのためのコードレビュー |
| security-reviewer | セキュリティ脆弱性分析 |
| build-error-resolver | ビルドエラー解決 |
| e2e-runner | Playwright E2Eテスト |
| refactor-cleaner | デッドコードのクリーンアップ |
| doc-updater | ドキュメント更新 |

---

## 個人の好み (Personal Preferences)

### コードスタイル

* コード、コメント、ドキュメントに絵文字を使用しない
* 不変性を好む - オブジェクトや配列を決して変更（mutate）しない
* 少数の大きなファイルより、多数の小さなファイル
* 通常200〜400行、最大800行

### Git

* Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
* コミットする前に必ずローカルでテストする
* 小さく、焦点を絞ったコミット

### テスト

* TDD: 最初にテストを書く
* 最低80%のカバレッジ
* 重要なフローに対する ユニット + 統合 + E2E

---

## エディタ統合 (Editor Integration)

私はメインエディタとして Zed を使用しています：

* ファイル追跡のためのエージェントパネル
* コマンドパレットは CMD+Shift+R
* Vimモード有効

---

## 成功メトリクス (Success Metrics)

以下の場合に成功とみなします：

* すべてのテストが通過する（80%以上のカバレッジ）
* セキュリティ脆弱性がない
* コードが読みやすく、保守可能である
* ユーザー要件が満たされている

---

**哲学**: エージェントファースト設計、並列実行、行動前の計画、コード前のテスト、常にセキュリティ。


