import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userApi } from "@/src/api/client";
import type { MeUserDto } from "@/src/api/generated/models/MeUserDto";

interface UserContextType {
  user: MeUserDto | null;
  loggedIn: boolean | null;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: MeUserDto | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loggedIn: null,
  loadProfile: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUserDto | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const loadProfile = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    const isLoggedIn = !!token;
    setLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      try {
        const me = await userApi.getMe();
        setUser(me);
        if (me.id) await AsyncStorage.setItem("user_id", me.id);
      } catch (e: any) {
        console.log("loadProfile error:", e);
        const status = e?.response?.status ?? e?.status;
        if (status === 401 || status === 403) {
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          setLoggedIn(false);
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user_id");
    setLoggedIn(false);
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loggedIn, loadProfile, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
