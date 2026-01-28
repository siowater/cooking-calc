# チェックポイントコマンド (Checkpoint Command)

ワークフロー内のチェックポイントを作成または検証します。

## 使用法

`/checkpoint [create|verify|list] [name]`

## チェックポイントの作成 (Create Checkpoint)

チェックポイントを作成する際：

1. `/verify quick` を実行して、現在の状態がクリーンであることを確認する
2. チェックポイント名で git stash または commit を作成する
3. チェックポイントを `.cursor/checkpoints.log` に記録する：

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .cursor/checkpoints.log

```

4. チェックポイントが作成されたことを報告する

## チェックポイントの検証 (Verify Checkpoint)

チェックポイントに対して検証を行う際：

1. ログからチェックポイントを読み取る
2. 現在の状態をチェックポイントと比較する：
* チェックポイント以降に追加されたファイル
* チェックポイント以降に変更されたファイル
* テスト通過率（現在 vs 当時）
* カバレッジ（現在 vs 当時）


3. 報告する：

```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]

```

## チェックポイントの一覧表示 (List Checkpoints)

以下の情報を含むすべてのチェックポイントを表示する：

* 名前
* タイムスタンプ
* Git SHA
* ステータス (current, behind, ahead)

## ワークフロー

典型的なチェックポイントフロー：

```
[開始] --> /checkpoint create "feature-start"
   |
[実装] --> /checkpoint create "core-done"
   |
[テスト] --> /checkpoint verify "core-done"
   |
[リファクタリング] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"

```

## 引数

$ARGUMENTS:

* `create <name>` - 名前付きチェックポイントを作成する
* `verify <name>` - 名前付きチェックポイントに対して検証する
* `list` - すべてのチェックポイントを表示する
* `clear` - 古いチェックポイントを削除する（最後の5つを保持）

