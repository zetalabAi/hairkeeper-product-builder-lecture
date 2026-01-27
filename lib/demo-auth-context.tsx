import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  subscription: "free" | "premium";
};

type DemoAuthContextType = {
  user: DemoUser | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

const DEMO_USER: DemoUser = {
  id: "demo-user-001",
  name: "테스트 사용자",
  email: "demo@hairkeeper.ai",
  subscription: "premium",
};

const STORAGE_KEY = "@hairkeeper_demo_user";

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);

  // 앱 시작 시 저장된 로그인 상태 확인
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const login = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return context;
}
