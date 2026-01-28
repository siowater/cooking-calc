# Evalコマンド (Eval Command)

評価駆動開発（Eval-driven development）ワークフローを管理します。

## 使用法

`/eval [define|check|report|list] [feature-name]`

## 評価の定義 (Define Evals)

`/eval define feature-name`

新しい評価定義を作成します：

1. 以下のテンプレートを使用して `.cursor/evals/feature-name.md` を作成します：

```markdown
## EVAL: feature-name
作成日: $(date)

### 能力評価 (Capability Evals)
- [ ] [能力1の説明]
- [ ] [能力2の説明]

### 回帰評価 (Regression Evals)
- [ ] [既存の動作1が機能する]
- [ ] [既存の動作2が機能する]

### 成功基準
- 能力評価において pass@3 > 90%
- 回帰評価において pass^3 = 100%

```

2. ユーザーに具体的な基準を入力するよう促します

## 評価のチェック (Check Evals)

`/eval check feature-name`

機能の評価を実行します：

1. `.cursor/evals/feature-name.md` から評価定義を読み取ります
2. 各能力評価について：
* 基準の検証を試みます
* PASS/FAIL を記録します
* `.cursor/evals/feature-name.log` に試行をログ記録します


3. 各回帰評価について：
* 関連するテストを実行します
* ベースラインと比較します
* PASS/FAIL を記録します


4. 現在のステータスを報告します：

```
EVAL CHECK: feature-name
========================
Capability: X/Y passing
Regression: X/Y passing
Status: IN PROGRESS / READY

```

## 評価レポート (Report Evals)

`/eval report feature-name`

包括的な評価レポートを生成します：

```
EVAL REPORT: feature-name
=========================
生成日時: $(date)

能力評価 (CAPABILITY EVALS)
----------------
[eval-1]: PASS (pass@1)
[eval-2]: PASS (pass@2) - リトライが必要でした
[eval-3]: FAIL - ノートを参照

回帰評価 (REGRESSION EVALS)
----------------
[test-1]: PASS
[test-2]: PASS
[test-3]: PASS

メトリクス (METRICS)
-------
Capability pass@1: 67%
Capability pass@3: 100%
Regression pass^3: 100%

ノート (NOTES)
-----
[問題点、エッジケース、または観察事項]

推奨事項 (RECOMMENDATION)
--------------
[SHIP (出荷) / NEEDS WORK (要修正) / BLOCKED (ブロック)]

```

## 評価リスト (List Evals)

`/eval list`

すべての評価定義を表示します：

```
EVAL DEFINITIONS
================
feature-auth      [3/5 passing] IN PROGRESS (進行中)
feature-search    [5/5 passing] READY (準備完了)
feature-export    [0/4 passing] NOT STARTED (未着手)

```

## 引数

$ARGUMENTS:

* `define <name>` - 新しい評価定義を作成する
* `check <name>` - 評価を実行してチェックする
* `report <name>` - 完全なレポートを生成する
* `list` - すべての評価を表示する
* `clean` - 古い評価ログを削除する（最後の10回分を保持）


