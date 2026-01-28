import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'
// PickerはExpo Goで動作しない可能性があるため、代替実装を使用
// import { Picker } from '@react-native-picker/picker'
import { useRecipeStore } from '../stores/recipeStore'
import { createRecipe, updateRecipe } from '../services/supabase/recipes'
import { Ingredient } from '../types/recipe'

export default function RecipeEditScreen({ navigation }: any) {
  const {
    currentRecipe,
    ingredients,
    calculatedAmounts,
    scalingState,
    bakingPercentages,
    roundingMode,
    setIngredients,
    setBaseIngredient,
    setScalingRatio,
    toggleIngredientLock,
    toggleIngredientCheck,
    setRoundingMode,
    resetScaling,
  } = useRecipeStore()

  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentRecipe) {
      setTitle(currentRecipe.title)
    } else {
      setTitle('')
    }
  }, [currentRecipe])

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'レシピ名を入力してください')
      return
    }

    try {
      setSaving(true)
      const recipeData = {
        title: title.trim(),
        ingredients_json: ingredients,
        original_ingredients_json: ingredients,
        baking_percentages: bakingPercentages,
      }

      if (currentRecipe) {
        await updateRecipe(currentRecipe.id, recipeData)
        Alert.alert('成功', 'レシピを更新しました')
      } else {
        await createRecipe(recipeData)
        Alert.alert('成功', 'レシピを作成しました')
        if (navigation && navigation.goBack) {
          navigation.goBack()
        }
      }
    } catch (error) {
      console.error('Failed to save recipe:', error)
      Alert.alert('エラー', 'レシピの保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const baseIngredient = ingredients.find(
    (ing) => ing.id === scalingState.baseIngredientId
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>レシピ名</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="レシピ名を入力"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>基準材料</Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => {
              // 簡易的な選択UI（後でモーダルに変更可能）
              const options = ingredients.map((ing, index) => ({
                text: `${ing.name} (${ing.amount}${ing.unit})`,
                onPress: () => setBaseIngredient(ing.id),
              }))
              options.unshift({
                text: '選択を解除',
                onPress: () => setBaseIngredient(null),
              })
              Alert.alert('基準材料を選択', '', options)
            }}
          >
            <Text style={styles.pickerButtonText}>
              {baseIngredient
                ? `${baseIngredient.name} (${baseIngredient.amount}${baseIngredient.unit})`
                : '選択してください'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {baseIngredient && (
        <View style={styles.section}>
          <Text style={styles.label}>
            倍率: {scalingState.ratio.toFixed(2)}倍
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.amountText}>
              {baseIngredient.amount}g →{' '}
              {calculatedAmounts[baseIngredient.id] || baseIngredient.amount}g
            </Text>
            <View style={styles.sliderButtons}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setScalingRatio(scalingState.ratio - 0.1)}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setScalingRatio(scalingState.ratio + 0.1)}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>丸めモード</Text>
          <Switch
            value={roundingMode === 'integer'}
            onValueChange={(value) =>
              setRoundingMode(value ? 'integer' : 'decimal')
            }
          />
          <Text style={styles.switchLabel}>
            {roundingMode === 'integer' ? '整数' : '小数'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>材料リスト</Text>
        {ingredients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📷</Text>
            <Text style={styles.emptyStateText}>
              材料がありません
            </Text>
            <Text style={styles.emptyStateSubtext}>
              「スキャン」タブでレシピを撮影してください
            </Text>
          </View>
        ) : (
          ingredients.map((ingredient) => {
            const calculatedAmount =
              calculatedAmounts[ingredient.id] || ingredient.amount
            const percentage = bakingPercentages[ingredient.id]

            return (
              <View key={ingredient.id} style={styles.ingredientItem}>
                <View style={styles.ingredientHeader}>
                  <TouchableOpacity
                    onPress={() => toggleIngredientCheck(ingredient.id)}
                    style={styles.checkbox}
                  >
                    <Text style={styles.checkboxText}>
                      {ingredient.is_checked ? '☑' : '☐'}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.ingredientName,
                      ingredient.is_checked && styles.checkedText,
                    ]}
                  >
                    {ingredient.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleIngredientLock(ingredient.id)}
                    style={styles.lockButton}
                  >
                    <Text style={styles.lockButtonText}>
                      {scalingState.lockedIngredients.includes(ingredient.id)
                        ? '🔒'
                        : '🔓'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.ingredientAmounts}>
                  <Text
                    style={[
                      styles.amountText,
                      ingredient.is_checked && styles.checkedText,
                    ]}
                  >
                    {ingredient.amount}
                    {ingredient.unit} → {calculatedAmount}
                    {ingredient.unit}
                  </Text>
                  {percentage !== undefined && (
                    <Text style={styles.percentageText}>
                      ({percentage.toFixed(1)}%)
                    </Text>
                  )}
                </View>
              </View>
            )
          })
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetScaling}
        >
          <Text style={styles.buttonText}>リセット</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginTop: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  sliderButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  sliderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#666',
  },
  ingredientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxText: {
    fontSize: 20,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  checkedText: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  lockButton: {
    padding: 4,
  },
  lockButtonText: {
    fontSize: 20,
  },
  ingredientAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 28,
    gap: 8,
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
  },
  resetButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
})
