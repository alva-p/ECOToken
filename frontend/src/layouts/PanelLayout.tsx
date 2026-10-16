import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Circle,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cx } from '@/lib/cx';
import { CierreMesBadge } from '@/components/CierreMesBadge';
import { useAuth } from '@/providers/AuthContext';

export type ActorColor = 'org' | 'coop' | 'muni';

// Isotipo de marca en el encabezado del menú, igual para todos los paneles.
// El logo propio de cada cuenta va en el avatar inferior.
const MARCA_LOGO = '/logos/logo-mini-eco.png';

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
  icon?: LucideIcon;
}

/**
 * Grupo "drill-in" fijado al fondo del menú (ej. "Configuración"): al tocarlo,
 * su submenú tapa a los ítems principales, con un botón para volver.
 */
export interface PanelNavGroup {
  label: string;
  icon?: LucideIcon;
  items: PanelNavItem[];
}

// Variante legible del color del actor sobre la barra oscura.
const LABEL_OSCURO: Record<ActorColor, string> = {
  org: 'text-emerald-400',
  coop: 'text-amber-400',
  muni: 'text-indigo-300',
};

const CLAVE_COLAPSADA = 'ecotoken-sidebar-colapsada';

function leerColapsada() {
  try {
    return localStorage.getItem(CLAVE_COLAPSADA) === '1';
  } catch {
    return false;
  }
}

interface PanelLayoutProps {
  actorColor: ActorColor;
  title: string;
  subtitle: string;
  who: string;
  whoRole: string;
  nav: PanelNavItem[];
  /** Ítems fijados al fondo del menú (ej. "Mi Perfil"), separados del resto. */
  navFooter?: PanelNavItem[];
  /** Grupo desplegable fijado al fondo (ej. "Configuración"): su submenú tapa al menú principal. */
  configGroup?: PanelNavGroup;
  /** Logo del actor (ej. logo de la empresa) para el encabezado del menú. */
  logo?: string;
  /** Muestra el badge de "Próximo cierre" en el encabezado (default true). */
  showCierreBadge?: boolean;
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
  navFooter,
  configGroup,
  logo,
  showCierreBadge = true,
  children,
}: PanelLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  // Preferencia por navegador: barra angosta solo con íconos (desktop/tablet).
  const [colapsada, setColapsada] = useState(leerColapsada);
  // El submenú de configuración arranca abierto si ya estamos en una de sus rutas.
  const [configAbierta, setConfigAbierta] = useState(
    () =>
      configGroup?.items.some((i) => i.to && pathname.startsWith(i.to)) ??
      false,
  );

  function alternarColapsada() {
    setColapsada((c) => {
      try {
        localStorage.setItem(CLAVE_COLAPSADA, c ? '0' : '1');
      } catch {
        // sin storage: la preferencia dura solo la sesión
      }
      return !c;
    });
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function renderItem(item: PanelNavItem) {
    const Icon = item.icon ?? Circle;
    const contenido = (
      <>
        <Icon size={18} aria-hidden className="shrink-0" />
        <span className={cx('truncate', colapsada && 'md:sr-only')}>
          {item.label}
        </span>
      </>
    );
    const base = cx(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
      colapsada && 'md:justify-center md:px-0',
    );
    return item.to ? (
      <NavLink
        key={item.label}
        to={item.to}
        end
        title={colapsada ? item.label : undefined}
        onClick={() => setAbierto(false)}
        className={({ isActive }) =>
          cx(
            base,
            isActive
              ? NAV_ACTIVE[actorColor]
              : 'text-white/60 hover:bg-white/5 hover:text-white',
          )
        }
      >
        {contenido}
      </NavLink>
    ) : (
      <span
        key={item.label}
        title="Disponible en una próxima entrega"
        className={cx(base, 'cursor-not-allowed text-white/25')}
      >
        {contenido}
      </span>
    );
  }

  return (
    <div className="flex h-dvh bg-eco-bg text-eco-ink print:block print:h-auto print:bg-white">
      {abierto && (
        <div
          aria-hidden
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setAbierto(false)}
        />
      )}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#14181C] text-white transition-[transform,width] md:static md:flex-shrink-0 md:translate-x-0 print:hidden',
          colapsada ? 'md:w-[72px]' : 'md:w-60',
          abierto ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div
          className={cx(
            'flex h-16 items-center gap-2.5 border-b border-white/10 px-4',
            colapsada && 'md:h-auto md:flex-col md:gap-2 md:px-0 md:py-3',
          )}
        >
          <img
            src={MARCA_LOGO}
            alt="EcoToken"
            className="h-9 w-9 shrink-0 object-contain"
          />
          <div className={cx('min-w-0 flex-1', colapsada && 'md:hidden')}>
            <div className="text-base font-bold leading-tight tracking-tight">
              EcoToken
            </div>
            <div
              className={cx(
                'truncate text-[11px] font-medium',
                LABEL_OSCURO[actorColor],
              )}
            >
              {subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={alternarColapsada}
            aria-label={colapsada ? 'Expandir menú' : 'Colapsar menú'}
            title={colapsada ? 'Expandir menú' : 'Colapsar menú'}
            className="hidden rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white md:block"
          >
            {colapsada ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="text-white/60 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
          aria-label="Secciones del panel"
        >
          {configGroup && configAbierta ? (
            // Submenú de configuración: tapa al menú principal, con "volver".
            <>
              <button
                type="button"
                onClick={() => setConfigAbierta(false)}
                title={colapsada ? 'Volver' : undefined}
                className={cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white',
                  colapsada && 'md:justify-center md:px-0',
                )}
              >
                <ArrowLeft size={18} aria-hidden className="shrink-0" />
                <span className={cx('truncate', colapsada && 'md:sr-only')}>
                  {configGroup.label}
                </span>
              </button>
              <div className="my-1 border-t border-white/10" />
              {configGroup.items.map(renderItem)}
            </>
          ) : (
            <>
              <div
                className={cx(
                  'px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-white/30',
                  colapsada && 'md:hidden',
                )}
              >
                Menú
              </div>
              {nav.map(renderItem)}

              {(navFooter?.length || configGroup) && (
                <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
                  {navFooter?.map(renderItem)}
                  {configGroup && (
                    <button
                      type="button"
                      onClick={() => setConfigAbierta(true)}
                      title={colapsada ? configGroup.label : undefined}
                      className={cx(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white',
                        colapsada && 'md:justify-center md:px-0',
                      )}
                    >
                      {(() => {
                        const Icon = configGroup.icon ?? Settings;
                        return (
                          <Icon size={18} aria-hidden className="shrink-0" />
                        );
                      })()}
                      <span
                        className={cx('truncate', colapsada && 'md:sr-only')}
                      >
                        {configGroup.label}
                      </span>
                      <ChevronRight
                        size={16}
                        aria-hidden
                        className={cx(
                          'ml-auto shrink-0',
                          colapsada && 'md:hidden',
                        )}
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div
            className={cx(
              'flex items-center gap-3 rounded-lg bg-white/5 p-2.5',
              colapsada && 'md:flex-col md:bg-transparent md:p-0',
            )}
          >
            {logo ? (
              <img
                src={logo}
                alt=""
                title={colapsada ? `${who} · ${whoRole}` : undefined}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                title={colapsada ? `${who} · ${whoRole}` : undefined}
                className={cx(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase',
                  STRIPE[actorColor],
                )}
              >
                {who.charAt(0) || '?'}
              </span>
            )}
            <div className={cx('min-w-0 flex-1', colapsada && 'md:hidden')}>
              <div className="truncate text-sm font-semibold text-white/85">
                {who}
              </div>
              <div className="truncate text-xs text-white/40">{whoRole}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
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
            {showCierreBadge && (
              <div className="ml-auto print:hidden">
                <CierreMesBadge />
              </div>
            )}
          </div>
        </header>
        {/* relative: los sr-only (absolute) quedan dentro del scroll del main; si no,
            estiran el body y aparece una segunda barra de scroll. */}
        <main className="relative flex-1 overflow-auto p-4 sm:p-6 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
