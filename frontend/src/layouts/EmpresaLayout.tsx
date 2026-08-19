import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Resumen', to: '/empresa' },
  { label: 'Aportes' },
  { label: 'Ranking' },
  { label: 'Certificados' },
];

export function EmpresaLayout() {
  const { user } = useAuth();
  return (
    <PanelLayout
      actorColor="org"
      subtitle="Panel de empresa"
      title="Resumen"
      who={user?.email ?? ''}
      whoRole="Cuenta empresa"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
