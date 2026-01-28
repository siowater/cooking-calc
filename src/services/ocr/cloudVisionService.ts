import * as FileSystem from 'expo-file-system/legacy'
import { OCRTextBlock } from '../../types/ocr'

// Google Cloud Vision API エンドポイント
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate'

/**
 * Google Cloud Vision APIのレスポンス型
 */
interface VisionAPIResponse {
  responses: {
    textAnnotations?: {
      description: string
      boundingPoly: {
        vertices: { x: number; y: number }[]
      }
    }[]
    fullTextAnnotation?: {
      text: string
      pages: {
        blocks: {
          paragraphs: {
            words: {
              symbols: {
                text: string
                boundingBox: {
                  vertices: { x: number; y: number }[]
                }
              }[]
              boundingBox: {
                vertices: { x: number; y: number }[]
              }
            }[]
          }[]
          boundingBox: {
            vertices: { x: number; y: number }[]
          }
        }[]
      }[]
    }
    error?: {
      code: number
      message: string
    }
  }[]
}

/**
 * Cloud Vision APIサービス
 */
export class CloudVisionService {
  private apiKey: string | null = null

  constructor() {
    // 環境変数からAPIキーを取得
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY || null
  }

  /**
   * APIキーが設定されているかチェック
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0
  }

  /**
   * 画像ファイルをBase64エンコード
   */
  async encodeImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      return base64
    } catch (error) {
      console.error('画像のBase64エンコードに失敗:', error)
      throw new Error('画像の読み込みに失敗しました')
    }
  }

  /**
   * Google Cloud Vision APIでOCR処理を実行
   */
  async performOCR(imageUri: string): Promise<OCRTextBlock[]> {
    if (!this.apiKey) {
      console.warn('Cloud Vision API キーが設定されていません。モックデータを使用します。')
      return this.getMockTextBlocks()
    }

    try {
      // 画像をBase64エンコード
      const base64Image = await this.encodeImageToBase64(imageUri)

      // Vision API リクエストボディ
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50,
              },
            ],
            imageContext: {
              languageHints: ['ja', 'en'],
            },
          },
        ],
      }

      // APIリクエスト
      const response = await fetch(`${VISION_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Vision API エラー:', response.status, errorText)
        throw new Error(`Vision API エラー: ${response.status}`)
      }

      const data: VisionAPIResponse = await response.json()

      // エラーチェック
      if (data.responses[0]?.error) {
        throw new Error(data.responses[0].error.message)
      }

      // テキストブロックに変換
      return this.parseVisionResponse(data)
    } catch (error) {
      console.error('OCR処理エラー:', error)
      throw error
    }
  }

  /**
   * Vision APIレスポンスをOCRTextBlock形式に変換
   */
  private parseVisionResponse(data: VisionAPIResponse): OCRTextBlock[] {
    const textBlocks: OCRTextBlock[] = []
    const annotations = data.responses[0]?.textAnnotations

    if (!annotations || annotations.length === 0) {
      return textBlocks
    }

    // 最初の要素は全体のテキストなのでスキップ
    for (let i = 1; i < annotations.length; i++) {
      const annotation = annotations[i]
      const vertices = annotation.boundingPoly.vertices

      // バウンディングボックスを計算
      const x = Math.min(...vertices.map((v) => v.x || 0))
      const y = Math.min(...vertices.map((v) => v.y || 0))
      const maxX = Math.max(...vertices.map((v) => v.x || 0))
      const maxY = Math.max(...vertices.map((v) => v.y || 0))

      textBlocks.push({
        text: annotation.description,
        boundingBox: {
          x,
          y,
          width: maxX - x,
          height: maxY - y,
        },
        confidence: 0.9, // Vision APIは個別の信頼度を返さないため固定値
      })
    }

    return textBlocks
  }

  /**
   * モックテキストブロック（APIキーがない場合のテスト用）
   */
  private getMockTextBlocks(): OCRTextBlock[] {
    return [
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
  }
}

export const cloudVisionService = new CloudVisionService()
