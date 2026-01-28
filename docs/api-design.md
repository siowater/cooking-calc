# API設計書：Baker's Lens

## 1. API概要

Supabase Clientを使用したAPI設計。認証はオプションとし、ノーログイン利用も可能。

## 2. 認証API

### 2.1 サインアップ

```typescript
POST /auth/v1/signup

Request Body:
{
  email: string
  password: string
  metadata?: {
    display_name?: string
  }
}

Response:
{
  user: User | null
  session: Session | null
  error?: Error
}
```

### 2.2 サインイン

```typescript
POST /auth/v1/token?grant_type=password

Request Body:
{
  email: string
  password: string
}

Response:
{
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}
```

### 2.3 サインアウト

```typescript
POST /auth/v1/logout

Headers:
{
  Authorization: "Bearer {access_token}"
}

Response:
{
  message: "Successfully logged out"
}
```

### 2.4 セッション更新

```typescript
POST /auth/v1/token?grant_type=refresh_token

Request Body:
{
  refresh_token: string
}

Response:
{
  access_token: string
  refresh_token: string
  expires_in: number
}
```

## 3. 材料マスタAPI

### 3.1 材料一覧取得

```typescript
GET /rest/v1/ingredients_master
  ?select=*
  &order=name.asc

Query Parameters:
- select: 取得するカラム（デフォルト: "*"）
- order: ソート順（デフォルト: "name.asc"）
- category: カテゴリーでフィルタ（オプション）
- search: 材料名で検索（オプション）

Response:
[
  {
    id: string
    name: string
    name_kana: string | null
    category: "flour" | "liquid" | "yeast" | "salt" | "other"
    specific_gravity: number | null
    is_bakers_base: boolean
    unit_default: string
    is_micro_ingredient: boolean
    substitute_suggestions: object | null
    created_at: string
    updated_at: string
  }
]
```

### 3.2 材料検索

```typescript
GET /rest/v1/ingredients_master
  ?select=*
  &name.ilike=%{search_term}%
  &or=(name_kana.ilike.%{search_term}%)

Query Parameters:
- search_term: 検索キーワード

Response:
[
  {
    id: string
    name: string
    // ... 他のフィールド
  }
]
```

### 3.3 材料詳細取得

```typescript
GET /rest/v1/ingredients_master
  ?select=*
  &id=eq.{ingredient_id}

Response:
{
  id: string
  name: string
  // ... 他のフィールド
}
```

## 4. レシピAPI

### 4.1 レシピ一覧取得

```typescript
GET /rest/v1/recipes
  ?select=*
  &order=created_at.desc
  &user_id=eq.{user_id}

Query Parameters:
- user_id: ユーザーID（認証済みユーザーのみ）
- is_favorite: お気に入りのみ（オプション）
- limit: 取得件数（デフォルト: 50）
- offset: オフセット（ページネーション用）

Response:
[
  {
    id: string
    user_id: string | null
    title: string
    source_image_url: string | null
    ingredients_json: Ingredient[]
    original_ingredients_json: Ingredient[] | null
    baking_percentages: object | null
    notes: string | null
    is_favorite: boolean
    created_at: string
    updated_at: string
  }
]
```

### 4.2 レシピ詳細取得

```typescript
GET /rest/v1/recipes
  ?select=*
  &id=eq.{recipe_id}

Response:
{
  id: string
  user_id: string | null
  title: string
  source_image_url: string | null
  ingredients_json: Ingredient[]
  original_ingredients_json: Ingredient[] | null
  baking_percentages: object | null
  notes: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}
```

### 4.3 レシピ作成

```typescript
POST /rest/v1/recipes

Headers:
{
  Authorization: "Bearer {access_token}" // オプション
  Content-Type: "application/json"
  Prefer: "return=representation"
}

Request Body:
{
  user_id: string | null // 認証済みユーザーの場合、auth.uid()を使用
  title: string
  source_image_url?: string
  ingredients_json: Ingredient[]
  original_ingredients_json?: Ingredient[]
  baking_percentages?: object
  notes?: string
  is_favorite?: boolean
}

Response:
{
  id: string
  user_id: string | null
  title: string
  // ... 他のフィールド
}
```

### 4.4 レシピ更新

```typescript
PATCH /rest/v1/recipes
  ?id=eq.{recipe_id}

Headers:
{
  Authorization: "Bearer {access_token}" // オプション
  Content-Type: "application/json"
  Prefer: "return=representation"
}

Request Body:
{
  title?: string
  ingredients_json?: Ingredient[]
  baking_percentages?: object
  notes?: string
  is_favorite?: boolean
}

Response:
{
  id: string
  // ... 更新されたフィールド
}
```

### 4.5 レシピ削除

```typescript
DELETE /rest/v1/recipes
  ?id=eq.{recipe_id}

Headers:
{
  Authorization: "Bearer {access_token}" // オプション
}

Response:
204 No Content
```

## 5. ストレージAPI

### 5.1 画像アップロード

```typescript
POST /storage/v1/object/recipe-images/{user_id}/{recipe_id}/original

Headers:
{
  Authorization: "Bearer {access_token}" // オプション
  Content-Type: "image/jpeg" | "image/png"
  x-upsert: "true" // 既存ファイルを上書きする場合
}

Request Body:
Binary image data

Response:
{
  Key: string
  // アップロードされたファイルのパス
}
```

### 5.2 画像URL取得

```typescript
GET /storage/v1/object/public/recipe-images/{user_id}/{recipe_id}/original

// または署名付きURL（プライベートファイルの場合）
POST /storage/v1/object/sign/recipe-images/{user_id}/{recipe_id}/original

Request Body:
{
  expiresIn: number // 秒単位（デフォルト: 3600）
}

Response:
{
  signedURL: string
}
```

### 5.3 画像削除

```typescript
DELETE /storage/v1/object/recipe-images/{user_id}/{recipe_id}/original

Headers:
{
  Authorization: "Bearer {access_token}"
}

Response:
200 OK
```

## 6. ユーザー設定API

### 6.1 設定取得

```typescript
GET /rest/v1/user_settings
  ?select=*
  &user_id=eq.{user_id}

Headers:
{
  Authorization: "Bearer {access_token}"
}

Response:
{
  id: string
  user_id: string
  rounding_mode: "integer" | "decimal"
  decimal_places: number
  default_unit_preferences: object
  ar_overlay_enabled: boolean
  created_at: string
  updated_at: string
}
```

### 6.2 設定作成・更新

```typescript
POST /rest/v1/user_settings
  ?on_conflict=user_id

Headers:
{
  Authorization: "Bearer {access_token}"
  Content-Type: "application/json"
  Prefer: "return=representation"
}

Request Body:
{
  user_id: string
  rounding_mode?: "integer" | "decimal"
  decimal_places?: number
  default_unit_preferences?: object
  ar_overlay_enabled?: boolean
}

Response:
{
  id: string
  user_id: string
  // ... 他のフィールド
}
```

## 7. リアルタイムAPI（Supabase Realtime）

### 7.1 レシピ変更の監視

```typescript
// Supabase Client SDK使用例
const subscription = supabase
  .channel('recipes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'recipes',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Recipe changed:', payload)
    }
  )
  .subscribe()
```

## 8. エラーレスポンス形式

### 8.1 標準エラーレスポンス

```typescript
{
  message: string
  code?: string
  details?: string
  hint?: string
}
```

### 8.2 HTTPステータスコード

- `200 OK`: 成功
- `201 Created`: リソース作成成功
- `204 No Content`: 削除成功
- `400 Bad Request`: リクエストが不正
- `401 Unauthorized`: 認証が必要
- `403 Forbidden`: 権限が不足
- `404 Not Found`: リソースが見つからない
- `409 Conflict`: リソースの競合
- `500 Internal Server Error`: サーバーエラー

## 9. 型定義

### 9.1 Ingredient型

```typescript
interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  y_position?: number // OCR時のY座標
  is_base?: boolean // ベーカーズパーセントの基準か
  is_locked?: boolean // 分量ロックフラグ
  is_checked?: boolean // 計量済みフラグ
}
```

### 9.2 Recipe型

```typescript
interface Recipe {
  id: string
  user_id: string | null
  title: string
  source_image_url: string | null
  ingredients_json: Ingredient[]
  original_ingredients_json: Ingredient[] | null
  baking_percentages: Record<string, number> | null
  notes: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}
```

### 9.3 UserSettings型

```typescript
interface UserSettings {
  id: string
  user_id: string
  rounding_mode: 'integer' | 'decimal'
  decimal_places: number
  default_unit_preferences: Record<string, string>
  ar_overlay_enabled: boolean
  created_at: string
  updated_at: string
}
```

## 10. レート制限

### 10.1 制限値

- 認証API: 1分間に5リクエスト
- レシピAPI: 1分間に60リクエスト
- ストレージAPI: 1分間に30リクエスト

### 10.2 レート制限エラー

```typescript
{
  message: "Rate limit exceeded"
  code: "RATE_LIMIT_EXCEEDED"
  retry_after: number // 秒単位
}
```

## 11. クライアント実装例

### 11.1 Supabase Client初期化

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 11.2 レシピ一覧取得の実装例

```typescript
async function fetchRecipes(userId: string | null) {
  let query = supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else {
    query = query.is('user_id', null)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`)
  }

  return data
}
```

### 11.3 レシピ作成の実装例

```typescript
async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      ...recipe,
      user_id: user?.id || null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create recipe: ${error.message}`)
  }

  return data
}
```

## 12. オフライン対応

### 12.1 オフラインキュー

レシピの保存・更新・削除は、オフライン時にローカルキューに保存し、オンライン復帰時に同期する。

```typescript
interface OfflineQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
}

// AsyncStorageを使用したキュー実装
async function queueOperation(item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) {
  const queue = await AsyncStorage.getItem('offline_queue')
  const items: OfflineQueueItem[] = queue ? JSON.parse(queue) : []
  
  items.push({
    ...item,
    id: uuid(),
    timestamp: Date.now()
  })
  
  await AsyncStorage.setItem('offline_queue', JSON.stringify(items))
}
```

### 12.2 同期処理

```typescript
async function syncOfflineQueue() {
  const queue = await AsyncStorage.getItem('offline_queue')
  if (!queue) return

  const items: OfflineQueueItem[] = JSON.parse(queue)
  
  for (const item of items) {
    try {
      await executeQueuedOperation(item)
      // 成功したアイテムをキューから削除
    } catch (error) {
      console.error('Failed to sync operation:', error)
      // エラーが発生した場合はキューに残す
    }
  }
}
```
