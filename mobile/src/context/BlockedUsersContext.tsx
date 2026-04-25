import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { blockApi } from "@/src/api/client";
import { useUser } from "./UserContext";

interface BlockedUsersContextType {
  blockedIds: Set<string>;
  isBlocked: (userId: string | null | undefined) => boolean;
  addBlocked: (userId: string) => void;
  removeBlocked: (userId: string) => void;
  refresh: () => Promise<void>;
}

const BlockedUsersContext = createContext<BlockedUsersContextType>({
  blockedIds: new Set(),
  isBlocked: () => false,
  addBlocked: () => {},
  removeBlocked: () => {},
  refresh: async () => {},
});

export function useBlockedUsers() {
  return useContext(BlockedUsersContext);
}

export function BlockedUsersProvider({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useUser();
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const list = await blockApi.listBlocked();
      const ids = new Set<string>();
      for (const item of list) {
        if (item.userId) ids.add(item.userId);
      }
      setBlockedIds(ids);
    } catch {
      // Not logged in or network error — ignore
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      refresh();
    } else {
      setBlockedIds(new Set());
    }
  }, [loggedIn, refresh]);

  const addBlocked = useCallback((userId: string) => {
    setBlockedIds((prev) => {
      if (prev.has(userId)) return prev;
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  const removeBlocked = useCallback((userId: string) => {
    setBlockedIds((prev) => {
      if (!prev.has(userId)) return prev;
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const isBlocked = useCallback(
    (userId: string | null | undefined) => !!userId && blockedIds.has(userId),
    [blockedIds]
  );

  return (
    <BlockedUsersContext.Provider value={{ blockedIds, isBlocked, addBlocked, removeBlocked, refresh }}>
      {children}
    </BlockedUsersContext.Provider>
  );
}
