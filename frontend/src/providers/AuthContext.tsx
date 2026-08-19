import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { loginRequest } from '@/features/auth/api';
import {
  clearToken,
  getToken,
  getTokenExpiry,
  isTokenExpired,
  setToken,
  usuarioFromToken,
} from '@/lib/auth';
import type { Usuario } from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: Usuario | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const expiryTimer = useRef<number>();

  const logout = useCallback(() => {
    window.clearTimeout(expiryTimer.current);
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const scheduleExpiry = useCallback(
    (token: string) => {
      const expiry = getTokenExpiry(token);
      if (expiry === null) return;
      window.clearTimeout(expiryTimer.current);
      expiryTimer.current = window.setTimeout(
        logout,
        Math.max(expiry - Date.now(), 0),
      );
    },
    [logout],
  );

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      clearToken();
      setStatus('unauthenticated');
      return;
    }
    setUser(usuarioFromToken(token));
    setStatus('authenticated');
    scheduleExpiry(token);
    return () => window.clearTimeout(expiryTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr al montar
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await loginRequest(email, password);
      const usuario = usuarioFromToken(token);
      if (!usuario) throw new Error('El servidor devolvió un token inválido.');
      setToken(token);
      setUser(usuario);
      setStatus('authenticated');
      scheduleExpiry(token);
      return usuario;
    },
    [scheduleExpiry],
  );

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
