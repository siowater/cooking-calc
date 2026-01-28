// Supabase接続テストスクリプト
// 実行方法: node test-supabase.js

// dotenvパッケージを使用して環境変数を読み込む
// インストール: npm install dotenv
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')

// 環境変数の取得
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('   .envファイルを確認してください')
  console.error('   必要な環境変数:')
  console.error('   - EXPO_PUBLIC_SUPABASE_URL')
  console.error('   - EXPO_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🔍 Supabase接続テストを開始...')
console.log('   URL:', supabaseUrl)
console.log('   キー:', supabaseAnonKey.substring(0, 20) + '...')
console.log('')

// Supabase Clientの作成
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('📊 データベーステーブルの確認...')
    console.log('')
    
    // 各テーブルをテスト
    const tables = [
      { name: 'ingredients_master', description: '材料マスタ' },
      { name: 'recipes', description: 'レシピ' },
      { name: 'user_settings', description: 'ユーザー設定' }
    ]
    
    let successCount = 0
    let errorCount = 0
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)
        
        if (error) {
          console.error(`❌ ${table.description} (${table.name}):`, error.message)
          errorCount++
        } else {
          console.log(`✅ ${table.description} (${table.name}): OK`)
          if (data && data.length > 0) {
            console.log(`   データあり: ${JSON.stringify(data[0], null, 2)}`)
          } else {
            console.log(`   データなし（テーブルは存在します）`)
          }
          successCount++
        }
      } catch (err) {
        console.error(`❌ ${table.description} (${table.name}): 予期しないエラー`, err.message)
        errorCount++
      }
      console.log('')
    }
    
    // 結果サマリー
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ 成功: ${successCount}テーブル`)
    console.log(`❌ エラー: ${errorCount}テーブル`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    
    if (errorCount === 0) {
      console.log('🎉 すべてのテーブルに正常に接続できました！')
      process.exit(0)
    } else {
      console.log('⚠️  一部のテーブルでエラーが発生しました')
      console.log('   docs/supabase-setup.md のSQLを実行してテーブルを作成してください')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error)
    process.exit(1)
  }
}

// テスト実行
testConnection()
