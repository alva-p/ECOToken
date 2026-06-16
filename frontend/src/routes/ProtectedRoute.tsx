import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import type { UserRole } from '@/types';
import type { ReactNode } from 'react';

/** Guard de ruta por rol (RBAC). Refleja los roles del backend. */
export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
