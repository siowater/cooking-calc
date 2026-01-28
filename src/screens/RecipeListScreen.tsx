import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRecipeStore } from '../stores/recipeStore'
import { fetchRecipes, deleteRecipe, toggleRecipeFavorite } from '../services/supabase/recipes'
import { Recipe } from '../types/recipe'

export default function RecipeListScreen({ navigation }: any) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentRecipe, resetScaling } = useRecipeStore()

  useEffect(() => {
    // ナビゲーションオプションを設定（新規作成ボタン）
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              resetScaling()
              setCurrentRecipe(null)
              if (navigation && navigation.navigate) {
                navigation.navigate('Camera')
              }
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        ),
      })
    }
  }, [navigation, resetScaling, setCurrentRecipe])

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const data = await fetchRecipes()
      setRecipes(data)
      console.log('✅ レシピの読み込み成功:', data.length, '件')
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════')
      console.error('🚨 RecipeListScreen: レシピの読み込みに失敗しました')
      console.error('═══════════════════════════════════════════════════════')
      console.error('エラー:', error)
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message)
        console.error('スタックトレース:', error.stack)
      }
      console.error('═══════════════════════════════════════════════════════')
      Alert.alert('エラー', 'レシピの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRecipePress = (recipe: Recipe) => {
    setCurrentRecipe(recipe)
    if (navigation && navigation.navigate) {
      navigation.navigate('Edit')
    }
  }

  const handleDelete = async (recipeId: string) => {
    Alert.alert(
      '削除確認',
      'このレシピを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipeId)
              console.log('✅ レシピの削除成功:', recipeId)
              await loadRecipes()
            } catch (error) {
              console.error('═══════════════════════════════════════════════════════')
              console.error('🚨 RecipeListScreen: レシピの削除に失敗しました')
              console.error('═══════════════════════════════════════════════════════')
              console.error('レシピID:', recipeId)
              console.error('エラー:', error)
              if (error instanceof Error) {
                console.error('エラーメッセージ:', error.message)
                console.error('スタックトレース:', error.stack)
              }
              console.error('═══════════════════════════════════════════════════════')
              Alert.alert('エラー', 'レシピの削除に失敗しました')
            }
          },
        },
      ]
    )
  }

  const handleToggleFavorite = async (recipe: Recipe) => {
    try {
      await toggleRecipeFavorite(recipe.id, !recipe.is_favorite)
      console.log('✅ お気に入りの更新成功:', recipe.id, !recipe.is_favorite)
      await loadRecipes()
    } catch (error) {
      console.error('═══════════════════════════════════════════════════════')
      console.error('🚨 RecipeListScreen: お気に入りの更新に失敗しました')
      console.error('═══════════════════════════════════════════════════════')
      console.error('レシピID:', recipe.id)
      console.error('エラー:', error)
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message)
        console.error('スタックトレース:', error.stack)
      }
      console.error('═══════════════════════════════════════════════════════')
      Alert.alert('エラー', 'お気に入りの更新に失敗しました')
    }
  }

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleToggleFavorite(item)}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteIcon}>
            {item.is_favorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recipeDate}>
        {new Date(item.created_at).toLocaleDateString('ja-JP')}
      </Text>
      <Text style={styles.recipeIngredients}>
        {item.ingredients_json.length}種類の材料
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteButtonText}>削除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>レシピがありません</Text>
          <Text style={styles.emptySubtext}>
            右上の「+」ボタンから新しいレシピを作成してください
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadRecipes}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#FFD700',
  },
  recipeDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  recipeIngredients: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F44336',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
})
