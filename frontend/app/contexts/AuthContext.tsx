'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  role: string;
  isVerified: boolean;
  hospitalId?: string;
  districtId?: string;
  provinceId?: string;
}

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: [],
  isLoading: true,
  hasPermission: () => false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuth = async () => {
    setIsLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const res = await fetch(`${API}/api/v1/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPermissions(data.permissions || []);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } catch {
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const hasPermission = (permission: string) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, hasPermission, refresh: fetchAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
