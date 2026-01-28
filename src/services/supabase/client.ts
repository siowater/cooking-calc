import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// 環境変数から設定を取得
// app.config.jsのextraセクションから読み込む、またはEXPO_PUBLIC_プレフィックス付きの環境変数を使用
const supabaseUrl = 
  Constants.expoConfig?.extra?.supabaseUrl || 
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://spjwjbtvholpiwzceaot.supabase.co' // フォールバック

const supabaseAnonKey = 
  Constants.expoConfig?.extra?.supabaseAnonKey || 
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_qOKCEDbzSVWdYhH6dmMDTw_Uv78mQ3z' // フォールバック

// 環境変数の検証
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Supabase Clientの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 型定義（後でデータベースの型を生成して追加）
export type Database = {
  public: {
    Tables: {
      ingredients_master: {
        Row: {
          id: string
          name: string
          name_kana: string | null
          category: string
          specific_gravity: number | null
          is_bakers_base: boolean
          unit_default: string
          is_micro_ingredient: boolean
          substitute_suggestions: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_kana?: string | null
          category: string
          specific_gravity?: number | null
          is_bakers_base?: boolean
          unit_default?: string
          is_micro_ingredient?: boolean
          substitute_suggestions?: Record<string, unknown> | null
        }
        Update: {
          id?: string
          name?: string
          name_kana?: string | null
          category?: string
          specific_gravity?: number | null
          is_bakers_base?: boolean
          unit_default?: string
          is_micro_ingredient?: boolean
          substitute_suggestions?: Record<string, unknown> | null
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string | null
          title: string
          source_image_url: string | null
          source_image_path: string | null
          ingredients_json: Record<string, unknown>
          original_ingredients_json: Record<string, unknown> | null
          baking_percentages: Record<string, unknown> | null
          notes: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          source_image_url?: string | null
          source_image_path?: string | null
          ingredients_json: Record<string, unknown>
          original_ingredients_json?: Record<string, unknown> | null
          baking_percentages?: Record<string, unknown> | null
          notes?: string | null
          is_favorite?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          source_image_url?: string | null
          source_image_path?: string | null
          ingredients_json?: Record<string, unknown>
          original_ingredients_json?: Record<string, unknown> | null
          baking_percentages?: Record<string, unknown> | null
          notes?: string | null
          is_favorite?: boolean
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          rounding_mode: string
          decimal_places: number
          default_unit_preferences: Record<string, unknown> | null
          ar_overlay_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rounding_mode?: string
          decimal_places?: number
          default_unit_preferences?: Record<string, unknown> | null
          ar_overlay_enabled?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          rounding_mode?: string
          decimal_places?: number
          default_unit_preferences?: Record<string, unknown> | null
          ar_overlay_enabled?: boolean
        }
      }
    }
  }
}
