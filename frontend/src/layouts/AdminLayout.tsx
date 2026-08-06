import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

// Mismo color institucional que Municipalidad (ECO.muni en los mockups): el panel
// admin lo opera personal municipal con gobierno total del contrato.
const NAV: PanelNavItem[] = [
  { label: 'Empresas', to: '/admin' },
  { label: 'Cooperativas' },
  { label: 'Conversión' },
  { label: 'Roles' },
  { label: 'Contrato' },
];

export function AdminLayout() {
  const { user } = useAuth();
  return (
    <PanelLayout
      actorColor="muni"
      subtitle="Panel de administración"
      title="Empresas"
      who={user?.email ?? ''}
      whoRole="Administrador"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
