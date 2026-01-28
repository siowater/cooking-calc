# Supabase設定ガイド：Baker's Lens

## 1. 設定のタイミング

**推奨**: プロジェクト開発開始前にSupabaseの設定を完了することを推奨します。

**理由**:
- データベース設計が完了しているため、すぐにテーブルを作成できる
- 開発初期からAPI接続をテストできる
- 環境変数の設定が明確になる

## 2. 必要な情報

### 2.1 Supabaseプロジェクト情報

以下の情報を取得・設定する必要があります：

| 情報名 | 説明 | 取得場所 |
|--------|------|----------|
| **Project URL** | SupabaseプロジェクトのURL | Supabaseダッシュボード > Settings > API |
| **Anon Key** | 公開APIキー（フロントエンド用） | Supabaseダッシュボード > Settings > API |
| **Service Role Key** | 管理者APIキー（バックエンド用、注意して扱う） | Supabaseダッシュボード > Settings > API |

### 2.2 データベース接続情報（オプション）

ローカル開発でSupabase CLIを使用する場合：

| 情報名 | 説明 | 取得場所 |
|--------|------|----------|
| **Database Password** | データベースのパスワード | プロジェクト作成時に設定 |
| **Database Host** | データベースホスト | Supabaseダッシュボード > Settings > Database |

## 3. 設定手順

### 3.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. アカウントを作成（またはログイン）
3. 「New Project」をクリック
4. 以下の情報を入力：
   - **Name**: `bakers-lens`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（忘れずに保存）
   - **Region**: 最寄りのリージョンを選択（例: `Tokyo (ap-northeast-1)`）
   - **Pricing Plan**: Free tierで開始可能

5. 「Create new project」をクリック
6. プロジェクトの作成完了を待つ（2-3分）

### 3.2 APIキーの取得

1. Supabaseダッシュボードでプロジェクトを開く
2. 左メニューから「Settings」>「API」を選択
3. 以下の情報をコピー：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（⚠️ 機密情報）

### 3.3 環境変数ファイルの作成

プロジェクトルートに`.env`ファイルを作成：

```bash
# .envファイルを作成（.env.exampleをコピー）
cp .env.example .env
```

`.env`ファイルに以下を記入：

```env
# Supabase設定
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 開発環境用（オプション）
EXPO_PUBLIC_ENV=development
```

**重要**: 
- `.env`ファイルは`.gitignore`に追加して、Gitにコミットしないこと
- 実際のキーは`.env`ファイルにのみ記載し、`.env.example`にはプレースホルダーのみ

### 3.4 データベーステーブルの作成

`docs/database-design.md`を参照して、以下のSQLを実行：

1. Supabaseダッシュボードで「SQL Editor」を開く
2. 以下のSQLを順番に実行：

#### ステップ1: 材料マスタテーブルの作成

```sql
-- ingredients_masterテーブルの作成
CREATE TABLE IF NOT EXISTS ingredients_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_kana TEXT,
  category TEXT NOT NULL,
  specific_gravity NUMERIC(10,3),
  is_bakers_base BOOLEAN DEFAULT false,
  unit_default TEXT DEFAULT 'g',
  is_micro_ingredient BOOLEAN DEFAULT false,
  substitute_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients_master(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients_master(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_name_kana ON ingredients_master(name_kana);
```

#### ステップ2: レシピテーブルの作成

```sql
-- recipesテーブルの作成
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_image_url TEXT,
  source_image_path TEXT,
  ingredients_json JSONB NOT NULL,
  original_ingredients_json JSONB,
  baking_percentages JSONB,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes(is_favorite) WHERE is_favorite = true;
```

#### ステップ3: ユーザー設定テーブルの作成

```sql
-- user_settingsテーブルの作成
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  rounding_mode TEXT DEFAULT 'decimal',
  decimal_places INTEGER DEFAULT 1,
  default_unit_preferences JSONB,
  ar_overlay_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
```

#### ステップ4: RLSポリシーの設定

```sql
-- ingredients_master: 全ユーザーが読み取り可能
ALTER TABLE ingredients_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ingredients_master"
  ON ingredients_master FOR SELECT
  USING (true);

-- recipes: ユーザーは自分のレシピのみアクセス可能
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- user_settings: ユーザーは自分の設定のみアクセス可能
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);
```

#### ステップ5: トリガーの設定

```sql
-- updated_at自動更新関数
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

#### ステップ6: 初期データの投入

```sql
-- 材料マスタの初期データ
INSERT INTO ingredients_master (name, name_kana, category, is_bakers_base, unit_default) VALUES
('強力粉', 'キョウリキコ', 'flour', true, 'g'),
('薄力粉', 'ハクリキコ', 'flour', true, 'g'),
('全粒粉', 'ゼンリュウコ', 'flour', true, 'g'),
('ライ麦粉', 'ライムギコ', 'flour', true, 'g')
ON CONFLICT (name) DO NOTHING;

INSERT INTO ingredients_master (name, name_kana, category, specific_gravity, unit_default) VALUES
('水', 'ミズ', 'liquid', 1.0, 'ml'),
('牛乳', 'ギュウニュウ', 'liquid', 1.03, 'ml'),
('豆乳', 'トウニュウ', 'liquid', 1.02, 'ml'),
('オリーブオイル', 'オリーブオイル', 'liquid', 0.92, 'ml')
ON CONFLICT (name) DO NOTHING;

INSERT INTO ingredients_master (name, name_kana, category, is_micro_ingredient, unit_default) VALUES
('ドライイースト', 'ドライイースト', 'yeast', true, 'g'),
('生イースト', 'ナマイースト', 'yeast', true, 'g'),
('天然酵母', 'テンネンコウボ', 'yeast', true, 'g'),
('塩', 'シオ', 'salt', true, 'g'),
('砂糖', 'サトウ', 'other', false, 'g'),
('はちみつ', 'ハチミツ', 'other', false, 'g')
ON CONFLICT (name) DO NOTHING;
```

### 3.5 ストレージバケットの作成

1. Supabaseダッシュボードで「Storage」を開く
2. 「New bucket」をクリック
3. 以下の設定：
   - **Name**: `recipe-images`
   - **Public bucket**: オフ（プライベート）
   - **File size limit**: 10MB
   - **Allowed MIME types**: `image/jpeg, image/png`

4. 「Create bucket」をクリック

5. RLSポリシーを設定（SQL Editorで実行）：

```sql
-- ストレージバケットのRLSポリシー
CREATE POLICY "Users can upload own recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NULL)
  );

CREATE POLICY "Users can read own recipe images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recipe-images' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NULL)
  );

CREATE POLICY "Users can delete own recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 4. 設定情報の管理

### 4.1 情報の記載場所

| 情報の種類 | 記載場所 | 説明 |
|-----------|---------|------|
| **実際のAPIキー** | `.env`ファイル | ローカル開発用（Gitにコミットしない） |
| **プレースホルダー** | `.env.example`ファイル | テンプレート（Gitにコミットする） |
| **設定手順** | `docs/supabase-setup.md` | このドキュメント |
| **データベース設計** | `docs/database-design.md` | テーブル設計の詳細 |

### 4.2 .gitignoreの設定

`.gitignore`ファイルに以下を追加（存在しない場合は作成）：

```gitignore
# 環境変数
.env
.env.local
.env.*.local

# Supabase（ローカル開発用）
.supabase/
```

### 4.3 チーム共有時の注意

- `.env`ファイルは共有しない（各開発者が自分で作成）
- `.env.example`ファイルを更新して、必要な環境変数を明示
- SupabaseプロジェクトのURLとAnon Keyは、チーム内で共有可能（公開情報）
- Service Role Keyは絶対に共有しない（機密情報）

## 5. 接続テスト

**詳細な手順は [Supabase接続テストガイド](./supabase-connection-test.md) を参照してください。**

### 5.1 クイックテスト

1. Supabase Clientをインストール:
   ```bash
   npm install @supabase/supabase-js
   ```

2. 接続テストスクリプトを実行（`docs/supabase-connection-test.md`を参照）

3. または、Expoアプリ内で接続テストを実行

### 5.2 データベース接続の確認

Supabaseダッシュボードで以下を確認：

1. **Table Editor**: テーブルが正しく作成されているか
2. **SQL Editor**: クエリが実行できるか
3. **API**: APIエンドポイントが利用可能か

**詳細な接続テストの手順は [Supabase接続テストガイド](./supabase-connection-test.md) を参照してください。**

## 6. トラブルシューティング

### 6.1 環境変数が読み込まれない

**問題**: `process.env.EXPO_PUBLIC_SUPABASE_URL`が`undefined`

**解決策**:
1. `.env`ファイルがプロジェクトルートにあるか確認
2. 環境変数名が`EXPO_PUBLIC_`で始まっているか確認（Expoの要件）
3. アプリを再起動（`expo start -c`でキャッシュクリア）

### 6.2 RLSポリシーエラー

**問題**: データにアクセスできない

**解決策**:
1. RLSポリシーが正しく設定されているか確認
2. 認証状態を確認（`auth.uid()`が正しく取得できているか）
3. ポリシーの条件を確認

### 6.3 ストレージアップロードエラー

**問題**: 画像のアップロードが失敗する

**解決策**:
1. バケット名が正しいか確認
2. RLSポリシーが設定されているか確認
3. ファイルサイズが制限内か確認（10MB）

## 7. 次のステップ

Supabase設定完了後：

1. ✅ 環境変数が正しく設定されている
2. ✅ データベーステーブルが作成されている
3. ✅ RLSポリシーが設定されている
4. ✅ ストレージバケットが作成されている
5. ✅ 接続テストが成功している

次は、[開発環境セットアップガイド](./setup-guide.md)に従って、Expoプロジェクトのセットアップを進めてください。
