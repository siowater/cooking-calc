import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useRecipeStore } from '../stores/recipeStore'
import { ocrService } from '../services/ocr/ocrService'
import { ParsedIngredient } from '../types/ocr'
import Button from '../components/common/Button'

export default function CameraScreen({ navigation }: any) {
  const [processing, setProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<ParsedIngredient[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { setIngredients, setOriginalIngredients } = useRecipeStore()

  // カメラ権限をリクエスト
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        console.log('カメラ権限が拒否されました')
      }
    })()
  }, [])

  /**
   * カメラで写真を撮影
   */
  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri
        setSelectedImage(imageUri)
        await processOCR(imageUri)
      }
    } catch (error) {
      console.error('カメラエラー:', error)
      Alert.alert('エラー', 'カメラの起動に失敗しました')
    }
  }, [])

  /**
   * ライブラリから画像を選択
   */
  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri
        setSelectedImage(imageUri)
        await processOCR(imageUri)
      }
    } catch (error) {
      console.error('画像選択エラー:', error)
      Alert.alert('エラー', '画像の選択に失敗しました')
    }
  }, [])

  /**
   * OCR処理を実行
   */
  const processOCR = async (imageUri: string) => {
    try {
      setProcessing(true)
      console.log('OCR処理開始:', imageUri)

      const result = await ocrService.processImage(imageUri)
      setOcrResult(result.ingredients)

      if (result.ingredients.length === 0) {
        Alert.alert(
          '認識結果',
          '材料が認識されませんでした。\n別の画像を試すか、手動で入力してください。'
        )
      } else {
        Alert.alert(
          '認識完了',
          `${result.ingredients.length}種類の材料を認識しました。`
        )
      }
    } catch (error) {
      console.error('OCR処理エラー:', error)
      Alert.alert(
        'エラー',
        'OCR処理中にエラーが発生しました。\nネットワーク接続を確認してください。'
      )
    } finally {
      setProcessing(false)
    }
  }

  /**
   * モックOCR処理を実行（テスト用）
   */
  const handleMockOCR = useCallback(async () => {
    try {
      setProcessing(true)
      const result = await ocrService.processImageMock()
      setOcrResult(result.ingredients)
      Alert.alert(
        'モック認識完了',
        `${result.ingredients.length}種類の材料を認識しました。（テストデータ）`
      )
    } catch (error) {
      console.error('モックOCRエラー:', error)
      Alert.alert('エラー', 'モックOCR処理中にエラーが発生しました')
    } finally {
      setProcessing(false)
    }
  }, [])

  /**
   * OCR結果を使用してレシピ編集画面に遷移
   */
  const handleUseOCRResult = useCallback(() => {
    if (ocrResult.length === 0) {
      Alert.alert('エラー', '認識された材料がありません')
      return
    }

    // OCR結果を材料リストに変換
    const ingredients = ocrResult.map((parsed) => ({
      id: parsed.id,
      name: parsed.name,
      amount: parsed.amount,
      unit: parsed.unit,
      y_position: parsed.y_position,
      is_base: parsed.name.includes('粉'), // 簡易判定（粉類をベース材料とする）
      is_checked: false,
      is_locked: false,
    }))

    setIngredients(ingredients)
    setOriginalIngredients(ingredients)

    // レシピ編集画面に遷移
    if (navigation && navigation.navigate) {
      navigation.navigate('Edit')
    }
  }, [ocrResult, setIngredients, setOriginalIngredients, navigation])

  /**
   * 画像をクリア
   */
  const handleClearImage = useCallback(() => {
    setSelectedImage(null)
    setOcrResult([])
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>レシピをスキャン</Text>
        <Text style={styles.subtitle}>
          レシピの写真を撮影または選択して材料を認識します
        </Text>
        {!ocrService.isCloudVisionConfigured() && (
          <Text style={styles.warningText}>
            Cloud Vision APIキーが未設定のためテストモードで動作します
          </Text>
        )}
      </View>

      {/* 画像プレビュー */}
      <View style={styles.imageContainer}>
        {selectedImage ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity style={styles.clearButton} onPress={handleClearImage}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>
              写真を撮影または選択してください
            </Text>
          </View>
        )}
      </View>

      {/* コントロールボタン */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <Button
            title="カメラで撮影"
            onPress={handleTakePhoto}
            disabled={processing}
            variant="primary"
            size="large"
            style={styles.halfButton}
          />
          <Button
            title="ライブラリから選択"
            onPress={handlePickImage}
            disabled={processing}
            variant="secondary"
            size="large"
            style={styles.halfButton}
          />
        </View>

        {/* テスト用モックボタン */}
        <Button
          title={processing ? '処理中...' : 'テストデータで試す'}
          onPress={handleMockOCR}
          disabled={processing}
          loading={processing}
          variant="outline"
          size="medium"
          style={styles.button}
        />

        {/* OCR結果表示 */}
        {ocrResult.length > 0 && (
          <>
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                認識結果 ({ocrResult.length}種類)
              </Text>
              <ScrollView style={styles.resultList}>
                {ocrResult.map((ingredient) => (
                  <View key={ingredient.id} style={styles.resultItem}>
                    <Text style={styles.resultItemName}>{ingredient.name}</Text>
                    <Text style={styles.resultItemAmount}>
                      {ingredient.amount} {ingredient.unit}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Button
              title="この結果を使用"
              onPress={handleUseOCRResult}
              variant="primary"
              size="large"
              style={styles.button}
            />
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
  imageContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfButton: {
    flex: 1,
  },
  button: {
    marginBottom: 12,
  },
  resultContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    maxHeight: 180,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  resultList: {
    maxHeight: 130,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultItemName: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  resultItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
})
