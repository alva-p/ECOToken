import { useEffect, useState } from 'react';
import { ClipboardList, LayoutDashboard, UserRound } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { obtenerMiPerfil, urlLogoEmpresa } from '@/features/empresa/api';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Panel operativo', to: '/cooperativa', icon: LayoutDashboard },
  {
    label: 'Historial de entregas',
    to: '/cooperativa/historial',
    icon: ClipboardList,
  },
];

const NAV_FOOTER: PanelNavItem[] = [
  { label: 'Mi Perfil', to: '/cooperativa/perfil', icon: UserRound },
];

export function CooperativaLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [logo, setLogo] = useState<string | undefined>(undefined);

  // Logo de la cooperativa para el encabezado del menú (se recarga al cambiarlo
  // desde "Mi Perfil", vía el evento 'ecotoken:logo').
  useEffect(() => {
    function cargarLogo() {
      obtenerMiPerfil()
        .then((p) =>
          setLogo(p.logoUrl ? urlLogoEmpresa(p.id, Date.now()) : undefined),
        )
        .catch(() => undefined);
    }
    cargarLogo();
    window.addEventListener('ecotoken:logo', cargarLogo);
    return () => window.removeEventListener('ecotoken:logo', cargarLogo);
  }, []);

  const title = pathname.endsWith('/historial')
    ? 'Historial de entregas'
    : pathname.endsWith('/perfil')
      ? 'Mi Perfil'
      : 'Panel Operativo';
  return (
    <PanelLayout
      actorColor="coop"
      subtitle="Panel de cooperativa"
      title={title}
      who={user?.email ?? ''}
      whoRole="Cooperativa receptora"
      nav={NAV}
      navFooter={NAV_FOOTER}
      logo={logo}
    >
      <Outlet />
    </PanelLayout>
  );
}
