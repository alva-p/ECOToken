import {
  ArrowLeftRight,
  Building2,
  FileCode2,
  LayoutDashboard,
  Recycle,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import {
  PanelLayout,
  type PanelNavGroup,
  type PanelNavItem,
} from './PanelLayout';

// Mismo color institucional que Municipalidad (ECO.muni en los mockups): el panel
// admin lo opera personal municipal con gobierno total del contrato.
const NAV: PanelNavItem[] = [
  { label: 'Inicio', to: '/admin', icon: LayoutDashboard },
  { label: 'Empresas', to: '/admin/empresas', icon: Building2 },
  { label: 'Cooperativas', to: '/admin/cooperativas', icon: Recycle },
];

// Apartado de Configuración (fondo del menú): su submenú tapa al menú principal.
const CONFIG: PanelNavGroup = {
  label: 'Configuración',
  icon: Settings,
  items: [
    { label: 'Usuarios', to: '/admin/usuarios', icon: Users },
    { label: 'Conversión', icon: ArrowLeftRight },
    { label: 'Roles', to: '/admin/roles', icon: ShieldCheck },
    { label: 'Contrato', to: '/admin/contrato', icon: FileCode2 },
  ],
};

export function AdminLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = pathname.endsWith('/empresas')
    ? 'Empresas'
    : pathname.endsWith('/cooperativas')
      ? 'Cooperativas'
      : pathname.endsWith('/usuarios')
        ? 'Usuarios'
        : pathname.endsWith('/roles')
          ? 'Roles on-chain'
          : pathname.endsWith('/contrato')
            ? 'Contrato'
            : 'Panel de administración';
  return (
    <PanelLayout
      actorColor="muni"
      subtitle="Panel de administración"
      title={title}
      who={user?.email ?? ''}
      whoRole="Administrador"
      nav={NAV}
      configGroup={CONFIG}
      showCierreBadge={false}
    >
      <Outlet />
    </PanelLayout>
  );
}
