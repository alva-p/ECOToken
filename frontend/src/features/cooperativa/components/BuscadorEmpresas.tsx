import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Card } from '@/components/ui/Card';
import { cx } from '@/lib/cx';
import { buscarEmpresas } from '../api';
import type { Empresa } from '@/types';

const DEBOUNCE_MS = 300;
const LARGO_MINIMO = 2;

interface BuscadorEmpresasProps {
  onSelect: (empresa: Empresa) => void;
}

// Buscador con autocompletado de empresas adheridas APROBADAS (E4-HU03), para
// que la cooperativa le asocie un ingreso (el alta del ingreso en sí es E5-HU01).
export function BuscadorEmpresas({ onSelect }: BuscadorEmpresasProps) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Empresa[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [activo, setActivo] = useState(-1);
  // Evita pisar el resultado con la respuesta de una búsqueda anterior que
  // llega tarde (p. ej. al borrar caracteres rápido).
  const ultimaQuery = useRef('');

  useEffect(() => {
    const q = query.trim();
    if (q.length < LARGO_MINIMO) {
      setResultados([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    const timeout = setTimeout(() => {
      ultimaQuery.current = q;
      buscarEmpresas(q)
        .then((res) => {
          if (ultimaQuery.current === q) setResultados(res);
        })
        .catch(() => {
          if (ultimaQuery.current === q) setResultados([]);
        })
        .finally(() => {
          if (ultimaQuery.current === q) setCargando(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  function seleccionar(empresa: Empresa) {
    onSelect(empresa);
    setQuery(empresa.razonSocial);
    setAbierto(false);
    setActivo(-1);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!abierto || resultados.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActivo((i) => (i + 1) % resultados.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActivo((i) => (i <= 0 ? resultados.length - 1 : i - 1));
    } else if (event.key === 'Enter' && activo >= 0) {
      event.preventDefault();
      seleccionar(resultados[activo]);
    } else if (event.key === 'Escape') {
      setAbierto(false);
    }
  }

  const mostrarDropdown = abierto && query.trim().length >= LARGO_MINIMO;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setAbierto(true);
          setActivo(-1);
        }}
        onFocus={() => setAbierto(true)}
        // El timeout deja que onMouseDown de una opción dispare la selección
        // antes de que el blur cierre el dropdown.
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por razón social o CUIT…"
        aria-label="Buscar empresa"
        className="w-full rounded-lg border border-eco-border-strong px-3.5 py-2.5 text-sm text-eco-ink placeholder:text-eco-ink3 focus:outline-none focus:ring-2 focus:ring-eco-coop/30"
      />
      {mostrarDropdown && (
        <Card className="absolute z-10 mt-1 w-full p-1">
          {cargando ? (
            <div className="px-3 py-2 text-sm text-eco-ink2">Buscando…</div>
          ) : resultados.length === 0 ? (
            <div className="px-3 py-2 text-sm text-eco-ink2">
              No se encontraron empresas aprobadas.
            </div>
          ) : (
            resultados.map((empresa, i) => (
              <button
                key={empresa.id}
                type="button"
                onMouseDown={() => seleccionar(empresa)}
                className={cx(
                  'block w-full rounded-lg px-3 py-2 text-left text-sm',
                  i === activo ? 'bg-eco-coop-soft' : 'hover:bg-eco-bg',
                )}
              >
                <div className="font-medium text-eco-ink">
                  {empresa.razonSocial}
                </div>
                <div className="text-xs text-eco-ink2">{empresa.cuit}</div>
              </button>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
