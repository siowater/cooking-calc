import { OCRTextBlock, ParsedIngredient, ParsedTimer } from '../types/ocr'

/**
 * 同じ行のテキストブロックをグループ化
 */
export function groupTextBlocksByLine(
  textBlocks: OCRTextBlock[],
  tolerance: number = 15
): OCRTextBlock[][] {
  if (textBlocks.length === 0) return []

  // Y座標でソート
  const sorted = [...textBlocks].sort((a, b) => a.boundingBox.y - b.boundingBox.y)
  
  const lines: OCRTextBlock[][] = []
  let currentLine: OCRTextBlock[] = [sorted[0]]
  let currentY = sorted[0].boundingBox.y

  for (let i = 1; i < sorted.length; i++) {
    const block = sorted[i]
    if (Math.abs(block.boundingBox.y - currentY) <= tolerance) {
      // 同じ行
      currentLine.push(block)
    } else {
      // 新しい行
      // X座標でソートして行を確定
      currentLine.sort((a, b) => a.boundingBox.x - b.boundingBox.x)
      lines.push(currentLine)
      currentLine = [block]
      currentY = block.boundingBox.y
    }
  }
  
  // 最後の行を追加
  currentLine.sort((a, b) => a.boundingBox.x - b.boundingBox.x)
  lines.push(currentLine)

  return lines
}

/**
 * 行のテキストブロックを結合
 */
export function combineLineText(blocks: OCRTextBlock[]): string {
  return blocks.map(b => b.text).join(' ')
}

/**
 * 複合的な数値表現を抽出（例: "1と1/2", "1 1/2", "大さじ1と1/2"）
 */
export function extractComplexAmount(text: string): { amount: number; unit: string } | null {
  // 「大さじ」「小さじ」などの単位付き複合数値
  // 例: "大さじ1と1/2", "小さじ1/2", "大さじ 2"
  const spoonPattern = /(大さじ|小さじ|tbsp|tsp)\s*(\d+)?\s*(と|and)?\s*(\d+)?\s*[\/]\s*(\d+)?/i
  const spoonMatch = text.match(spoonPattern)
  if (spoonMatch) {
    const unit = spoonMatch[1].includes('大') || spoonMatch[1].toLowerCase() === 'tbsp' ? '大さじ' : '小さじ'
    let amount = 0
    if (spoonMatch[2]) amount += parseInt(spoonMatch[2])
    if (spoonMatch[4] && spoonMatch[5]) {
      amount += parseInt(spoonMatch[4]) / parseInt(spoonMatch[5])
    }
    if (amount > 0) {
      return { amount, unit }
    }
  }

  // シンプルな「大さじN」「小さじN」
  const simpleSpoonPattern = /(大さじ|小さじ|tbsp|tsp)\s*(\d+\.?\d*)/i
  const simpleSpoonMatch = text.match(simpleSpoonPattern)
  if (simpleSpoonMatch) {
    const unit = simpleSpoonMatch[1].includes('大') || simpleSpoonMatch[1].toLowerCase() === 'tbsp' ? '大さじ' : '小さじ'
    return { amount: parseFloat(simpleSpoonMatch[2]), unit }
  }

  // カップ表記
  const cupPattern = /(カップ|cup)\s*(\d+)?\s*(と|and)?\s*(\d+)?\s*[\/]\s*(\d+)?/i
  const cupMatch = text.match(cupPattern)
  if (cupMatch) {
    let amount = 0
    if (cupMatch[2]) amount += parseInt(cupMatch[2])
    if (cupMatch[4] && cupMatch[5]) {
      amount += parseInt(cupMatch[4]) / parseInt(cupMatch[5])
    }
    if (amount > 0) {
      return { amount, unit: 'カップ' }
    }
  }

  // 「Nと分数」パターン（例: "1と1/2", "2と3/4"）
  const mixedFractionPattern = /(\d+)\s*(と|and|\s)\s*(\d+)\s*[\/]\s*(\d+)/
  const mixedMatch = text.match(mixedFractionPattern)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[3])
    const denom = parseInt(mixedMatch[4])
    if (denom !== 0) {
      return { amount: whole + num / denom, unit: extractUnit(text) }
    }
  }

  // 単純な分数（例: "1/2", "3/4"）
  const fractionPattern = /(\d+)\s*[\/]\s*(\d+)/
  const fractionMatch = text.match(fractionPattern)
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1])
    const denom = parseInt(fractionMatch[2])
    if (denom !== 0) {
      return { amount: num / denom, unit: extractUnit(text) }
    }
  }

  // 小数（例: "1.5", "0.5"）
  const decimalPattern = /(\d+\.\d+)\s*(g|kg|ml|l|cc|個|本|枚)?/i
  const decimalMatch = text.match(decimalPattern)
  if (decimalMatch) {
    return { amount: parseFloat(decimalMatch[1]), unit: extractUnit(text) }
  }

  // 整数＋単位（例: "250g", "100ml"）
  const intUnitPattern = /(\d+)\s*(g|kg|ml|l|cc|個|本|枚)/i
  const intUnitMatch = text.match(intUnitPattern)
  if (intUnitMatch) {
    return { amount: parseInt(intUnitMatch[1]), unit: extractUnit(intUnitMatch[2]) }
  }

  // 単純な整数
  const intPattern = /(\d+)/
  const intMatch = text.match(intPattern)
  if (intMatch) {
    return { amount: parseInt(intMatch[1]), unit: extractUnit(text) }
  }

  return null
}

/**
 * 単位を抽出
 */
export function extractUnit(text: string): string {
  const unitPatterns = [
    { pattern: /大さじ|tbsp/i, unit: '大さじ' },
    { pattern: /小さじ|tsp/i, unit: '小さじ' },
    { pattern: /カップ|cup/i, unit: 'カップ' },
    { pattern: /キログラム|kg/i, unit: 'kg' },
    { pattern: /グラム|g(?!o)/i, unit: 'g' },
    { pattern: /ミリリットル|ml|cc/i, unit: 'ml' },
    { pattern: /リットル|l(?!a)/i, unit: 'L' },
    { pattern: /個/, unit: '個' },
    { pattern: /本/, unit: '本' },
    { pattern: /枚/, unit: '枚' },
    { pattern: /つ/, unit: '個' },
  ]

  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(text)) {
      return unit
    }
  }

  return 'g' // デフォルト
}

/**
 * 材料名を抽出（数値や単位を除去）
 */
export function extractIngredientName(text: string): string {
  // 数値、単位、記号を除去
  let name = text
    .replace(/[\d\.\/]+/g, '') // 数値と分数記号を除去
    .replace(/(大さじ|小さじ|tbsp|tsp|カップ|cup|g|kg|ml|l|cc|個|本|枚|つ)/gi, '') // 単位を除去
    .replace(/[と\s]+/g, ' ') // 「と」やスペースを整理
    .trim()

  return name
}

/**
 * 材料名かどうかを判定
 */
export function isIngredientLine(text: string): boolean {
  const trimmedText = text.trim()
  
  if (trimmedText.length === 0) return false

  // 材料名の可能性があるキーワード
  const ingredientKeywords = [
    // 粉類
    '粉', '強力粉', '薄力粉', '中力粉', '全粒粉', 'ライ麦粉', '米粉', 'コーンスターチ', '片栗粉',
    // 水分
    '水', '牛乳', 'ミルク', '豆乳', '生クリーム', 'クリーム', 'ヨーグルト',
    // 油脂
    'バター', 'マーガリン', 'ショートニング', 'オリーブオイル', 'サラダ油', '油', 'ごま油',
    // 糖類
    '砂糖', 'グラニュー糖', '上白糖', '黒糖', 'はちみつ', 'ハチミツ', '蜂蜜', 'メープルシロップ', 'モラセス', '三温糖',
    // 塩・調味料
    '塩', '食塩', '醤油', 'しょうゆ', '味噌', 'みそ', '酢', '酒', 'みりん',
    // 膨張剤
    'イースト', 'ドライイースト', 'インスタントドライイースト', 'ベーキングパウダー', '重曹', 'BP',
    // 卵
    '卵', '全卵', '卵黄', '卵白', 'たまご',
    // その他
    'バニラ', 'エッセンス', 'チョコ', 'ココア', 'アーモンド', 'ナッツ', 'レーズン', 'くるみ',
    'スキムミルク', '脱脂粉乳', 'モルト', 'モルトエキス', 'レモン', 'オレンジ',
    // 英語
    'flour', 'water', 'salt', 'sugar', 'yeast', 'butter', 'milk', 'egg',
    'baking powder', 'cream', 'oil', 'vanilla', 'chocolate', 'cocoa',
  ]

  const lowerText = trimmedText.toLowerCase()
  
  // キーワードに一致するかチェック
  if (ingredientKeywords.some((keyword) => lowerText.includes(keyword.toLowerCase()))) {
    return true
  }

  // 数値を含み、かつ日本語を含む行は材料行の可能性が高い
  if (/\d/.test(trimmedText) && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(trimmedText)) {
    return true
  }

  return false
}

/**
 * 1行のテキストから材料情報を抽出
 */
export function parseIngredientLine(lineText: string, yPosition: number): ParsedIngredient | null {
  if (!isIngredientLine(lineText)) {
    return null
  }

  // 数値と単位を抽出
  const amountInfo = extractComplexAmount(lineText)
  if (!amountInfo) {
    return null
  }

  // 材料名を抽出
  const name = extractIngredientName(lineText)
  if (name.length === 0) {
    return null
  }

  return {
    id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    amount: amountInfo.amount,
    unit: amountInfo.unit,
    y_position: yPosition,
    confidence: 0.9,
  }
}

/**
 * 時間を抽出（例: "発酵 60分"）
 */
export function extractTime(text: string): ParsedTimer | null {
  const timePattern = /(.+?)\s*(\d+)\s*分/
  const match = text.match(timePattern)

  if (match) {
    return {
      step: match[1].trim(),
      minutes: parseInt(match[2]),
      y_position: 0,
    }
  }

  return null
}

/**
 * OCR結果から材料とタイマーをパース（改善版）
 */
export function parseOCRResult(textBlocks: OCRTextBlock[]): {
  ingredients: ParsedIngredient[]
  timers: ParsedTimer[]
} {
  // 同じ行のテキストをグループ化
  const lines = groupTextBlocksByLine(textBlocks)
  
  console.log('═══════════════════════════════════════════════════════')
  console.log('📋 行ごとにグループ化された結果:')
  lines.forEach((line, i) => {
    const lineText = combineLineText(line)
    console.log(`  行${i + 1}: "${lineText}"`)
  })
  console.log('═══════════════════════════════════════════════════════')

  const ingredients: ParsedIngredient[] = []
  const timers: ParsedTimer[] = []

  for (const line of lines) {
    const lineText = combineLineText(line)
    const yPosition = line[0].boundingBox.y

    // 材料として解析
    const ingredient = parseIngredientLine(lineText, yPosition)
    if (ingredient) {
      ingredients.push(ingredient)
      console.log(`✅ 材料認識: ${ingredient.name} ${ingredient.amount} ${ingredient.unit}`)
    }

    // タイマーとして解析
    const timer = extractTime(lineText)
    if (timer) {
      timer.y_position = yPosition
      timers.push(timer)
      console.log(`⏱️ タイマー認識: ${timer.step} ${timer.minutes}分`)
    }
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log(`📊 解析結果: 材料${ingredients.length}種類, タイマー${timers.length}件`)
  console.log('═══════════════════════════════════════════════════════')

  return { ingredients, timers }
}
