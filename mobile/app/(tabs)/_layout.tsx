import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/src/context/ThemeContext';

export default function TabLayout() {
  const { mode, colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: mode === 'dark' ? '#9ca3af' : '#555',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Upptäck',
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/explore-icon.png")} style={{ width: 22, height: 22, tintColor: color }} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Uppdrag',
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/activity-icon.png")} style={{ width: 22, height: 22, tintColor: color }} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chatt',
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/test.png")} style={{ width: 32, height: 32, tintColor: color }} resizeMode="contain" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/profile-icon.png")} style={{ width: 22, height: 22, tintColor: color }} />,
        }}
      />
    </Tabs>
  );
}
