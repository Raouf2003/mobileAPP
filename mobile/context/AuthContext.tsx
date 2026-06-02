import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, AuthUser, getErrorMessage } from '../services/api';
import { storage } from '../services/storage';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = async (authToken: string, authUser: AuthUser) => {
    await storage.setToken(authToken);
    await storage.setUser(authUser);
    setToken(authToken);
    setUser(authUser);
  };

  const clearSession = async () => {
    await storage.clearAll();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = useCallback(async () => {
    const response = await authApi.getProfile();
    if (response.data.success && response.data.data?.user) {
      const profileUser = response.data.data.user;
      await storage.setUser({ id: profileUser.id, username: profileUser.username });
      setUser({ id: profileUser.id, username: profileUser.username });
    }
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (!storedToken) {
        return;
      }

      setToken(storedToken);
      if (storedUser) setUser(storedUser);

      await refreshProfile();
    } catch {
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    const { token: authToken, user: authUser } = response.data.data;
    await persistSession(authToken, authUser);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const response = await authApi.register(username, password);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    const { token: authToken, user: authUser } = response.data.data;
    await persistSession(authToken, authUser);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { getErrorMessage };
