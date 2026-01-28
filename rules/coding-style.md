# コーディングスタイル (Coding Style)

## 不変性 (Immutability) (CRITICAL)

常に新しいオブジェクトを作成し、決してミューテーション（変更）を行わないでください：

```javascript
// WRONG: Mutation (変更)
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability (不変)
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}

```

## ファイル構成 (File Organization)

少数の大きなファイル < 多数の小さなファイル：

* 高い凝集度、低い結合度
* 通常200〜400行、最大800行
* 大きなコンポーネントからユーティリティを抽出する
* タイプ別ではなく、機能/ドメイン別に整理する

## エラーハンドリング (Error Handling)

常に包括的にエラーを処理してください：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}

```

## 入力検証 (Input Validation)

常にユーザー入力を検証してください：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)

```

## コード品質チェックリスト (Code Quality Checklist)

作業完了とする前に：

* [ ] コードが読みやすく、適切に命名されている
* [ ] 関数が小さい (<50行)
* [ ] ファイルが焦点を絞っている (<800行)
* [ ] 深いネストがない (>4レベル)
* [ ] 適切なエラーハンドリング
* [ ] console.log ステートメントがない
* [ ] ハードコードされた値がない
* [ ] ミューテーションがない（不変パターンが使用されている）

