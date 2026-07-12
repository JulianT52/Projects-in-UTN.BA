import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Usuario } from '../types/usuario';

type AuthContextValue = {
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const value = useMemo(() => ({ usuario, setUsuario }), [usuario]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return context;
}