import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { chatApi } from "@/src/api/client";
import { useUser } from "./UserContext";

interface UnreadChatContextType {
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  isUnread: (chatId: string, lastMessageAt?: Date | null) => boolean;
}

const UnreadChatContext = createContext<UnreadChatContextType>({
  unreadCount: 0,
  refresh: async () => {},
  markAsRead: async () => {},
  isUnread: () => false,
});

export function useUnreadChat() {
  return useContext(UnreadChatContext);
}

export function UnreadChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  const [unreadCount, setUnreadCount] = useState(0);
  const lastReadMapRef = useRef<Record<string, string>>({});

  const getStorageKey = useCallback(() => {
    return userIdRef.current ? `chat_last_read_${userIdRef.current}` : "chat_last_read";
  }, []);

  const refresh = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(getStorageKey());
      const map: Record<string, string> = stored ? JSON.parse(stored) : {};
      lastReadMapRef.current = map;

      const chats = await chatApi.getMyChats();
      const userId = userIdRef.current;
      let count = 0;
      for (const chat of chats) {
        if (!chat.id || !chat.lastMessageAt) continue;
        if (chat.lastMessageSenderId === userId) continue;
        const lastRead = map[chat.id];
        if (!lastRead || new Date(chat.lastMessageAt).getTime() > new Date(lastRead).getTime()) {
          count++;
        }
      }
      setUnreadCount(count);
    } catch {
      // Not logged in or network error — ignore
    }
  }, [getStorageKey]);

  const markAsRead = useCallback(async (chatId: string) => {
    const updated = { ...lastReadMapRef.current, [chatId]: new Date().toISOString() };
    lastReadMapRef.current = updated;
    await AsyncStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [getStorageKey]);

  const isUnread = useCallback((chatId: string, lastMessageAt?: Date | null) => {
    if (!chatId || !lastMessageAt) return false;
    const lastRead = lastReadMapRef.current[chatId];
    if (!lastRead) return true;
    return new Date(lastMessageAt).getTime() > new Date(lastRead).getTime();
  }, []);

  return (
    <UnreadChatContext.Provider value={{ unreadCount, refresh, markAsRead, isUnread }}>
      {children}
    </UnreadChatContext.Provider>
  );
}
