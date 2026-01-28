import {
  groupTextBlocksByLine,
  combineLineText,
  extractComplexAmount,
  extractUnit,
  extractIngredientName,
  isHeaderOrDescription,
  calculateIngredientScore,
  isIngredientLine,
  isIngredientHeader,
  isEndOfIngredients,
  parseIngredientLine,
  parseOCRResult,
} from '../ocr-parser'
import { OCRTextBlock } from '../../types/ocr'

describe('ocr-parser', () => {
  describe('groupTextBlocksByLine', () => {
    it('Y座標が近いブロックを同じ行にグループ化する', () => {
      const textBlocks: OCRTextBlock[] = [
        { text: '強力粉', boundingBox: { x: 10, y: 100, width: 50, height: 20 } },
        { text: '250g', boundingBox: { x: 80, y: 102, width: 30, height: 20 } },
        { text: '水', boundingBox: { x: 10, y: 150, width: 20, height: 20 } },
        { text: '150ml', boundingBox: { x: 50, y: 148, width: 40, height: 20 } },
      ]

      const result = groupTextBlocksByLine(textBlocks, 15)

      expect(result.length).toBe(2)
      expect(result[0].map(b => b.text)).toEqual(['強力粉', '250g'])
      expect(result[1].map(b => b.text)).toEqual(['水', '150ml'])
    })

    it('空の配列を処理できる', () => {
      const result = groupTextBlocksByLine([])
      expect(result).toEqual([])
    })

    it('X座標順にソートされる', () => {
      const textBlocks: OCRTextBlock[] = [
        { text: '250g', boundingBox: { x: 80, y: 100, width: 30, height: 20 } },
        { text: '強力粉', boundingBox: { x: 10, y: 100, width: 50, height: 20 } },
      ]

      const result = groupTextBlocksByLine(textBlocks)

      expect(result[0].map(b => b.text)).toEqual(['強力粉', '250g'])
    })
  })

  describe('combineLineText', () => {
    it('テキストブロックをスペース区切りで結合する', () => {
      const blocks: OCRTextBlock[] = [
        { text: '強力粉', boundingBox: { x: 10, y: 100, width: 50, height: 20 } },
        { text: '250g', boundingBox: { x: 80, y: 100, width: 30, height: 20 } },
      ]

      const result = combineLineText(blocks)

      expect(result).toBe('強力粉 250g')
    })
  })

  describe('extractComplexAmount', () => {
    it('整数を抽出する', () => {
      const result = extractComplexAmount('強力粉 250g')
      expect(result?.amount).toBe(250)
      expect(result?.unit).toBe('g')
    })

    it('小数を抽出する', () => {
      const result = extractComplexAmount('バター 12.5g')
      expect(result?.amount).toBe(12.5)
      expect(result?.unit).toBe('g')
    })

    it('分数を抽出する', () => {
      const result = extractComplexAmount('砂糖 1/2カップ')
      expect(result?.amount).toBe(0.5)
      expect(result?.unit).toBe('カップ')
    })

    it('「1と1/2」形式を抽出する', () => {
      const result = extractComplexAmount('砂糖 1と1/2カップ')
      expect(result?.amount).toBe(1.5)
      expect(result?.unit).toBe('カップ')
    })

    it('「大さじ1と1/2」形式を抽出する', () => {
      const result = extractComplexAmount('砂糖 大さじ1と1/2')
      expect(result?.amount).toBe(1.5)
      expect(result?.unit).toBe('大さじ')
    })

    it('大さじを抽出する', () => {
      const result = extractComplexAmount('醤油 大さじ2')
      expect(result?.amount).toBe(2)
      expect(result?.unit).toBe('大さじ')
    })

    it('小さじを抽出する', () => {
      const result = extractComplexAmount('塩 小さじ1')
      expect(result?.amount).toBe(1)
      expect(result?.unit).toBe('小さじ')
    })

    it('数値がない場合はnullを返す', () => {
      const result = extractComplexAmount('適量')
      expect(result).toBeNull()
    })
  })

  describe('extractUnit', () => {
    it('グラムを認識する', () => {
      expect(extractUnit('250g')).toBe('g')
      expect(extractUnit('250グラム')).toBe('g')
    })

    it('ミリリットルを認識する', () => {
      expect(extractUnit('200ml')).toBe('ml')
      expect(extractUnit('200cc')).toBe('ml')
    })

    it('大さじ・小さじを認識する', () => {
      expect(extractUnit('大さじ2')).toBe('大さじ')
      expect(extractUnit('小さじ1')).toBe('小さじ')
    })

    it('カップを認識する', () => {
      expect(extractUnit('1カップ')).toBe('カップ')
    })

    it('個・本・枚を認識する', () => {
      expect(extractUnit('卵2個')).toBe('個')
      expect(extractUnit('ねぎ1本')).toBe('本')
      expect(extractUnit('のり2枚')).toBe('枚')
    })

    it('単位がない場合はデフォルトでgを返す', () => {
      expect(extractUnit('強力粉 250')).toBe('g')
    })
  })

  describe('extractIngredientName', () => {
    it('数値と単位を除去して材料名を抽出する', () => {
      expect(extractIngredientName('強力粉 250g')).toBe('強力粉')
      expect(extractIngredientName('水 200ml')).toBe('水')
      expect(extractIngredientName('塩 小さじ1')).toBe('塩')
    })

    it('括弧を除去する', () => {
      // 実際の動作: 括弧は除去されるがスペースは追加されない
      expect(extractIngredientName('バター（無塩）50g')).toBe('バター無塩')
    })
  })

  describe('isHeaderOrDescription', () => {
    it('材料見出しを検出する', () => {
      expect(isHeaderOrDescription('材料')).toBe(true)
      expect(isHeaderOrDescription('材料（4人分）')).toBe(true)
    })

    it('作り方を検出する', () => {
      expect(isHeaderOrDescription('作り方')).toBe(true)
      expect(isHeaderOrDescription('手順')).toBe(true)
    })

    it('器具を検出する', () => {
      expect(isHeaderOrDescription('オーブン180度')).toBe(true)
      expect(isHeaderOrDescription('ボウルに入れる')).toBe(true)
    })

    it('材料は検出しない', () => {
      expect(isHeaderOrDescription('強力粉 250g')).toBe(false)
      expect(isHeaderOrDescription('水 150ml')).toBe(false)
    })
  })

  describe('calculateIngredientScore', () => {
    it('材料キーワードにマッチするとスコアが高い', () => {
      const score = calculateIngredientScore('強力粉 250g')
      expect(score).toBeGreaterThanOrEqual(50)
    })

    it('数値と単位を含むとスコアが加算される', () => {
      const scoreWithUnit = calculateIngredientScore('強力粉 250g')
      const scoreWithoutUnit = calculateIngredientScore('強力粉')
      expect(scoreWithUnit).toBeGreaterThan(scoreWithoutUnit)
    })

    it('除外パターンにマッチすると0点', () => {
      expect(calculateIngredientScore('材料（4人分）')).toBe(0)
      expect(calculateIngredientScore('作り方')).toBe(0)
    })

    it('短すぎる行は減点される', () => {
      const shortScore = calculateIngredientScore('塩')
      const normalScore = calculateIngredientScore('塩 5g')
      expect(normalScore).toBeGreaterThan(shortScore)
    })
  })

  describe('isIngredientLine', () => {
    it('材料行を正しく判定する', () => {
      expect(isIngredientLine('強力粉 250g')).toBe(true)
      expect(isIngredientLine('水 150ml')).toBe(true)
      expect(isIngredientLine('塩 小さじ1')).toBe(true)
    })

    it('見出し・説明文は材料ではない', () => {
      expect(isIngredientLine('材料（4人分）')).toBe(false)
      expect(isIngredientLine('作り方')).toBe(false)
      expect(isIngredientLine('オーブンを180度に予熱')).toBe(false)
    })
  })

  describe('isIngredientHeader', () => {
    it('材料見出しを検出する', () => {
      expect(isIngredientHeader('材料')).toBe(true)
      expect(isIngredientHeader('材料（4人分）')).toBe(true)
      expect(isIngredientHeader('材料(2個分)')).toBe(true)
    })

    it('他のテキストは検出しない', () => {
      expect(isIngredientHeader('作り方')).toBe(false)
      expect(isIngredientHeader('強力粉 250g')).toBe(false)
    })
  })

  describe('isEndOfIngredients', () => {
    it('作り方などの終了見出しを検出する', () => {
      expect(isEndOfIngredients('作り方')).toBe(true)
      expect(isEndOfIngredients('手順')).toBe(true)
      expect(isEndOfIngredients('STEP1')).toBe(true)
    })

    it('材料は検出しない', () => {
      expect(isEndOfIngredients('強力粉 250g')).toBe(false)
    })
  })

  describe('parseIngredientLine', () => {
    it('材料行から情報を抽出する', () => {
      const result = parseIngredientLine('強力粉 250g', 100)

      expect(result).not.toBeNull()
      expect(result?.name).toBe('強力粉')
      expect(result?.amount).toBe(250)
      expect(result?.unit).toBe('g')
      expect(result?.y_position).toBe(100)
      expect(result?.confidence).toBeGreaterThan(0)
    })

    it('非材料行はnullを返す', () => {
      const result = parseIngredientLine('作り方', 100)
      expect(result).toBeNull()
    })
  })

  describe('parseOCRResult', () => {
    it('OCR結果から材料を抽出する', () => {
      const textBlocks: OCRTextBlock[] = [
        { text: '材料', boundingBox: { x: 10, y: 50, width: 50, height: 20 } },
        { text: '強力粉', boundingBox: { x: 10, y: 100, width: 50, height: 20 } },
        { text: '250g', boundingBox: { x: 80, y: 100, width: 30, height: 20 } },
        { text: '水', boundingBox: { x: 10, y: 150, width: 20, height: 20 } },
        { text: '150ml', boundingBox: { x: 50, y: 150, width: 40, height: 20 } },
      ]

      const result = parseOCRResult(textBlocks)

      expect(result.ingredients.length).toBeGreaterThanOrEqual(1)
    })

    it('空のブロックでエラーにならない', () => {
      const result = parseOCRResult([])

      expect(result.ingredients).toEqual([])
      expect(result.timers).toEqual([])
    })
  })
})
