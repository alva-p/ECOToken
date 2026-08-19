import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Registrar entrega', to: '/cooperativa' },
  { label: 'Historial de retiros' },
  { label: 'Cierre de mes' },
];

export function CooperativaLayout() {
  const { user } = useAuth();
  return (
    <PanelLayout
      actorColor="coop"
      subtitle="Panel de cooperativa"
      title="Registrar entrega"
      who={user?.email ?? ''}
      whoRole="Cuenta cooperativa"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
