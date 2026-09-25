import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Resumen', to: '/empresa' },
  { label: 'Aportes', to: '/empresa/aportes' },
  { label: 'Ranking' },
  { label: 'Certificados', to: '/empresa/certificados' },
];

export function EmpresaLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const title = location.pathname.includes('/aportes/')
    ? 'Comprobante de aporte'
    : location.pathname.endsWith('/aportes')
      ? 'Historial de aportes'
      : 'Resumen';

  return (
    <PanelLayout
      actorColor="org"
      subtitle="Panel de empresa"
      title={title}
      who={user?.email ?? ''}
      whoRole="Cuenta empresa"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
