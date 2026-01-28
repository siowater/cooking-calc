/**
 * OCRテキストブロックの型定義
 */
export interface OCRTextBlock {
  text: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence?: number
}

/**
 * OCR結果の型定義
 */
export interface OCRResult {
  textBlocks: OCRTextBlock[]
  ingredients: ParsedIngredient[]
  timers: ParsedTimer[]
}

/**
 * パースされた材料の型定義
 */
export interface ParsedIngredient {
  id: string
  name: string
  amount: number
  unit: string
  y_position: number
  confidence?: number
}

/**
 * パースされたタイマーの型定義
 */
export interface ParsedTimer {
  step: string
  minutes: number
  y_position: number
}
