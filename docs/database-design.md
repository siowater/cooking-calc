# データベース設計書：Baker's Lens

## 1. データベース概要

Supabase（PostgreSQL）を使用したデータベース設計。認証はオプションとし、ノーログイン利用も可能。

## 2. テーブル設計

### 2.1 ingredients_master（材料マスタ）

材料の属性情報を管理するマスタテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 材料ID |
| name | TEXT | NOT NULL, UNIQUE | 材料名（例: "強力粉"） |
| name_kana | TEXT | | 材料名の読み仮名（検索用） |
| category | TEXT | NOT NULL | カテゴリー（"flour", "liquid", "yeast", "salt", "other"） |
| specific_gravity | NUMERIC(10,3) | | 比重（g/ml）。液体材料用 |
| is_bakers_base | BOOLEAN | DEFAULT false | ベーカーズパーセントの基準となるか（通常は粉類） |
| unit_default | TEXT | DEFAULT 'g' | デフォルト単位（"g", "ml", "個", "tsp", "tbsp"） |
| is_micro_ingredient | BOOLEAN | DEFAULT false | 微量材料フラグ（塩・イースト等、強調表示用） |
| substitute_suggestions | JSONB | | 代替材料のサジェスト（例: {"milk": {"soy_milk": 1.0}}） |
| created_at | TIMESTAMPTZ | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT now() | 更新日時 |

**インデックス**:
- `CREATE INDEX idx_ingredients_name ON ingredients_master(name);`
- `CREATE INDEX idx_ingredients_category ON ingredients_master(category);`
- `CREATE INDEX idx_ingredients_name_kana ON ingredients_master(name_kana);`（検索用）

**RLSポリシー**:
```sql
-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read ingredients_master"
  ON ingredients_master FOR SELECT
  USING (true);
```

### 2.2 recipes（レシピ）

ユーザーが保存したレシピ情報を管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | レシピID |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | ユーザーID（NULL可、ノーログイン利用時） |
| title | TEXT | NOT NULL | レシピタイトル |
| source_image_url | TEXT | | OCR元画像のSupabase Storage URL |
| source_image_path | TEXT | | Storage内のパス |
| ingredients_json | JSONB | NOT NULL | 材料リストのJSON（OCR結果 + 調整後） |
| original_ingredients_json | JSONB | | OCRで読み取った元の材料リスト |
| baking_percentages | JSONB | | ベーカーズパーセント（計算結果） |
| notes | TEXT | | ユーザーのメモ |
| is_favorite | BOOLEAN | DEFAULT false | お気に入りフラグ |
| created_at | TIMESTAMPTZ | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT now() | 更新日時 |

**ingredients_jsonの構造例**:
```json
[
  {
    "id": "temp-uuid-1",
    "name": "強力粉",
    "amount": 250,
    "unit": "g",
    "y_position": 100,
    "is_base": true,
    "is_locked": false,
    "is_checked": false
  },
  {
    "id": "temp-uuid-2",
    "name": "水",
    "amount": 150,
    "unit": "ml",
    "y_position": 120,
    "is_base": false,
    "is_locked": false,
    "is_checked": false
  }
]
```

**インデックス**:
- `CREATE INDEX idx_recipes_user_id ON recipes(user_id);`
- `CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);`
- `CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite) WHERE is_favorite = true;`

**RLSポリシー**:
```sql
-- ユーザーは自分のレシピのみ読み取り可能
CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のレシピのみ作成可能
CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のレシピのみ更新可能
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のレシピのみ削除可能
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);
```

### 2.3 recipe_timers（レシピタイマー）

レシピから抽出した時間情報を管理するテーブル（将来的な拡張用）。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | タイマーID |
| recipe_id | UUID | REFERENCES recipes(id) ON DELETE CASCADE | レシピID |
| step_name | TEXT | | 工程名（例: "一次発酵"） |
| duration_minutes | INTEGER | NOT NULL | 時間（分） |
| order_index | INTEGER | | 順序 |
| created_at | TIMESTAMPTZ | DEFAULT now() | 作成日時 |

**インデックス**:
- `CREATE INDEX idx_recipe_timers_recipe_id ON recipe_timers(recipe_id);`

**RLSポリシー**:
```sql
-- レシピと同じRLSポリシーを適用（JOIN経由）
CREATE POLICY "Users can read timers for own recipes"
  ON recipe_timers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_timers.recipe_id
      AND (recipes.user_id = auth.uid() OR recipes.user_id IS NULL)
    )
  );
```

### 2.4 user_settings（ユーザー設定）

ユーザーごとのアプリ設定を管理するテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 設定ID |
| user_id | UUID | REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE | ユーザーID |
| rounding_mode | TEXT | DEFAULT 'decimal' | 丸めモード（"integer", "decimal"） |
| decimal_places | INTEGER | DEFAULT 1 | 小数点桁数（decimalモード時） |
| default_unit_preferences | JSONB | | 材料カテゴリーごとのデフォルト単位設定 |
| ar_overlay_enabled | BOOLEAN | DEFAULT true | ARオーバーレイ表示の有効/無効 |
| created_at | TIMESTAMPTZ | DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT now() | 更新日時 |

**default_unit_preferencesの構造例**:
```json
{
  "flour": "g",
  "liquid": "ml",
  "yeast": "g",
  "salt": "g"
}
```

**インデックス**:
- `CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);`

**RLSポリシー**:
```sql
-- ユーザーは自分の設定のみ読み取り・更新可能
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);
```

## 3. ストレージバケット設計

### 3.1 recipe-images（レシピ画像）

OCR元画像を保存するストレージバケット。

**設定**:
- パブリックアクセス: なし（認証済みユーザーのみ）
- ファイルサイズ制限: 10MB
- 許可されるファイル形式: jpg, jpeg, png

**RLSポリシー**:
```sql
-- ユーザーは自分の画像のみアップロード可能
CREATE POLICY "Users can upload own recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NULL)
  );

-- ユーザーは自分の画像のみ読み取り可能
CREATE POLICY "Users can read own recipe images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recipe-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NULL)
  );

-- ユーザーは自分の画像のみ削除可能
CREATE POLICY "Users can delete own recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**ファイルパス構造**:
```
recipe-images/
  {user_id}/
    {recipe_id}/
      original.{ext}
```

## 4. データベース関数・トリガー

### 4.1 updated_at自動更新トリガー

```sql
-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_ingredients_master_updated_at
  BEFORE UPDATE ON ingredients_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 ベーカーズパーセント計算関数

```sql
-- ベーカーズパーセントを計算する関数
CREATE OR REPLACE FUNCTION calculate_bakers_percentages(
  ingredients JSONB,
  base_ingredient_id TEXT
)
RETURNS JSONB AS $$
DECLARE
  base_amount NUMERIC;
  result JSONB := '{}'::JSONB;
  ingredient JSONB;
BEGIN
  -- 基準材料の量を取得
  SELECT (ingredients->>'amount')::NUMERIC INTO base_amount
  FROM jsonb_array_elements(ingredients) AS elem
  WHERE elem->>'id' = base_ingredient_id;

  -- 各材料のパーセンテージを計算
  FOR ingredient IN SELECT * FROM jsonb_array_elements(ingredients)
  LOOP
    result := result || jsonb_build_object(
      ingredient->>'id',
      ROUND(((ingredient->>'amount')::NUMERIC / base_amount * 100)::NUMERIC, 2)
    );
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## 5. 初期データ（シードデータ）

### 5.1 材料マスタの初期データ

```sql
-- 粉類
INSERT INTO ingredients_master (name, name_kana, category, is_bakers_base, unit_default) VALUES
('強力粉', 'キョウリキコ', 'flour', true, 'g'),
('薄力粉', 'ハクリキコ', 'flour', true, 'g'),
('全粒粉', 'ゼンリュウコ', 'flour', true, 'g'),
('ライ麦粉', 'ライムギコ', 'flour', true, 'g');

-- 液体類
INSERT INTO ingredients_master (name, name_kana, category, specific_gravity, unit_default) VALUES
('水', 'ミズ', 'liquid', 1.0, 'ml'),
('牛乳', 'ギュウニュウ', 'liquid', 1.03, 'ml'),
('豆乳', 'トウニュウ', 'liquid', 1.02, 'ml'),
('オリーブオイル', 'オリーブオイル', 'liquid', 0.92, 'ml');

-- イースト・発酵剤
INSERT INTO ingredients_master (name, name_kana, category, is_micro_ingredient, unit_default) VALUES
('ドライイースト', 'ドライイースト', 'yeast', true, 'g'),
('生イースト', 'ナマイースト', 'yeast', true, 'g'),
('天然酵母', 'テンネンコウボ', 'yeast', true, 'g');

-- 塩・糖類
INSERT INTO ingredients_master (name, name_kana, category, is_micro_ingredient, unit_default) VALUES
('塩', 'シオ', 'salt', true, 'g'),
('砂糖', 'サトウ', 'other', false, 'g'),
('はちみつ', 'ハチミツ', 'other', false, 'g');
```

## 6. マイグレーション戦略

### 6.1 バージョン管理

Supabaseのマイグレーション機能を使用し、SQLファイルでバージョン管理する。

**ディレクトリ構造**:
```
supabase/
  migrations/
    20260128000000_create_ingredients_master.sql
    20260128000001_create_recipes.sql
    20260128000002_create_recipe_timers.sql
    20260128000003_create_user_settings.sql
    20260128000004_create_storage_bucket.sql
    20260128000005_seed_ingredients_master.sql
```

### 6.2 ロールバック計画

各マイグレーションファイルに対応するロールバックSQLを作成する。

## 7. パフォーマンス最適化

### 7.1 クエリ最適化

- 材料マスタの検索: インデックス活用
- レシピ一覧の取得: `created_at`でソート、ページネーション実装
- 画像の読み込み: CDN経由での配信

### 7.2 キャッシュ戦略

- 材料マスタ: アプリ起動時にローカルキャッシュ
- レシピ一覧: Supabaseのキャッシュ機能を活用

## 8. バックアップ・リカバリ

### 8.1 バックアップ戦略

- Supabaseの自動バックアップを有効化
- 日次バックアップの保持期間: 7日間
- 週次バックアップの保持期間: 4週間

### 8.2 リカバリ計画

- ポイントインタイムリカバリ（PITR）の利用
- テスト環境でのリカバリ手順の文書化
