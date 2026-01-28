import React from 'react'
import { View, Text, StyleSheet, Switch } from 'react-native'
import { useRecipeStore } from '../stores/recipeStore'

export default function SettingsScreen() {
  const { roundingMode, setRoundingMode } = useRecipeStore()

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>表示設定</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>丸めモード</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {roundingMode === 'integer' ? '整数' : '小数'}
            </Text>
            <Switch
              value={roundingMode === 'integer'}
              onValueChange={(value) =>
                setRoundingMode(value ? 'integer' : 'decimal')
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <Text style={styles.infoText}>Baker's Lens v1.0.0</Text>
        <Text style={styles.infoText}>
          パン・お菓子作りのレシピ計量コンバーター
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
})
