import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Reportes', to: '/municipio' },
  { label: 'Empresas reconocidas' },
];

export function MunicipioLayout() {
  const { user } = useAuth();
  return (
    <PanelLayout
      actorColor="muni"
      subtitle="Panel de municipalidad"
      title="Reportes"
      who={user?.email ?? ''}
      whoRole="Autoridad municipal"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
