// app.config.js - 環境変数を読み込む設定ファイル
require('dotenv').config()

// 環境変数の確認
console.log('Environment variables:', {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  googleCloudVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY ? 'Set' : 'Not set',
})

module.exports = {
  expo: {
    name: "Baker's Lens",
    slug: "bakers-lens",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    scheme: "bakerslens",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bakerslens.app",
      infoPlist: {
        NSCameraUsageDescription: "レシピをスキャンするためにカメラへのアクセスが必要です。",
        NSPhotoLibraryUsageDescription: "レシピ画像を保存・選択するためにフォトライブラリへのアクセスが必要です。"
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.bakerslens.app",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "レシピ画像を選択するためにフォトライブラリへのアクセスが必要です。",
          cameraPermission: "レシピをスキャンするためにカメラへのアクセスが必要です。"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: ""
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleCloudVisionApiKey: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY
    }
  }
}
