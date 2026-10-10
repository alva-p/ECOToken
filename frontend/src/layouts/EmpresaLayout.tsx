import { FileBadge, LayoutDashboard, Recycle, Trophy } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Resumen', to: '/empresa', icon: LayoutDashboard },
  { label: 'Aportes', to: '/empresa/aportes', icon: Recycle },
  { label: 'Ranking', to: '/empresa/ranking', icon: Trophy }, // mismo ranking público, dentro del panel
  {
    label: 'Certificados y Reportes',
    to: '/empresa/certificados',
    icon: FileBadge,
  },
];

export function EmpresaLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const title = location.pathname.includes('/aportes/')
    ? 'Comprobante de aporte'
    : location.pathname.endsWith('/ranking')
      ? 'Ranking'
      : location.pathname.endsWith('/certificados')
        ? 'Certificados y reportes'
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
