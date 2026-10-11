import {
  ArrowLeftRight,
  Building2,
  FileCode2,
  Recycle,
  ShieldCheck,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

// Mismo color institucional que Municipalidad (ECO.muni en los mockups): el panel
// admin lo opera personal municipal con gobierno total del contrato.
const NAV: PanelNavItem[] = [
  { label: 'Empresas', to: '/admin', icon: Building2 },
  { label: 'Cooperativas', to: '/admin/cooperativas', icon: Recycle },
  { label: 'Conversión', icon: ArrowLeftRight },
  { label: 'Roles', to: '/admin/roles', icon: ShieldCheck },
  { label: 'Contrato', to: '/admin/contrato', icon: FileCode2 },
];

export function AdminLayout() {
  const { user } = useAuth();
  return (
    <PanelLayout
      actorColor="muni"
      subtitle="Panel de administración"
      title="Administración"
      who={user?.email ?? ''}
      whoRole="Administrador"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
