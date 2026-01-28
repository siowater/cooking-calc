import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text, TouchableOpacity } from 'react-native'
import RecipeListScreen from '../RecipeListScreen'
import RecipeEditScreen from '../RecipeEditScreen'
import CameraScreen from '../CameraScreen'
import SettingsScreen from '../SettingsScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

/**
 * ヘッダー右側の設定ボタン
 */
function SettingsButton({ navigation }: any) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={{ marginRight: 16 }}
    >
      <Text style={{ fontSize: 24 }}>⚙️</Text>
    </TouchableOpacity>
  )
}

/**
 * メインのタブナビゲーター
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#FF6B35',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => <SettingsButton navigation={navigation} />,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: 'スキャン',
          tabBarLabel: 'スキャン',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📷</Text>,
        }}
      />
      <Tab.Screen
        name="Edit"
        component={RecipeEditScreen}
        options={{
          title: '計算',
          tabBarLabel: '計算',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🧮</Text>,
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipeListScreen}
        options={{
          title: '保存レシピ',
          tabBarLabel: '保存',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📖</Text>,
        }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
