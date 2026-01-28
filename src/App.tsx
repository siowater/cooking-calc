import React from 'react'
import { StatusBar } from 'expo-status-bar'
import AppNavigator from './screens/navigation/AppNavigator'
import ErrorBoundary from './components/common/ErrorBoundary'

// グローバルエラーハンドラー: 未処理のエラーをターミナルに出力
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler()
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error('═══════════════════════════════════════════════════════')
    console.error('🚨 GLOBAL ERROR HANDLER: 未処理のエラーが発生しました')
    console.error('═══════════════════════════════════════════════════════')
    console.error('エラーメッセージ:', error.message)
    console.error('エラーオブジェクト:', error)
    console.error('スタックトレース:', error.stack)
    console.error('致命的なエラー:', isFatal ? 'はい' : 'いいえ')
    console.error('═══════════════════════════════════════════════════════')
    
    // 元のハンドラーも呼び出す
    if (originalHandler) {
      originalHandler(error, isFatal)
    }
  })
}

// Promise rejection ハンドラー
if (typeof global !== 'undefined') {
  const originalUnhandledRejection = global.onunhandledrejection
  global.onunhandledrejection = (event: any) => {
    console.error('═══════════════════════════════════════════════════════')
    console.error('🚨 UNHANDLED PROMISE REJECTION: Promiseが拒否されました')
    console.error('═══════════════════════════════════════════════════════')
    console.error('拒否された理由:', event.reason)
    console.error('エラーオブジェクト:', event.reason)
    if (event.reason && event.reason.stack) {
      console.error('スタックトレース:', event.reason.stack)
    }
    console.error('═══════════════════════════════════════════════════════')
    
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event)
    }
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StatusBar style="auto" />
      <AppNavigator />
    </ErrorBoundary>
  )
}
