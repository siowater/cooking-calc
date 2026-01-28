import { OCRTextBlock, ParsedIngredient, ParsedTimer } from '../types/ocr'

// ============================================================
// 材料キーワードデータベース（大幅拡充）
// ============================================================

const INGREDIENT_KEYWORDS = {
  // 粉類
  flour: [
    '強力粉', '薄力粉', '中力粉', '全粒粉', '準強力粉', 'フランスパン専用粉',
    'ライ麦粉', '米粉', 'コーンスターチ', '片栗粉', '小麦粉', 'パン粉',
    'ホットケーキミックス', 'HM', 'ベーキングミックス', 'そば粉', 'きな粉',
    'アーモンドプードル', 'アーモンドパウダー', 'ココナッツパウダー',
    '上新粉', '白玉粉', 'もち粉', 'タピオカ粉', 'くず粉', '葛粉',
  ],
  // 水分・乳製品
  liquid: [
    '牛乳', 'ミルク', '豆乳', '生クリーム', 'クリーム', 'ヨーグルト', '練乳',
    'コンデンスミルク', 'エバミルク', 'スキムミルク', '脱脂粉乳', '粉ミルク',
    'サワークリーム', 'マスカルポーネ', 'クリームチーズ', 'チーズ',
    'バターミルク', 'ホエー', 'ホエイ', 'カッテージチーズ', 'リコッタ',
  ],
  // 油脂
  fat: [
    'バター', '無塩バター', '有塩バター', '発酵バター', 'マーガリン',
    'ショートニング', 'ラード', 'オリーブオイル', 'サラダ油', 'ごま油',
    '太白ごま油', 'なたね油', 'キャノーラ油', 'ココナッツオイル',
    'グレープシードオイル', '米油', 'こめ油', 'ひまわり油',
  ],
  // 糖類
  sugar: [
    '砂糖', 'グラニュー糖', '上白糖', '黒糖', '黒砂糖', 'きび砂糖', 'てんさい糖',
    '三温糖', '粉糖', '粉砂糖', 'シュガーパウダー', 'はちみつ', 'ハチミツ', '蜂蜜',
    'メープルシロップ', 'モラセス', '水飴', '水あめ', 'みずあめ',
    'ブラウンシュガー', 'ココナッツシュガー', 'アガベシロップ', '転化糖',
    'トレハロース', 'オリゴ糖',
  ],
  // 塩・調味料
  seasoning: [
    '塩', '食塩', '岩塩', '海塩', '粗塩', 'あら塩', 'ゲランドの塩',
    '醤油', 'しょうゆ', '薄口醤油', '濃口醤油', 'たまり醤油',
    '味噌', 'みそ', '白味噌', '赤味噌', '合わせ味噌',
    'みりん', '本みりん', 'みりん風調味料', '酒', '料理酒', '日本酒',
    '酢', '米酢', '穀物酢', 'りんご酢', 'ワインビネガー', 'バルサミコ酢',
  ],
  // 膨張剤
  leavening: [
    'イースト', 'ドライイースト', 'インスタントドライイースト', '生イースト',
    'ベーキングパウダー', 'BP', '重曹', 'ベーキングソーダ', '炭酸水素ナトリウム',
    '天然酵母', '自家製酵母', 'ホシノ天然酵母', 'とかち野酵母', '白神こだま酵母',
  ],
  // 卵
  egg: [
    '卵', '全卵', '卵黄', '卵白', 'たまご', 'タマゴ', '鶏卵',
    'Mサイズ', 'Lサイズ', 'M玉', 'L玉',
  ],
  // ナッツ・ドライフルーツ
  nuts: [
    'アーモンド', 'くるみ', 'クルミ', 'ナッツ', 'ピーナッツ', '落花生',
    'カシューナッツ', 'マカダミアナッツ', 'ヘーゼルナッツ', 'ピスタチオ',
    '松の実', 'ピーカンナッツ', 'ペカンナッツ',
    'レーズン', 'ドライフルーツ', 'クランベリー', 'いちじく', 'プルーン',
    'ドライマンゴー', 'ドライアプリコット', 'デーツ', 'なつめやし',
  ],
  // チョコレート・ココア
  chocolate: [
    'チョコレート', 'チョコ', 'ビターチョコ', 'ミルクチョコ', 'ホワイトチョコ',
    'クーベルチュール', 'カカオマス', 'ココア', 'ココアパウダー', '純ココア',
    'チョコチップ', 'チョコレートチップ', 'カカオニブ', 'カカオバター',
  ],
  // 香料・エッセンス
  flavoring: [
    'バニラ', 'バニラエッセンス', 'バニラオイル', 'バニラビーンズ', 'バニラペースト',
    'エッセンス', 'アーモンドエッセンス', 'レモンエッセンス', 'オレンジエッセンス',
    'ラム酒', 'ラムエッセンス', 'ブランデー', 'キルシュ', 'グランマルニエ',
    'コアントロー', 'リキュール', '洋酒',
  ],
  // 果物・柑橘
  fruit: [
    'レモン', 'レモン汁', 'レモンの皮', 'レモンピール', 'レモンゼスト',
    'オレンジ', 'オレンジピール', 'オレンジ果汁', 'りんご', 'バナナ',
    'いちご', 'ブルーベリー', 'ラズベリー', 'マンゴー', 'パイナップル',
    '柚子', 'ゆず', 'ライム', 'グレープフルーツ',
  ],
  // 野菜
  vegetable: [
    'にんじん', '人参', 'たまねぎ', '玉ねぎ', 'じゃがいも', 'ジャガイモ',
    'かぼちゃ', 'さつまいも', 'サツマイモ', 'ほうれん草', 'ホウレン草',
    'トマト', 'ミニトマト', 'なす', 'ナス', 'ピーマン', 'パプリカ',
    'きゅうり', 'キュウリ', 'キャベツ', 'レタス', 'ブロッコリー',
    'にんにく', 'ニンニク', 'しょうが', '生姜', 'ネギ', 'ねぎ', '長ねぎ',
  ],
  // 肉・魚
  protein: [
    '鶏肉', '豚肉', '牛肉', 'ひき肉', '挽肉', 'ミンチ', 'ベーコン', 'ハム',
    'ソーセージ', 'ウインナー', '鶏むね肉', '鶏もも肉', '豚バラ',
    'サーモン', '鮭', 'エビ', 'えび', '海老', 'ツナ', 'まぐろ', 'かつお',
  ],
  // その他
  other: [
    'ゼラチン', '粉ゼラチン', '板ゼラチン', 'アガー', '寒天', '粉寒天',
    'コンスターチ', 'タピオカ', 'ペクチン',
    'モルト', 'モルトエキス', 'モルトパウダー', 'モルトシロップ',
    '抹茶', '抹茶パウダー', '紅茶', 'コーヒー', 'インスタントコーヒー',
    'ジャム', 'あんこ', 'あん', '餡', 'つぶあん', 'こしあん', '白あん',
    'カスタードクリーム', 'カスタード', 'アーモンドクリーム',
  ],
}

// キーワードをフラットな配列に変換
const ALL_INGREDIENT_KEYWORDS = Object.values(INGREDIENT_KEYWORDS).flat()

// ============================================================
// 除外パターン（見出し・説明文）
// ============================================================

const EXCLUDE_PATTERNS = [
  // 分量の見出し
  /材料/,
  /\d+個分/,
  /\d+人分/,
  /\d+枚分/,
  /\d+本分/,
  /\d+切れ分/,
  /\d+杯分/,
  /\d+食分/,
  /約\d+/,
  /直径\d+/,
  /\d+cm/,
  /\d+センチ/,
  /\d+mm/,
  /\d+ミリ/,
  /\d+インチ/,
  /\d+号/,
  // レシピの区切り・見出し
  /作り方/,
  /手順/,
  /工程/,
  /ステップ/,
  /STEP/i,
  /ポイント/,
  /コツ/,
  /下準備/,
  /準備/,
  /仕上げ/,
  /トッピング/,
  /デコレーション/,
  /飾り/,
  /盛り付け/,
  // 調理器具・道具
  /オーブン/,
  /電子レンジ/,
  /レンジ/,
  /フライパン/,
  /ボウル/,
  /ボール/,
  /天板/,
  /型/,
  /パウンド型/,
  /ケーキ型/,
  /マフィン型/,
  /タルト型/,
  /泡立て器/,
  /ゴムべら/,
  /スパチュラ/,
  /めん棒/,
  /麺棒/,
  // 時間・温度
  /^\d+分$/,
  /^\d+時間/,
  /^\d+℃/,
  /^\d+度$/,
  /予熱/,
  /焼成/,
  /発酵/,
  /ベンチタイム/,
  /一次発酵/,
  /二次発酵/,
  /最終発酵/,
  // その他の見出し・説明
  /レシピ/,
  /メモ/,
  /備考/,
  /注意/,
  /ヒント/,
  /アドバイス/,
  /コメント/,
  /説明/,
  /紹介/,
  /MEMO/i,
  /POINT/i,
  /RECIPE/i,
  /NOTE/i,
  /TIP/i,
  // 番号のみの行
  /^[①②③④⑤⑥⑦⑧⑨⑩]$/,
  /^[1-9]\.$/, 
  /^[1-9]\)$/,
  /^[1-9]、$/,
  // 調理動作
  /^混ぜ/,
  /^加え/,
  /^入れ/,
  /^焼/,
  /^蒸/,
  /^煮/,
  /^炒/,
  /^揚/,
]

// ============================================================
// 短い材料名（単独で判定が難しいもの）
// ============================================================

const SHORT_INGREDIENTS = ['水', '塩', '卵', '酒', '酢', '油', '粉', '糖']

// ============================================================
// ユーティリティ関数
// ============================================================

/**
 * 同じ行のテキストブロックをグループ化
 */
export function groupTextBlocksByLine(
  textBlocks: OCRTextBlock[],
  tolerance: number = 15
): OCRTextBlock[][] {
  if (textBlocks.length === 0) return []

  const sorted = [...textBlocks].sort((a, b) => a.boundingBox.y - b.boundingBox.y)
  
  const lines: OCRTextBlock[][] = []
  let currentLine: OCRTextBlock[] = [sorted[0]]
  let currentY = sorted[0].boundingBox.y

  for (let i = 1; i < sorted.length; i++) {
    const block = sorted[i]
    if (Math.abs(block.boundingBox.y - currentY) <= tolerance) {
      currentLine.push(block)
    } else {
      currentLine.sort((a, b) => a.boundingBox.x - b.boundingBox.x)
      lines.push(currentLine)
      currentLine = [block]
      currentY = block.boundingBox.y
    }
  }
  
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

// ============================================================
// 数値・単位抽出
// ============================================================

/**
 * 複合的な数値表現を抽出
 */
export function extractComplexAmount(text: string): { amount: number; unit: string } | null {
  // 大さじ・小さじ + 分数
  const spoonFractionPattern = /(大さじ|小さじ|tbsp|tsp)\s*(\d+)?\s*(と|and|\/?\s*)?\s*(\d+)?\s*[\/]\s*(\d+)?/i
  const spoonFractionMatch = text.match(spoonFractionPattern)
  if (spoonFractionMatch) {
    const unit = spoonFractionMatch[1].includes('大') || spoonFractionMatch[1].toLowerCase() === 'tbsp' ? '大さじ' : '小さじ'
    let amount = 0
    if (spoonFractionMatch[2]) amount += parseInt(spoonFractionMatch[2])
    if (spoonFractionMatch[4] && spoonFractionMatch[5]) {
      amount += parseInt(spoonFractionMatch[4]) / parseInt(spoonFractionMatch[5])
    }
    if (amount > 0) return { amount, unit }
  }

  // シンプルな大さじ・小さじ
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
    if (amount > 0) return { amount, unit: 'カップ' }
  }

  // 「Nと分数」パターン
  const mixedFractionPattern = /(\d+)\s*(と|and|\s)\s*(\d+)\s*[\/]\s*(\d+)/
  const mixedMatch = text.match(mixedFractionPattern)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[3])
    const denom = parseInt(mixedMatch[4])
    if (denom !== 0) return { amount: whole + num / denom, unit: extractUnit(text) }
  }

  // 単純な分数
  const fractionPattern = /(\d+)\s*[\/]\s*(\d+)/
  const fractionMatch = text.match(fractionPattern)
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1])
    const denom = parseInt(fractionMatch[2])
    if (denom !== 0) return { amount: num / denom, unit: extractUnit(text) }
  }

  // 小数
  const decimalPattern = /(\d+\.\d+)/
  const decimalMatch = text.match(decimalPattern)
  if (decimalMatch) {
    return { amount: parseFloat(decimalMatch[1]), unit: extractUnit(text) }
  }

  // 整数＋単位
  const intUnitPattern = /(\d+)\s*(g|kg|ml|l|cc|個|本|枚|丁|束|把|袋|パック|缶|切れ)/i
  const intUnitMatch = text.match(intUnitPattern)
  if (intUnitMatch) {
    return { amount: parseInt(intUnitMatch[1]), unit: extractUnit(intUnitMatch[0]) }
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
    { pattern: /グラム|(?<![a-z])g(?![a-z])/i, unit: 'g' },
    { pattern: /ミリリットル|ml|cc/i, unit: 'ml' },
    { pattern: /リットル|(?<![a-z])l(?![a-z])/i, unit: 'L' },
    { pattern: /個/, unit: '個' },
    { pattern: /本/, unit: '本' },
    { pattern: /枚/, unit: '枚' },
    { pattern: /丁/, unit: '丁' },
    { pattern: /束/, unit: '束' },
    { pattern: /把/, unit: '把' },
    { pattern: /袋/, unit: '袋' },
    { pattern: /パック/, unit: 'パック' },
    { pattern: /缶/, unit: '缶' },
    { pattern: /切れ/, unit: '切れ' },
    { pattern: /つ/, unit: '個' },
  ]

  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(text)) return unit
  }

  return 'g'
}

/**
 * 材料名を抽出（数値や単位を除去）
 */
export function extractIngredientName(text: string): string {
  let name = text
    .replace(/[\d\.\/]+/g, '')
    .replace(/(大さじ|小さじ|tbsp|tsp|カップ|cup|g|kg|ml|l|cc|個|本|枚|丁|束|把|袋|パック|缶|切れ|つ)/gi, '')
    .replace(/[と\s…・]+/g, ' ')
    .replace(/[（）()【】\[\]「」]/g, '')
    .trim()

  return name
}

// ============================================================
// 材料判定（信頼度スコア方式）
// ============================================================

/**
 * 見出しや説明文かどうかを判定
 */
export function isHeaderOrDescription(text: string): boolean {
  const trimmedText = text.trim()
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(trimmedText))
}

/**
 * 材料行の信頼度スコアを計算（0-100）
 */
export function calculateIngredientScore(text: string): number {
  const trimmedText = text.trim()
  let score = 0

  // 除外パターンに一致したら即0点
  if (isHeaderOrDescription(trimmedText)) {
    return 0
  }

  // 長いキーワードに一致: +50点
  const lowerText = trimmedText.toLowerCase()
  const matchedLongKeyword = ALL_INGREDIENT_KEYWORDS.find(
    keyword => keyword.length >= 2 && lowerText.includes(keyword.toLowerCase())
  )
  if (matchedLongKeyword) {
    score += 50
    // 完全に一致または主要部分が一致: +10点
    if (extractIngredientName(trimmedText).includes(matchedLongKeyword)) {
      score += 10
    }
  }

  // 短い材料名（水、塩など）に一致: +30点
  for (const short of SHORT_INGREDIENTS) {
    if (trimmedText.includes(short) && !trimmedText.includes('材料')) {
      score += 30
      break
    }
  }

  // 数値を含む: +20点
  if (/\d/.test(trimmedText)) {
    score += 20
  }

  // 単位を含む: +15点
  const unitPatterns = [/g(?![a-z])/i, /ml/i, /cc/i, /大さじ/, /小さじ/, /カップ/, /個/, /本/, /枚/]
  if (unitPatterns.some(p => p.test(trimmedText))) {
    score += 15
  }

  // 行が短すぎる（2文字以下）: -20点
  if (trimmedText.length <= 2) {
    score -= 20
  }

  // 行が長すぎる（説明文の可能性）: -10点
  if (trimmedText.length > 30) {
    score -= 10
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * 材料行かどうかを判定（信頼度スコアベース）
 */
export function isIngredientLine(text: string, threshold: number = 40): boolean {
  const score = calculateIngredientScore(text)
  const isIngredient = score >= threshold
  
  if (!isIngredient && score > 0) {
    console.log(`⏭️ 除外（スコア不足: ${score}点）: "${text}"`)
  }
  
  return isIngredient
}

// ============================================================
// コンテキスト検出（材料セクション認識）
// ============================================================

/**
 * 「材料」見出しを検出
 */
export function isIngredientHeader(text: string): boolean {
  return /^材料/.test(text.trim()) || /材料[（(]\d+/.test(text)
}

/**
 * 「作り方」などの終了見出しを検出
 */
export function isEndOfIngredients(text: string): boolean {
  const endPatterns = [/^作り方/, /^手順/, /^工程/, /^ステップ/, /^STEP/i, /^下準備/]
  return endPatterns.some(p => p.test(text.trim()))
}

// ============================================================
// メイン解析関数
// ============================================================

/**
 * 1行のテキストから材料情報を抽出
 */
export function parseIngredientLine(lineText: string, yPosition: number): ParsedIngredient | null {
  if (!isIngredientLine(lineText)) {
    return null
  }

  const amountInfo = extractComplexAmount(lineText)
  if (!amountInfo) {
    return null
  }

  const name = extractIngredientName(lineText)
  if (name.length === 0) {
    return null
  }

  const score = calculateIngredientScore(lineText)

  return {
    id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    amount: amountInfo.amount,
    unit: amountInfo.unit,
    y_position: yPosition,
    confidence: score / 100,
  }
}

/**
 * 時間を抽出
 */
export function extractTime(text: string): ParsedTimer | null {
  // 「発酵 60分」「焼き時間 30分」などのパターンは除外（材料ではない）
  if (isHeaderOrDescription(text)) {
    return null
  }

  const timePattern = /(.+?)\s*(\d+)\s*分/
  const match = text.match(timePattern)

  if (match && !isIngredientLine(text)) {
    return {
      step: match[1].trim(),
      minutes: parseInt(match[2]),
      y_position: 0,
    }
  }

  return null
}

/**
 * OCR結果から材料とタイマーをパース（コンテキスト考慮版）
 */
export function parseOCRResult(textBlocks: OCRTextBlock[]): {
  ingredients: ParsedIngredient[]
  timers: ParsedTimer[]
} {
  const lines = groupTextBlocksByLine(textBlocks)
  
  console.log('═══════════════════════════════════════════════════════')
  console.log('📋 OCR行グループ化結果:')
  lines.forEach((line, i) => {
    const lineText = combineLineText(line)
    const score = calculateIngredientScore(lineText)
    console.log(`  行${i + 1}: "${lineText}" [スコア: ${score}点]`)
  })
  console.log('═══════════════════════════════════════════════════════')

  const ingredients: ParsedIngredient[] = []
  const timers: ParsedTimer[] = []
  
  let inIngredientSection = false
  let passedIngredientHeader = false

  for (const line of lines) {
    const lineText = combineLineText(line)
    const yPosition = line[0].boundingBox.y

    // 「材料」見出しを検出
    if (isIngredientHeader(lineText)) {
      inIngredientSection = true
      passedIngredientHeader = true
      console.log(`📌 材料セクション開始: "${lineText}"`)
      continue
    }

    // 「作り方」などで材料セクション終了
    if (isEndOfIngredients(lineText)) {
      inIngredientSection = false
      console.log(`📌 材料セクション終了: "${lineText}"`)
      continue
    }

    // 材料として解析（材料セクション内はスコア閾値を下げる）
    const threshold = inIngredientSection ? 30 : 40
    const score = calculateIngredientScore(lineText)
    
    if (score >= threshold) {
      const ingredient = parseIngredientLine(lineText, yPosition)
      if (ingredient) {
        // 材料セクション内ならボーナス
        if (inIngredientSection && ingredient.confidence !== undefined) {
          ingredient.confidence = Math.min(1, ingredient.confidence + 0.1)
        }
        ingredients.push(ingredient)
        const confidencePercent = ingredient.confidence !== undefined ? (ingredient.confidence * 100).toFixed(0) : '?'
        console.log(`✅ 材料認識: ${ingredient.name} ${ingredient.amount}${ingredient.unit} [信頼度: ${confidencePercent}%]`)
      }
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
  console.log(`📊 解析完了: 材料${ingredients.length}種類, タイマー${timers.length}件`)
  if (passedIngredientHeader) {
    console.log(`📌 「材料」見出しを検出しました`)
  }
  console.log('═══════════════════════════════════════════════════════')

  return { ingredients, timers }
}
