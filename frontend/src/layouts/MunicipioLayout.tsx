import { Gift, LayoutDashboard } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Dashboard', to: '/municipio', icon: LayoutDashboard },
  { label: 'Premios | Beneficios', to: '/municipio/beneficios', icon: Gift },
];

export function MunicipioLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <PanelLayout
      actorColor="muni"
      subtitle="Panel de municipalidad"
      title={
        pathname.endsWith('/beneficios')
          ? 'Premios | Beneficios'
          : 'Panel de Gestión Ambiental'
      }
      who={user?.email ?? ''}
      whoRole="Autoridad municipal"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
