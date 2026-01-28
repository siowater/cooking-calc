---

## description: テスト駆動開発（TDD）ワークフローを強制します。インターフェースの足場作りを行い、テストを「最初に」生成し、その後合格するための最小限のコードを実装します。80%以上のカバレッジを保証します。

# TDD コマンド (TDD Command)

このコマンドは **tdd-guide** エージェントを呼び出し、テスト駆動開発手法を強制します。

## このコマンドが行うこと

1. **インターフェースの足場作り (Scaffold Interfaces)** - 型/インターフェースを最初に定義する
2. **テストを最初に生成 (Generate Tests First)** - 失敗するテストを書く (RED)
3. **最小限のコードを実装 (Implement Minimal Code)** - 合格するのに十分な分だけ書く (GREEN)
4. **リファクタリング (Refactor)** - テストの合格（GREEN）を維持しながらコードを改善する (REFACTOR)
5. **カバレッジの検証 (Verify Coverage)** - 80%以上のテストカバレッジを保証する

## 使用するタイミング

以下の場合に `/tdd` を使用してください：

* 新機能を実装する場合
* 新しい関数/コンポーネントを追加する場合
* バグを修正する場合（最初にバグを再現するテストを書く）
* 既存のコードをリファクタリングする場合
* 重要なビジネスロジックを構築する場合

## 仕組み

tdd-guide エージェントは以下を行います：

1. 入力/出力の**インターフェースを定義**する
2. **失敗するテストを書く**（コードがまだ存在しないため）
3. **テストを実行**し、正しい理由で失敗することを検証する
4. テストを通過させるための**最小限の実装を書く**
5. **テストを実行**し、通過することを検証する
6. テストの合格（GREEN）を維持しながらコードを**リファクタリング**する
7. **カバレッジを確認**し、80%未満の場合はテストを追加する

## TDD サイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    合格するための最小限のコードを書く
REFACTOR: コードを改善し、テストの合格を維持する
REPEAT:   次の機能/シナリオへ

```

## 使用例

```
User: /tdd マーケットの流動性スコアを計算する関数が必要です

Agent (tdd-guide):
# TDD Session: Market Liquidity Score Calculator

## Step 1: Define Interface (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}

```

## Step 2: Write Failing Test (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})

```

## Step 3: Run Tests - Verify FAIL

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed

```

✅ 期待通りにテストが失敗しました。実装の準備ができました。

## Step 4: Implement Minimal Code (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // Handle zero volume edge case
  if (market.totalVolume === 0) {
    return 0
  }

  // Calculate component scores (0-100 scale)
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // Recent activity bonus
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // Weighted average
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // Clamp to 0-100
}

```

## Step 5: Run Tests - Verify PASS

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed

```

✅ すべてのテストが通過しました！

## Step 6: Refactor (IMPROVE)

```typescript
// lib/liquidity.ts - 定数と可読性を向上させたリファクタリング後
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}

```

## Step 7: Verify Tests Still Pass

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed

```

✅ リファクタリング完了、テストは依然として通過しています！

## Step 8: Check Coverage

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |    100   |   100   |   100

Coverage: 100% ✅ (Target: 80%)

```

✅ TDDセッション完了！

```

## TDD ベストプラクティス

**DO (推奨):**
- ✅ 実装を行う前に、テストを「最初に」書く
- ✅ 実装する前にテストを実行し、失敗することを検証する
- ✅ テストを通過させるための最小限のコードを書く
- ✅ テストがグリーン（通過）になった後にのみリファクタリングを行う
- ✅ エッジケースとエラーシナリオを追加する
- ✅ 80%以上のカバレッジを目指す（重要なコードは100%）

**DON'T (禁止):**
- ❌ テストの前に実装を書く
- ❌ 各変更後にテストを実行するのをスキップする
- ❌ 一度に多くのコードを書きすぎる
- ❌ 失敗しているテストを無視する
- ❌ 実装の詳細をテストする（振る舞いをテストする）
- ❌ すべてをモック化する（統合テストを好む）

## 含めるべきテストの種類

**ユニットテスト (Unit Tests)** (関数レベル):
- ハッピーパス（正常系）シナリオ
- エッジケース（空、null、最大値）
- エラー条件
- 境界値

**統合テスト (Integration Tests)** (コンポーネントレベル):
- APIエンドポイント
- データベース操作
- 外部サービス呼び出し
- フックを持つReactコンポーネント

**E2Eテスト (E2E Tests)** (`/e2e` コマンドを使用):
- 重要なユーザーフロー
- 複数ステップのプロセス
- フルスタック統合

## カバレッジ要件

- すべてのコードで **最低80%**
- 以下の場合 **100% 必須**:
  - 金融計算
  - 認証ロジック
  - セキュリティ上重要なコード
  - コアビジネスロジック

## 重要な注意点

**必須 (MANDATORY)**: テストは実装の「前」に書かれなければなりません。TDDサイクルは以下の通りです：

1. **RED** - 失敗するテストを書く
2. **GREEN** - 通過するように実装する
3. **REFACTOR** - コードを改善する

REDフェーズを決してスキップしないでください。テストの前に決してコードを書かないでください。

## 他のコマンドとの統合

- 構築するものを理解するために、まず `/plan` を使用する
- テスト付きで実装するために `/tdd` を使用する
- ビルドエラーが発生した場合は `/build-and-fix` を使用する
- 実装をレビューするために `/code-review` を使用する
- カバレッジを検証するために `/test-coverage` を使用する

## 関連エージェント

このコマンドは、以下の場所にある `tdd-guide` エージェントを呼び出します：
`~/.cursor/agents/tdd-guide.md`

また、以下の場所にある `tdd-workflow` スキルを参照することができます：
`~/.cursor/skills/tdd-workflow/`

```


