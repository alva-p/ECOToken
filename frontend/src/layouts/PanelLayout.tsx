import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
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
  const [abierto, setAbierto] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-dvh bg-eco-bg text-eco-ink">
      {abierto && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setAbierto(false)}
        />
      )}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-[#14181C] text-white transition-transform md:static md:w-56 md:flex-shrink-0 md:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-5 text-lg font-bold tracking-tight">
          EcoToken
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="text-white/60 md:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-2.5">
          {nav.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end
                onClick={() => setAbierto(false)}
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
          <div className="flex items-center gap-3 px-4 py-3 sm:px-7 sm:py-4">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setAbierto(true)}
              className="-ml-1 rounded-lg p-1.5 text-eco-ink hover:bg-eco-bg md:hidden"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0">
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
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
