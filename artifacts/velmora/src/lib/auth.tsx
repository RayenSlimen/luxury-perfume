import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import type { Utilisateur } from "@workspace/api-client-react";
import { useGetMoi } from "@workspace/api-client-react";

interface AuthContextType {
  user: Utilisateur | null;
  token: string | null;
  login: (token: string, user: Utilisateur) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("velmora_token");
  });
  
  const [user, setUser] = useState<Utilisateur | null>(null);

  // Sync token to custom fetch getter
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const { data: moiData, isLoading, isError } = useGetMoi({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (moiData) {
      setUser(moiData);
    }
  }, [moiData]);

  useEffect(() => {
    if (isError) {
      // Token might be invalid
      logout();
    }
  }, [isError]);

  const login = (newToken: string, newUser: Utilisateur) => {
    localStorage.setItem("velmora_token", newToken);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("velmora_token");
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isLoading: !!token && isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
