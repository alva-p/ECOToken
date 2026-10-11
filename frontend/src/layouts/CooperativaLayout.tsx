import { CalendarCheck, ClipboardList, LayoutDashboard } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Panel operativo', to: '/cooperativa', icon: LayoutDashboard },
  {
    label: 'Historial de entregas',
    to: '/cooperativa/historial',
    icon: ClipboardList,
  },
  {
    label: 'Cierre de mes',
    to: '/cooperativa/cierre-de-mes',
    icon: CalendarCheck,
  },
];

export function CooperativaLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = pathname.endsWith('/historial')
    ? 'Historial de entregas'
    : pathname.endsWith('/cierre-de-mes')
      ? 'Cierre de mes'
      : 'Panel Operativo';
  return (
    <PanelLayout
      actorColor="coop"
      subtitle="Panel de cooperativa"
      title={title}
      who={user?.email ?? ''}
      whoRole="Cooperativa receptora"
      nav={NAV}
    >
      <Outlet />
    </PanelLayout>
  );
}
