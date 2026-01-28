```markdown
---
description: Playwrightを使用したエンドツーエンドテストを生成・実行します。テストジャーニーの作成、テスト実行、スクリーンショット/動画/トレースのキャプチャ、およびアーティファクトのアップロードを行います。
---

# E2Eコマンド (E2E Command)

このコマンドは、**e2e-runner** エージェントを呼び出し、Playwrightを使用したエンドツーエンド（E2E）テストの生成、保守、実行を行います。

## このコマンドが行うこと

1.  **テストジャーニーの生成** - ユーザーフローのためのPlaywrightテストを作成する
2.  **E2Eテストの実行** - 複数のブラウザでテストを実行する
3.  **アーティファクトのキャプチャ** - 失敗時のスクリーンショット、動画、トレースを取得する
4.  **結果のアップロード** - HTMLレポートとJUnit XMLをアップロードする
5.  **不安定なテストの特定** - 不安定なテスト（Flaky test）を隔離する

## 使用するタイミング

以下の場合に `/e2e` を使用してください：
- 重要なユーザージャーニー（ログイン、取引、支払い）をテストする場合
- 複数のステップにわたるフローがエンドツーエンドで機能することを検証する場合
- UIのインタラクションとナビゲーションをテストする場合
- フロントエンドとバックエンドの統合を検証する場合
- 本番デプロイの準備をする場合

## 仕組み

e2e-runner エージェントは以下を行います：

1.  **ユーザーフローを分析**し、テストシナリオを特定する
2.  Page Object Modelパターンを使用して**Playwrightテストを生成**する
3.  複数のブラウザ（Chrome, Firefox, Safari）で**テストを実行**する
4.  スクリーンショット、動画、トレースを使用して**失敗をキャプチャ**する
5.  結果とアーティファクトを含む**レポートを生成**する
6.  **不安定なテストを特定**し、修正を推奨する

## 使用例


```

User: /e2e マーケット検索と閲覧フローをテストして

Agent (e2e-runner):

# E2E Test Generation: Market Search and View Flow

## Test Scenario Identified

**User Journey:** Market Search → View Results → Click Market → View Details

**Test Coverage:**

1. Navigate to markets page
2. Perform semantic search
3. Verify search results
4. Click on first result
5. Verify market details page loads
6. Verify chart renders

## Generated Test Code

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})

```

## Running Tests

```bash
# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html

```

## Test Report

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:      ✅ ALL TESTS PASSED                             ║
║ Total:       3 tests                                         ║
║ Passed:      3 (100%)                                        ║
║ Failed:      0                                               ║
║ Flaky:       0                                               ║
║ Duration:    9.1s                                            ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
📸 Screenshots: 2 files
📹 Videos: 0 files (only on failure)
🔍 Traces: 0 files (only on failure)
📊 HTML Report: playwright-report/index.html

View report: npx playwright show-report

```

✅ E2E test suite ready for CI/CD integration!

```

## テストアーティファクト

テスト実行時、以下のアーティファクトがキャプチャされます：

**全テスト共通:**
- タイムラインと結果を含むHTMLレポート
- CI統合用のJUnit XML

**失敗時のみ:**
- 失敗状態のスクリーンショット
- テストの動画録画
- デバッグ用トレースファイル（ステップバイステップのリプレイ）
- ネットワークログ
- コンソールログ

## アーティファクトの閲覧

```bash
# ブラウザでHTMLレポートを閲覧
npx playwright show-report

# 特定のトレースファイルを閲覧
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットは artifacts/ ディレクトリに保存されます
open artifacts/search-results.png

```

## 不安定なテスト（Flaky Test）の検出

テストが間欠的に失敗する場合：

```
⚠️  FLAKY TEST DETECTED: tests/e2e/markets/trade.spec.ts

Test passed 7/10 runs (70% pass rate)

Common failure:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

Recommended fixes:
1. Add explicit wait: await page.waitForSelector('[data-testid="confirm-btn"]')
2. Increase timeout: { timeout: 10000 }
3. Check for race conditions in component
4. Verify element is not hidden by animation

Quarantine recommendation: Mark as test.fixme() until fixed

```

## ブラウザ設定

テストはデフォルトで複数のブラウザで実行されます：

* ✅ Chromium (Desktop Chrome)
* ✅ Firefox (Desktop)
* ✅ WebKit (Desktop Safari)
* ✅ Mobile Chrome (オプション)

`playwright.config.ts` でブラウザを調整できます。

## CI/CD統合

CIパイプラインに追加してください：

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/

```

## PMX固有の重要フロー

PMXの場合、以下のE2Eテストを優先してください：

**🔴 CRITICAL (常に通過必須):**

1. ユーザーがウォレットを接続できる
2. ユーザーがマーケットを閲覧できる
3. ユーザーがマーケットを検索できる（セマンティック検索）
4. ユーザーがマーケットの詳細を閲覧できる
5. ユーザーが取引を行える（テスト資金で）
6. マーケットが正しく解決される
7. ユーザーが資金を引き出せる

**🟡 IMPORTANT:**

1. マーケット作成フロー
2. ユーザープロフィール更新
3. リアルタイム価格更新
4. チャートレンダリング
5. マーケットのフィルタリングと並べ替え
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**DO (推奨):**

* ✅ 保守性のためにPage Object Modelを使用する
* ✅ セレクタには data-testid 属性を使用する
* ✅ 任意のタイムアウトではなく、API応答を待機する
* ✅ 重要なユーザージャーニーをエンドツーエンドでテストする
* ✅ mainへのマージ前にテストを実行する
* ✅ テスト失敗時にアーティファクトをレビューする

**DON'T (禁止):**

* ❌ 壊れやすいセレクタを使用する（CSSクラスは変わる可能性がある）
* ❌ 実装の詳細をテストする
* ❌ 本番環境に対してテストを実行する
* ❌ 不安定なテストを無視する
* ❌ 失敗時にアーティファクトのレビューをスキップする
* ❌ すべてのエッジケースをE2Eでテストする（ユニットテストを使用する）

## 重要な注意点

**PMXにとって極めて重要:**

* リアルマネーを含むE2Eテストは、テストネット/ステージングでのみ実行してください
* 本番環境に対して取引テストを実行しないでください
* 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定してください
* 少額のテスト資金を持つテストウォレットのみを使用してください

## 他のコマンドとの統合

* `/plan` を使用して、テストすべき重要なジャーニーを特定する
* `/tdd` を使用してユニットテストを行う（より高速で、粒度が細かい）
* `/e2e` を使用して統合テストおよびユーザージャーニーテストを行う
* `/code-review` を使用してテストの品質を検証する

## 関連エージェント

このコマンドは、以下の場所にある `e2e-runner` エージェントを呼び出します：
`~/.cursor/agents/e2e-runner.md`

## クイックコマンド

```bash
# 全てのE2Eテストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# ヘッドレスモードなしで実行（ブラウザを表示）
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report

```

```

```


