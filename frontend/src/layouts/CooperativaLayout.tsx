import { CalendarCheck, PackagePlus } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Registrar entrega', to: '/cooperativa', icon: PackagePlus },
  {
    label: 'Cierre de mes',
    to: '/cooperativa/cierre-de-mes',
    icon: CalendarCheck,
  },
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
