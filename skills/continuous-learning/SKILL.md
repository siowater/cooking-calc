---

## name: continuous-learning description: Cursorセッションから再利用可能なパターンを自動的に抽出し、将来の使用のために学習済みスキルとして保存します。

# 継続的学習スキル (Continuous Learning Skill)

Cursorセッションの終了時に自動的に評価を行い、再利用可能なパターンを抽出して、将来使用するために学習済みスキルとして保存します。

## 仕組み (How It Works)

このスキルは、各セッションの終了時に **Stopフック** として実行されます：

1. **セッション評価**: セッションに十分なメッセージがあるか確認します（デフォルト: 10件以上）
2. **パターン検出**: セッションから抽出可能なパターンを識別します
3. **スキル抽出**: 有用なパターンを `~/.cursor/skills/learned/` に保存します

## 設定 (Configuration)

`config.json` を編集してカスタマイズします：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.cursor/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}

```

## パターンタイプ (Pattern Types)

| パターン | 説明 |
| --- | --- |
| `error_resolution` | 特定のエラーがどのように解決されたか |
| `user_corrections` | ユーザーの修正からのパターン |
| `workarounds` | フレームワーク/ライブラリの癖に対する解決策 |
| `debugging_techniques` | 効果的なデバッグアプローチ |
| `project_specific` | プロジェクト固有の規約 |

## フックのセットアップ (Hook Setup)

`~/.cursor/settings.json` に追加します：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.cursor/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}

```

## なぜ Stop フックなのか？ (Why Stop Hook?)

* **軽量**: セッション終了時に一度だけ実行されます
* **ノンブロッキング**: すべてのメッセージに遅延を追加しません
* **完全なコンテキスト**: 完全なセッション記録（トランスクリプト）にアクセスできます

## 関連情報 (Related)

* [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - 継続的学習に関するセクション
* `/learn` コマンド - セッション途中での手動パターン抽出
