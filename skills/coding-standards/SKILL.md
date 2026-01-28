これもおねがいします

---

## name: coding-standards description: TypeScript、JavaScript、React、およびNode.js開発のための、普遍的なコーディング規約、ベストプラクティス、およびパターン。

# コーディング規約とベストプラクティス (Coding Standards & Best Practices)

すべてのプロジェクトに適用可能な、普遍的なコーディング規約。

## コード品質の原則 (Code Quality Principles)

### 1. 可読性第一 (Readability First)

* コードは書かれることよりも読まれることの方が多い
* 明確な変数名と関数名を使用する
* コメントよりも自己文書化された（コード自体が説明になっている）コードを好む
* 一貫したフォーマット

### 2. KISS原則 (Keep It Simple, Stupid)

* 動作する最も単純な解決策を選ぶ
* オーバーエンジニアリングを避ける
* 早すぎる最適化をしない
* 賢いコード（Clever code）よりも理解しやすいコード

### 3. DRY原則 (Don't Repeat Yourself)

* 共通のロジックを関数に抽出する
* 再利用可能なコンポーネントを作成する
* モジュール間でユーティリティを共有する
* コピー＆ペーストプログラミングを避ける

### 4. YAGNI原則 (You Aren't Gonna Need It)

* 必要になるまで機能を作らない
* 推測に基づく汎用化を避ける
* 必要な場合にのみ複雑さを加える
* 単純に始め、必要に応じてリファクタリングする

## TypeScript/JavaScript 基準

### 変数の命名

```typescript
// ✅ GOOD: 説明的な名前
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ BAD: 不明瞭な名前
const q = 'election'
const flag = true
const x = 1000

```

### 関数の命名

```typescript
// ✅ GOOD: 動詞-名詞のパターン
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ BAD: 不明瞭、または名詞のみ
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }

```

### 不変性パターン (重要)

```typescript
// ✅ 常にスプレッド演算子を使用する
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ 決して直接変更（ミューテート）しない
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD

```

### エラーハンドリング

```typescript
// ✅ GOOD: 包括的なエラーハンドリング
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ BAD: エラーハンドリングなし
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}

```

### Async/Await ベストプラクティス

```typescript
// ✅ GOOD: 可能な場合は並列実行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ BAD: 不必要な順次実行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()

```

### 型安全性 (Type Safety)

```typescript
// ✅ GOOD: 適切な型定義
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // 実装
}

// ❌ BAD: 'any' の使用
function getMarket(id: any): Promise<any> {
  // 実装
}

```

## React ベストプラクティス

### コンポーネント構造

```typescript
// ✅ GOOD: 型付きの関数コンポーネント
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ BAD: 型がなく、構造が不明瞭
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}

```

### カスタムフック

```typescript
// ✅ GOOD: 再利用可能なカスタムフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用法
const debouncedQuery = useDebounce(searchQuery, 500)

```

### 状態管理

```typescript
// ✅ GOOD: 適切な状態更新
const [count, setCount] = useState(0)

// 前の状態に基づいた関数型更新
setCount(prev => prev + 1)

// ❌ BAD: 直接的な状態参照
setCount(count + 1)  // 非同期シナリオで古い値になる可能性がある

```

### 条件付きレンダリング

```typescript
// ✅ GOOD: 明確な条件付きレンダリング
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ BAD: 三項演算子の地獄（Ternary hell）
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}

```

## API設計基準

### REST API 規約

```
GET    /api/markets              # すべてのマーケットを一覧表示
GET    /api/markets/:id          # 特定のマーケットを取得
POST   /api/markets              # 新しいマーケットを作成
PUT    /api/markets/:id          # マーケットを更新（完全）
PATCH  /api/markets/:id          # マーケットを更新（部分）
DELETE /api/markets/:id          # マーケットを削除

# フィルタリング用のクエリパラメータ
GET /api/markets?status=active&limit=10&offset=0

```

### レスポンスフォーマット

```typescript
// ✅ GOOD: 一貫したレスポンス構造
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功レスポンス
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// エラーレスポンス
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })

```

### 入力検証 (Input Validation)

```typescript
import { z } from 'zod'

// ✅ GOOD: スキーマ検証
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // 検証済みデータで処理を進める
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}

```

## ファイル構成 (File Organization)

### プロジェクト構造

```
src/
├── app/                   # Next.js App Router
│   ├── api/               # API ルート
│   ├── markets/           # マーケットページ
│   └── (auth)/            # 認証ページ (ルートグループ)
├── components/            # React コンポーネント
│   ├── ui/                # 汎用UIコンポーネント
│   ├── forms/             # フォームコンポーネント
│   └── layouts/           # レイアウトコンポーネント
├── hooks/                 # カスタム React フック
├── lib/                   # ユーティリティと設定
│   ├── api/               # API クライアント
│   ├── utils/             # ヘルパー関数
│   └── constants/         # 定数
├── types/                 # TypeScript 型定義
└── styles/                # グローバルスタイル

```

### ファイル命名

```
components/Button.tsx          # コンポーネントは PascalCase
hooks/useAuth.ts              # 'use' 接頭辞付きの camelCase
lib/formatDate.ts             # ユーティリティは camelCase
types/market.types.ts         # .types 接尾辞付きの camelCase

```

## コメントとドキュメンテーション

### コメントすべきタイミング

```typescript
// ✅ GOOD: 「何を」ではなく「なぜ」を説明する
// 停止中にAPIに過負荷をかけないよう、指数バックオフを使用する
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 大きな配列でのパフォーマンスのために、ここでは意図的にミューテーションを使用する
items.push(newItem)

// ❌ BAD: 自明なことを述べる
// カウンタを1増やす
count++

// 名前をユーザーの名前に設定する
name = user.name

```

### パブリックAPI用 JSDoc

```typescript
/**
 * 意味的類似性を使用してマーケットを検索します。
 *
 * @param query - 自然言語検索クエリ
 * @param limit - 結果の最大数 (デフォルト: 10)
 * @returns 類似性スコア順のマーケット配列
 * @throws {Error} OpenAI APIが失敗した場合、またはRedisが利用できない場合
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // 実装
}

```

## パフォーマンス ベストプラクティス

### メモ化 (Memoization)

```typescript
import { useMemo, useCallback } from 'react'

// ✅ GOOD: 高コストな計算をメモ化する
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ GOOD: コールバックをメモ化する
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

```

### 遅延読み込み (Lazy Loading)

```typescript
import { lazy, Suspense } from 'react'

// ✅ GOOD: 重いコンポーネントを遅延読み込みする
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}

```

### データベースクエリ

```typescript
// ✅ GOOD: 必要なカラムのみを選択する
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// ❌ BAD: すべてを選択する
const { data } = await supabase
  .from('markets')
  .select('*')

```

## テスト基準

### テスト構造 (AAAパターン)

```typescript
test('calculates similarity correctly', () => {
  // Arrange (準備)
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act (実行)
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert (検証)
  expect(similarity).toBe(0)
})

```

### テスト命名

```typescript
// ✅ GOOD: 説明的なテスト名
test('returns empty array when no markets match query', () => { })
// (クエリに一致するマーケットがない場合、空の配列を返す)

test('throws error when OpenAI API key is missing', () => { })
// (OpenAI APIキーがない場合、エラーをスローする)

test('falls back to substring search when Redis unavailable', () => { })
// (Redisが利用できない場合、部分文字列検索にフォールバックする)

// ❌ BAD: 曖昧なテスト名
test('works', () => { })
test('test search', () => { })

```

## コードの不吉な臭い (Code Smell) の検出

これらのアンチパターンに注意してください：

### 1. 長い関数 (Long Functions)

```typescript
// ❌ BAD: 50行を超える関数
function processMarketData() {
  // 100行のコード
}

// ✅ GOOD: 小さな関数に分割する
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}

```

### 2. 深いネスト (Deep Nesting)

```typescript
// ❌ BAD: 5レベル以上のネスト
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 何かをする
        }
      }
    }
  }
}

// ✅ GOOD: 早期リターン (Early returns)
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 何かをする

```

### 3. マジックナンバー (Magic Numbers)

```typescript
// ❌ BAD: 説明のない数値
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ GOOD: 名前付き定数
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)

```

**注意**: コード品質は交渉の余地がありません。明確で保守しやすいコードは、迅速な開発と自信を持ったリファクタリングを可能にします。

