import { supabase } from './client'

/**
 * Supabaseへの接続をテストする関数
 * @returns 接続成功時はtrue、失敗時はfalse
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Supabase接続テストを開始...')
    
    // 材料マスタテーブルから1件取得してテスト
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
