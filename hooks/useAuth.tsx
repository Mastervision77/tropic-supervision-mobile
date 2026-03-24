
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

type User = {
  id: number;
  name: string;
  email?: string;
};

type AuthContextType = {
  token: string | null;
  tenantId: string | null;
  tenantDatabase: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setAuthData: (
    token: string,
    tenantId: string,
    tenantDatabase: string,
    user?: User
  ) => Promise<void>;
  clearAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantDatabase, setTenantDatabase] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // Initial load from SecureStore
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedTenantId, savedTenantDatabase, savedUser] = await Promise.all([
          SecureStore.getItemAsync("auth_token"),
          SecureStore.getItemAsync("tenant_id"),
          SecureStore.getItemAsync("tenant_database"),
          SecureStore.getItemAsync("user"),
        ]);

        setToken(savedToken);
        setTenantId(savedTenantId);
        setTenantDatabase(savedTenantDatabase);
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (err) {
        console.error("Error loading auth from storage:", err);
      }
    })();
  }, []);

  const setAuthData = useCallback(
    async (newToken: string, newTenantId: string, newTenantDatabase: string, userData?: User) => {
      try {
        await Promise.all([
          SecureStore.setItemAsync("auth_token", newToken),
          SecureStore.setItemAsync("tenant_id", newTenantId),
          SecureStore.setItemAsync("tenant_database", newTenantDatabase),
          userData ? SecureStore.setItemAsync("user", JSON.stringify(userData)) : Promise.resolve(),
        ]);

        setToken(newToken);
        setTenantId(newTenantId);
        setTenantDatabase(newTenantDatabase);
        if (userData) setUser(userData);
      } catch (err) {
        console.error("Error setting auth data:", err);
        throw err;
      }
    },
    []
  );

  const clearAuth = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("auth_token"),
        SecureStore.deleteItemAsync("tenant_id"),
        SecureStore.deleteItemAsync("tenant_database"),
        SecureStore.deleteItemAsync("user"),
      ]);

      setToken(null);
      setTenantId(null);
      setTenantDatabase(null);
      setUser(null);

      router.replace("/");
    } catch (err) {
      console.error("Error clearing auth:", err);
    }
  }, [router]);

  const value = {
    token,
    tenantId,
    tenantDatabase,
    user,
    setToken,
    setAuthData,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
