import { OCRTextBlock, OCRResult, ParsedIngredient } from '../../types/ocr'
import { parseOCRResult } from '../../utils/ocr-parser'
import { cloudVisionService } from './cloudVisionService'

/**
 * OCRサービス
 * Cloud Vision API を使用してOCR処理を実行
 * 将来的にはVision Camera + ML Kit OCRに移行予定
 */
export class OCRService {
  /**
   * Cloud Vision APIが設定されているかチェック
   */
  isCloudVisionConfigured(): boolean {
    return cloudVisionService.isConfigured()
  }

  /**
   * OCR処理を実行
   * Cloud Vision APIが設定されていればそれを使用、なければモックデータを返す
   */
  async processImage(imageUri: string): Promise<OCRResult> {
    try {
      console.log('OCR処理開始:', imageUri)
      
      // Cloud Vision APIでOCR実行
      const textBlocks = await cloudVisionService.performOCR(imageUri)
      console.log('═══════════════════════════════════════════════════════')
      console.log('📝 OCR認識結果:', textBlocks.length, '個のテキストブロックを検出')
      console.log('═══════════════════════════════════════════════════════')
      
      // 認識されたテキストをすべてログ出力
      textBlocks.forEach((block, index) => {
        console.log(`[${index}] "${block.text}" (y=${block.boundingBox.y})`)
      })
      console.log('═══════════════════════════════════════════════════════')
      
      // テキストブロックから材料とタイマーを抽出
      return this.processTextBlocks(textBlocks)
    } catch (error) {
      console.error('OCR処理エラー:', error)
      throw error
    }
  }

  /**
   * テキストブロックからOCR結果を生成
   */
  processTextBlocks(textBlocks: OCRTextBlock[]): OCRResult {
    const { ingredients, timers } = parseOCRResult(textBlocks)
    
    console.log('パース結果:', {
      材料数: ingredients.length,
      タイマー数: timers.length,
    })
    
    return {
      textBlocks,
      ingredients,
      timers,
    }
  }

  /**
   * モックOCR処理を実行（テスト用）
   */
  async processImageMock(): Promise<OCRResult> {
    console.log('モックOCR処理を実行')
    
    const mockTextBlocks: OCRTextBlock[] = [
      {
        text: '強力粉',
        boundingBox: { x: 10, y: 100, width: 60, height: 20 },
        confidence: 0.95,
      },
      {
        text: '250',
        boundingBox: { x: 200, y: 105, width: 30, height: 20 },
        confidence: 0.98,
      },
      {
        text: 'g',
        boundingBox: { x: 235, y: 105, width: 15, height: 20 },
        confidence: 0.99,
      },
      {
        text: '水',
        boundingBox: { x: 10, y: 130, width: 30, height: 20 },
        confidence: 0.94,
      },
      {
        text: '150',
        boundingBox: { x: 200, y: 135, width: 30, height: 20 },
        confidence: 0.97,
      },
      {
        text: 'ml',
        boundingBox: { x: 235, y: 135, width: 20, height: 20 },
        confidence: 0.99,
      },
      {
        text: '塩',
        boundingBox: { x: 10, y: 160, width: 20, height: 20 },
        confidence: 0.92,
      },
      {
        text: '5',
        boundingBox: { x: 200, y: 165, width: 15, height: 20 },
        confidence: 0.96,
      },
      {
        text: 'g',
        boundingBox: { x: 220, y: 165, width: 15, height: 20 },
        confidence: 0.99,
      },
      {
        text: 'ドライイースト',
        boundingBox: { x: 10, y: 190, width: 80, height: 20 },
        confidence: 0.91,
      },
      {
        text: '3',
        boundingBox: { x: 200, y: 195, width: 15, height: 20 },
        confidence: 0.97,
      },
      {
        text: 'g',
        boundingBox: { x: 220, y: 195, width: 15, height: 20 },
        confidence: 0.99,
      },
      {
        text: '砂糖',
        boundingBox: { x: 10, y: 220, width: 40, height: 20 },
        confidence: 0.93,
      },
      {
        text: '20',
        boundingBox: { x: 200, y: 225, width: 20, height: 20 },
        confidence: 0.96,
      },
      {
        text: 'g',
        boundingBox: { x: 225, y: 225, width: 15, height: 20 },
        confidence: 0.99,
      },
      {
        text: 'バター',
        boundingBox: { x: 10, y: 250, width: 50, height: 20 },
        confidence: 0.94,
      },
      {
        text: '30',
        boundingBox: { x: 200, y: 255, width: 20, height: 20 },
        confidence: 0.97,
      },
      {
        text: 'g',
        boundingBox: { x: 225, y: 255, width: 15, height: 20 },
        confidence: 0.99,
      },
    ]

    return this.processTextBlocks(mockTextBlocks)
  }
}

export const ocrService = new OCRService()
