import { Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Image } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/src/context/ThemeContext';
import { useUnreadChat } from '@/src/context/UnreadChatContext';
import { useUser } from '@/src/context/UserContext';

export default function TabLayout() {
  const { mode, colors } = useTheme();
  const { loggedIn } = useUser();
  const { unreadCount, refresh } = useUnreadChat();

  useEffect(() => {
    if (loggedIn) {
      const timer = setTimeout(refresh, 500);
      return () => clearTimeout(timer);
    }
  }, [loggedIn]);


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
          tabBarIcon: ({ color }) => <Image source={require("@/assets/images/chat-tab-icon.png")} style={{ width: 32, height: 32, tintColor: color }} resizeMode="contain" />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent, fontSize: 12, fontWeight: "700", minWidth: 20, height: 20, lineHeight: 20, borderRadius: 10 },
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
