import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#555',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
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
        name="activity"
        options={{
          title: 'Aktivitet',
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/activity-icon.png")} style={{ width: 22, height: 22, tintColor: color }} />,
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
