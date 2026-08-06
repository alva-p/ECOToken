import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cx } from '@/lib/cx';
import { useAuth } from '@/providers/AuthContext';

export type ActorColor = 'org' | 'coop' | 'muni';

const STRIPE: Record<ActorColor, string> = {
  org: 'bg-eco-org',
  coop: 'bg-eco-coop',
  muni: 'bg-eco-muni',
};

const LABEL: Record<ActorColor, string> = {
  org: 'text-eco-org',
  coop: 'text-eco-coop',
  muni: 'text-eco-muni',
};

const NAV_ACTIVE: Record<ActorColor, string> = {
  org: 'bg-eco-org text-white',
  coop: 'bg-eco-coop text-white',
  muni: 'bg-eco-muni text-white',
};

export interface PanelNavItem {
  label: string;
  /** Sin `to`: ítem visible pero deshabilitado (pantalla de una HU futura). */
  to?: string;
}

interface PanelLayoutProps {
  actorColor: ActorColor;
  title: string;
  subtitle: string;
  who: string;
  whoRole: string;
  nav: PanelNavItem[];
  children: ReactNode;
}

// Base compartida de los 4 paneles (empresa/cooperativa/admin/municipio); ver
// doc/assets/ECOToken/screens/web-shared.jsx (WShell) como referencia visual.
export function PanelLayout({
  actorColor,
  title,
  subtitle,
  who,
  whoRole,
  nav,
  children,
}: PanelLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen bg-eco-bg text-eco-ink">
      <aside className="flex w-56 flex-shrink-0 flex-col bg-[#14181C] text-white">
        <div className="border-b border-white/10 px-4 py-5 text-lg font-bold tracking-tight">
          EcoToken
        </div>
        <nav className="flex flex-col gap-1 p-2.5">
          {nav.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  cx(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? NAV_ACTIVE[actorColor]
                      : 'text-white/60 hover:bg-white/5',
                  )
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span
                key={item.label}
                title="Disponible en una próxima entrega"
                className="cursor-not-allowed rounded-lg px-3 py-2.5 text-sm font-medium text-white/30"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="truncate text-sm font-semibold text-white/80">
            {who}
          </div>
          <div className="mt-0.5 text-xs text-white/40">{whoRole}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 text-xs font-semibold text-white/60 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-eco-border bg-white">
          <div className={cx('h-[3px]', STRIPE[actorColor])} />
          <div className="px-7 py-4">
            <div
              className={cx(
                'text-[11px] font-semibold uppercase tracking-wide',
                LABEL[actorColor],
              )}
            >
              {subtitle}
            </div>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
