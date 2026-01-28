# 共通パターン (Common Patterns)

## APIレスポンスフォーマット

```typescript
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

```

## カスタムフックパターン

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

```

## リポジトリパターン

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}

```

## スケルトンプロジェクト

新機能を実装する際：

1. 実績のある（Battle-tested）スケルトンプロジェクトを検索する
2. 並列エージェントを使用してオプションを評価する：
* セキュリティ評価
* 拡張性分析
* 関連性スコアリング
* 実装計画


3. 最適なものを基盤としてクローンする
4. 実証済みの構造内で反復（イテレーション）する

