import { useEffect, useState } from 'react';
import {
  FileBadge,
  Gift,
  LayoutDashboard,
  Recycle,
  Trophy,
  UserRound,
} from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { obtenerMiPerfil, urlLogoEmpresa } from '@/features/empresa/api';
import { PanelLayout, type PanelNavItem } from './PanelLayout';

const NAV: PanelNavItem[] = [
  { label: 'Panel de impacto', to: '/empresa', icon: LayoutDashboard },
  { label: 'Aportes', to: '/empresa/aportes', icon: Recycle },
  { label: 'Ranking', to: '/empresa/ranking', icon: Trophy }, // mismo ranking público, dentro del panel
  {
    label: 'Certificados y Reportes',
    to: '/empresa/certificados',
    icon: FileBadge,
  },
  { label: 'Beneficios', to: '/empresa/beneficios', icon: Gift },
];

const NAV_FOOTER: PanelNavItem[] = [
  { label: 'Mi Perfil', to: '/empresa/perfil', icon: UserRound },
];

export function EmpresaLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [logo, setLogo] = useState<string | undefined>(undefined);

  // Logo de la empresa para el encabezado del menú. Se recarga cuando la
  // empresa lo cambia desde "Mi Perfil" (evento 'ecotoken:logo').
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

  const title = location.pathname.includes('/aportes/')
    ? 'Comprobante de aporte'
    : location.pathname.endsWith('/ranking')
      ? 'Ranking'
      : location.pathname.endsWith('/certificados')
        ? 'Certificados y reportes'
        : location.pathname.endsWith('/aportes')
          ? 'Historial de aportes'
          : location.pathname.endsWith('/beneficios')
            ? 'Beneficios municipales'
            : location.pathname.endsWith('/perfil')
              ? 'Mi Perfil'
              : 'Panel de Impacto Ambiental';

  return (
    <PanelLayout
      actorColor="org"
      subtitle="Panel de organización"
      title={title}
      who={user?.email ?? ''}
      whoRole="Organización participante"
      nav={NAV}
      navFooter={NAV_FOOTER}
      logo={logo}
    >
      <Outlet />
    </PanelLayout>
  );
}
