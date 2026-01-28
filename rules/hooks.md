# フックシステム (Hooks System)

## フックタイプ

* **PreToolUse**: ツール実行前（検証、パラメータ変更）
* **PostToolUse**: ツール実行後（自動フォーマット、チェック）
* **Stop**: セッション終了時（最終検証）

## 現在のフック (~/.cursor/settings.json 内)

### PreToolUse

* **tmux reminder**: 長時間実行されるコマンド（npm, pnpm, yarn, cargo など）に対して tmux を提案する
* **git push review**: プッシュ前にレビューのために Zed を開く
* **doc blocker**: 不要な .md/.txt ファイルの作成をブロックする

### PostToolUse

* **PR creation**: PRのURLとGitHub Actionsのステータスをログに記録する
* **Prettier**: 編集後にJS/TSファイルを自動フォーマットする
* **TypeScript check**: .ts/.tsx ファイルの編集後に tsc を実行する
* **console.log warning**: 編集されたファイル内の console.log について警告する

### Stop

* **console.log audit**: セッション終了前に、変更されたすべてのファイルで console.log をチェックする

## 権限の自動承認 (Auto-Accept Permissions)

注意して使用してください：

* 信頼できる、明確に定義された計画に対して有効にする
* 探索的な作業に対しては無効にする
* dangerously-skip-permissions フラグは決して使用しない
* 代わりに `~/.cursor.json` で `allowedTools` を設定する

## TodoWrite ベストプラクティス

TodoWrite ツールを以下の目的で使用してください：

* マルチステップタスクの進捗を追跡する
* 指示の理解を検証する
* リアルタイムの操縦（ステアリング）を可能にする
* 粒度の細かい実装ステップを表示する

Todoリストは以下を明らかにします：

* 順序が間違っているステップ
* 欠落している項目
* 余分で不必要な項目
* 誤った粒度
* 誤解された要件

