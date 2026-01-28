これもおねがいします

---

## name: tdd-workflow description: 新機能の作成、バグ修正、またはコードのリファクタリング時にこのスキルを使用します。ユニット、統合、およびE2Eテストを含む80%以上のカバレッジを持つテスト駆動開発を強制します。

# テスト駆動開発ワークフロー (Test-Driven Development Workflow)

このスキルは、すべてのコード開発が包括的なテストカバレッジを伴うTDDの原則に従うことを保証します。

## アクティブ化のタイミング (When to Activate)

* 新機能や機能性の作成
* バグや問題の修正
* 既存コードのリファクタリング
* APIエンドポイントの追加
* 新しいコンポーネントの作成

## コア原則 (Core Principles)

### 1. コードの前にテスト (Tests BEFORE Code)

「常に」最初にテストを書き、その後にテストを通過させるためのコードを実装します。

### 2. カバレッジ要件

* 最低80%のカバレッジ（ユニット + 統合 + E2E）
* すべてのエッジケースをカバー
* エラーシナリオのテスト
* 境界条件の検証

### 3. テストタイプ

#### ユニットテスト (Unit Tests)

* 個別の関数とユーティリティ
* コンポーネントロジック
* 純粋関数
* ヘルパーとユーティリティ

#### 統合テスト (Integration Tests)

* APIエンドポイント
* データベース操作
* サービス間の相互作用
* 外部API呼び出し

#### E2Eテスト (Playwright)

* 重要なユーザーフロー
* 完全なワークフロー
* ブラウザ自動化
* UIインタラクション

## TDDワークフローの手順

### ステップ 1: ユーザージャーニーを書く

```
[役割] として、私は [行動] したい。それにより [メリット] が得られる。

例:
ユーザーとして、私は意味的にマーケットを検索したい。
それにより、正確なキーワードがなくても関連するマーケットを見つけることができる。

```

### ステップ 2: テストケースを作成する

各ユーザージャーニーに対して、包括的なテストケースを作成します：

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // クエリに対して関連するマーケットを返す
  })

  it('handles empty query gracefully', async () => {
    // 空のクエリを適切に処理する（エッジケース）
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // Redisが利用できない場合、部分文字列検索にフォールバックする
  })

  it('sorts results by similarity score', async () => {
    // 類似度スコアで結果をソートする
  })
})

```

### ステップ 3: テストを実行する（失敗すべき）

```bash
npm test
# テストは失敗するはずです - まだ実装していません

```

### ステップ 4: コードを実装する

テストを通過させるための最小限のコードを書きます：

```typescript
// テストに導かれた実装
export async function searchMarkets(query: string) {
  // ここに実装
}

```

### ステップ 5: もう一度テストを実行する

```bash
npm test
# テストは通過するはずです

```

### ステップ 6: リファクタリング

テストがグリーンの状態を保ちながらコード品質を向上させます：

* 重複の排除
* 命名の改善
* パフォーマンスの最適化
* 可読性の向上

### ステップ 7: カバレッジを検証する

```bash
npm run test:coverage
# 80%以上のカバレッジが達成されているか確認

```

## テストパターン (Testing Patterns)

### ユニットテストパターン (Jest/Vitest)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

```

### API統合テストパターン

```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // データベース障害をモック化
    const request = new NextRequest('http://localhost/api/markets')
    // エラーハンドリングをテスト
  })
})

```

### E2Eテストパターン (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // マーケットページに移動
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // ページ読み込みを確認
  await expect(page.locator('h1')).toContainText('Markets')

  // マーケットを検索
  await page.fill('input[placeholder="Search markets"]', 'election')

  // デバウンスと結果を待機
  await page.waitForTimeout(600)

  // 検索結果の表示を確認
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // 結果に検索語が含まれているか確認
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // ステータスでフィルタリング
  await page.click('button:has-text("Active")')

  // フィルタリングされた結果を確認
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // まずログイン
  await page.goto('/creator-dashboard')

  // マーケット作成フォームに入力
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // フォーム送信
  await page.click('button[type="submit"]')

  // 成功メッセージを確認
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // マーケットページへのリダイレクトを確認
  await expect(page).toHaveURL(/\/markets\/test-market/)
})

```

## テストファイル構成 (Test File Organization)

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # ユニットテスト
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts        # 統合テスト
└── e2e/
    ├── markets.spec.ts              # E2Eテスト
    ├── trading.spec.ts
    └── auth.spec.ts

```

## 外部サービスのモック (Mocking External Services)

### Supabase モック

```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))

```

### Redis モック

```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))

```

### OpenAI モック

```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // 1536次元の埋め込みをモック
  ))
}))

```

## テストカバレッジ検証 (Test Coverage Verification)

### カバレッジレポートの実行

```bash
npm run test:coverage

```

### カバレッジ閾値

```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}

```

## 避けるべき一般的なテストの失敗 (Common Testing Mistakes to Avoid)

### ❌ WRONG: 実装詳細のテスト

```typescript
// 内部状態をテストしてはいけない
expect(component.state.count).toBe(5)

```

### ✅ CORRECT: ユーザーに見える振る舞いのテスト

```typescript
// ユーザーが見るものをテストする
expect(screen.getByText('Count: 5')).toBeInTheDocument()

```

### ❌ WRONG: 壊れやすいセレクタ

```typescript
// 簡単に壊れる
await page.click('.css-class-xyz')

```

### ✅ CORRECT: セマンティックなセレクタ

```typescript
// 変更に強い
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')

```

### ❌ WRONG: テストの分離がない

```typescript
// テストが互いに依存している
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* 前のテストに依存 */ })

```

### ✅ CORRECT: 独立したテスト

```typescript
// 各テストが独自のデータをセットアップする
test('creates user', () => {
  const user = createTestUser()
  // テストロジック
})

test('updates user', () => {
  const user = createTestUser()
  // 更新ロジック
})

```

## 継続的テスト (Continuous Testing)

### 開発中のウォッチモード

```bash
npm test -- --watch
# ファイル変更時にテストが自動的に実行される

```

### プレコミットフック

```bash
# すべてのコミット前に実行
npm test && npm run lint

```

### CI/CD統合

```yaml
# GitHub Actions
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v3

```

## ベストプラクティス (Best Practices)

1. **最初にテストを書く** - 常にTDD
2. **テストごとに1つのアサート** - 単一の振る舞いに焦点を当てる
3. **説明的なテスト名** - 何がテストされているかを説明する
4. **Arrange-Act-Assert** - 明確なテスト構造
5. **外部依存関係をモックする** - ユニットテストを分離する
6. **エッジケースをテストする** - Null, undefined, 空, 大規模データ
7. **エラーパスをテストする** - ハッピーパス（正常系）だけではない
8. **テストを高速に保つ** - 各ユニットテスト < 50ms
9. **テスト後のクリーンアップ** - 副作用を残さない
10. **カバレッジレポートを確認する** - ギャップを特定する

## 成功メトリクス (Success Metrics)

* 80%以上のコードカバレッジ達成
* すべてのテストが通過（グリーン）
* スキップまたは無効化されたテストがない
* 高速なテスト実行（ユニットテスト < 30秒）
* E2Eテストが重要なユーザーフローをカバーしている
* テストが本番前にバグを捕捉する

---

**注意**: テストはオプションではありません。テストは、自信を持ったリファクタリング、迅速な開発、そして本番環境の信頼性を可能にするセーフティネットです。
