import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import RecipeEditScreen from '../RecipeEditScreen'
import CameraScreen from '../CameraScreen'
import SettingsScreen from '../SettingsScreen'

const Tab = createBottomTabNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#999',
        }}
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
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '設定',
            tabBarLabel: '設定',
            tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
