# Gitワークフロー (Git Workflow)

## コミットメッセージフォーマット

```
<type>: <description>

<optional body>

```

タイプ (Types): feat, fix, refactor, docs, test, chore, perf, ci

注: アトリビューション（属性付与）は `~/.cursor/settings.json` 経由でグローバルに無効化されています。

## プルリクエストワークフロー

PRを作成する際：

1. 完全なコミット履歴を分析する（最新のコミットだけでなく）
2. すべての変更を確認するために `git diff [base-branch]...HEAD` を使用する
3. 包括的なPRサマリーを起草する
4. TODOを含むテスト計画を含める
5. 新しいブランチの場合は `-u` フラグを付けてプッシュする

## 機能実装ワークフロー

1. **計画第一 (Plan First)**
* 実装計画を作成するために **planner** エージェントを使用する
* 依存関係とリスクを特定する
* フェーズに分解する


2. **TDDアプローチ (TDD Approach)**
* **tdd-guide** エージェントを使用する
* 最初にテストを書く (RED)
* テストを通過するように実装する (GREEN)
* リファクタリングする (IMPROVE)
* 80%以上のカバレッジを検証する


3. **コードレビュー (Code Review)**
* コードを書いた直後に **code-reviewer** エージェントを使用する
* CRITICAL (重大) および HIGH (高) の問題に対処する
* 可能であれば MEDIUM (中) の問題を修正する


4. **コミット & プッシュ (Commit & Push)**
* 詳細なコミットメッセージ
* conventional commits フォーマットに従う

