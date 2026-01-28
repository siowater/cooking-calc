# Supabase接続テストガイド

## 1. 前提条件

- Node.jsがインストールされていること
- Expoプロジェクトが初期化されていること（または初期化する準備ができていること）

## 2. Supabase Clientのインストール

### 2.1 パッケージのインストール

プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
npm install @supabase/supabase-js
```

または、yarnを使用する場合：

```bash
yarn add @supabase/supabase-js
```

### 2.2 環境変数の確認

`.env`ファイルが正しく設定されているか確認：

```env
EXPO_PUBLIC_SUPABASE_URL=https://spjwjbtvholpiwzceaot.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qOKCEDbzSVWdYhH6dmMDTw_Uv78mQ3z
```

**重要**: 環境変数名は`EXPO_PUBLIC_`で始まる必要があります（Expoの要件）。

## 3. Supabase Clientの作成

### 3.1 ディレクトリ構造の作成

プロジェクトに以下のディレクトリ構造を作成：

```
src/
  services/
    supabase/
      client.ts
      test-connection.ts
```

### 3.2 Supabase Clientファイルの作成

`src/services/supabase/client.ts`を作成：

```typescript
import { createClient } from '@supabase/supabase-js'

// 環境変数から設定を取得
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  )
}

// Supabase Clientの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義（後で追加）
export type Database = {
  // データベースの型定義は後で追加
}
```

## 4. 接続テストの実装

### 4.1 接続テストファイルの作成

`src/services/supabase/test-connection.ts`を作成：

```typescript
import { supabase } from './client'

/**
 * Supabaseへの接続をテストする関数
 * @returns 接続成功時はtrue、失敗時はfalse
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Supabase接続テストを開始...')
    
    // 方法1: 材料マスタテーブルから1件取得してテスト
    const { data, error } = await supabase
      .from('ingredients_master')
      .select('id, name')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase接続エラー:', error.message)
      console.error('エラー詳細:', error)
      return false
    }
    
    console.log('✅ Supabase接続成功!')
    console.log('取得したデータ:', data)
    return true
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    return false
  }
}

/**
 * データベースのテーブル一覧を取得してテスト
 */
export async function testDatabaseTables(): Promise<void> {
  try {
    console.log('🔍 データベーステーブルの確認...')
    
    // 各テーブルから1件ずつ取得してテスト
    const tables = [
      'ingredients_master',
      'recipes',
      'user_settings'
    ]
    
    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ ${tableName} テーブルエラー:`, error.message)
      } else {
        console.log(`✅ ${tableName} テーブル: OK (${data?.length || 0}件)`)
      }
    }
    
  } catch (error) {
    console.error('❌ テーブル確認エラー:', error)
  }
}

/**
 * 環境変数の確認
 */
export function checkEnvironmentVariables(): void {
  console.log('🔍 環境変数の確認...')
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  
  if (supabaseUrl) {
    console.log('✅ EXPO_PUBLIC_SUPABASE_URL: 設定済み')
    console.log('   URL:', supabaseUrl)
  } else {
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL: 未設定')
  }
  
  if (supabaseAnonKey) {
    console.log('✅ EXPO_PUBLIC_SUPABASE_ANON_KEY: 設定済み')
    console.log('   キー:', supabaseAnonKey.substring(0, 20) + '...')
  } else {
    console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY: 未設定')
  }
}
```

## 5. テストの実行方法

### 5.1 方法1: 簡単なテストスクリプトを作成

プロジェクトルートに`test-supabase.js`を作成：

```javascript
// test-supabase.js
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('   .envファイルを確認してください')
  process.exit(1)
}

console.log('🔍 Supabase接続テストを開始...')
console.log('   URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  try {
    // 材料マスタテーブルから取得してテスト
    const { data, error } = await supabase
      .from('ingredients_master')
      .select('id, name')
      .limit(5)
    
    if (error) {
      console.error('❌ エラー:', error.message)
      console.error('   詳細:', error)
      process.exit(1)
    }
    
    console.log('✅ 接続成功!')
    console.log('   取得したデータ:', data)
    console.log(`   件数: ${data?.length || 0}件`)
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  }
}

test()
```

**実行方法**:

```bash
# dotenvパッケージをインストール（まだの場合）
npm install dotenv

# テストを実行
node test-supabase.js
```

### 5.2 方法2: Expoアプリ内でテスト

Expoアプリが既に作成されている場合、App.tsxや最初の画面でテスト：

```typescript
// App.tsx または最初の画面コンポーネント
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { testSupabaseConnection, checkEnvironmentVariables } from './src/services/supabase/test-connection'

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    async function runTest() {
      // 環境変数の確認
      checkEnvironmentVariables()
      
      // 接続テスト
      const success = await testSupabaseConnection()
      
      if (success) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
        setErrorMessage('Supabaseへの接続に失敗しました')
      }
    }
    
    runTest()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase接続テスト</Text>
      
      {connectionStatus === 'checking' && (
        <Text style={styles.status}>接続を確認中...</Text>
      )}
      
      {connectionStatus === 'success' && (
        <Text style={[styles.status, styles.success]}>✅ 接続成功!</Text>
      )}
      
      {connectionStatus === 'error' && (
        <>
          <Text style={[styles.status, styles.error]}>❌ 接続失敗</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginTop: 10,
  },
  success: {
    color: 'green',
  },
  error: {
    color: 'red',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
})
```

## 6. よくあるエラーと解決方法

### 6.1 環境変数が読み込まれない

**エラー**: `Missing Supabase environment variables`

**解決方法**:
1. `.env`ファイルがプロジェクトルートにあるか確認
2. 環境変数名が`EXPO_PUBLIC_`で始まっているか確認
3. Expoアプリの場合は、アプリを再起動（`expo start -c`でキャッシュクリア）

### 6.2 テーブルが見つからない

**エラー**: `relation "ingredients_master" does not exist`

**解決方法**:
1. Supabaseダッシュボードでテーブルが作成されているか確認
2. `docs/supabase-setup.md`のSQLを実行してテーブルを作成

### 6.3 RLSポリシーエラー

**エラー**: `new row violates row-level security policy`

**解決方法**:
1. SupabaseダッシュボードでRLSポリシーが設定されているか確認
2. `docs/supabase-setup.md`のRLSポリシー設定SQLを実行

### 6.4 ネットワークエラー

**エラー**: `Network request failed`

**解決方法**:
1. インターネット接続を確認
2. Supabaseプロジェクトがアクティブか確認（ダッシュボードで確認）
3. URLが正しいか確認

## 7. 接続テストの確認項目

✅ チェックリスト:

- [ ] `@supabase/supabase-js`がインストールされている
- [ ] `.env`ファイルが正しく設定されている
- [ ] 環境変数が読み込まれている
- [ ] Supabase Clientが作成できる
- [ ] データベースに接続できる
- [ ] テーブルからデータを取得できる

## 8. 次のステップ

接続テストが成功したら：

1. ✅ Supabase Clientを使用してアプリを開発
2. ✅ データベーステーブルからデータを取得・保存
3. ✅ 認証機能の実装（必要に応じて）
4. ✅ ストレージへの画像アップロード機能の実装

## 9. 参考資料

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [プロジェクトのSupabase設定ガイド](./supabase-setup.md)
