import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

/**
 * EcoNetworkAnimation
 * ---------------------------------------------------------------
 * Escena isométrica (SVG puro, sin dependencias) donde viajan
 * paquetitos entre Empresas → Cooperativa → Municipalidad → Empresas,
 * pasando por el "Registro verificable" (hub central).
 *
 * - Sin librerías: solo React + SVG/SMIL (rinde en todos los navegadores modernos).
 * - Se pausa sola cuando no está en pantalla o si el usuario tiene
 *   "reducir movimiento" activado.
 * - Soporte dual de temas (claro y oscuro): paleta adaptada para modo oscuro
 *   sin modificar en absoluto la paleta del modo claro.
 * - Escala al ancho del contenedor (width: 100%).
 *
 * Uso:  <EcoNetworkAnimation isDark={isDark} />
 */

/* ───────────── Paletas de colores (Claro / Oscuro) ───────────── */

const LIGHT_PALETTE = {
  isDark: false,
  green: '#3a7a3a',
  greenDark: '#2a5f2e',
  muted: '#4f6b5d',
  line: '#a9c5bb',
  edge: '#8fb3a1',
  soft: '#d3e4da',
  mint: '#cfe3d6',
  faces: {
    top: '#ffffff',
    left: '#f1f7f3',
    right: '#e0ece5',
  },
  roadFill: '#f1f7f3',
  roadStroke: '#d3e4da',
  roadDash: '#a9c5bb',
  tagBg: '#ffffff',
  tagBorder: '#a9c5bb',
  tagText: '#4f6b5d',
  slabDash: '#d3e4da',
  // Municipalidad
  muniCol: '#ffffff',
  muniDoor: '#cfe3d6',
  muniRoofL: '#f8fbf9',
  muniRoofR: '#dbeae1',
  muniRoofFront: '#f1f7f3',
  muniPediment: '#3a7a3a',
  flagPole: '#2a5f2e',
  flag: '#3a7a3a',
  // Cooperativa
  coopStripe: '#3a7a3a',
  coopDoor: '#cfe3d6',
  coopWindow: '#cfe3d6',
  coopRoofL: '#f8fbf9',
  coopRoofR: '#dbeae1',
  coopRoofFront: '#e0ece5',
  bale: {
    top: '#e3f2e7',
    left: '#a9d3b3',
    right: '#85bb94',
    stroke: '#4f8f5f',
  },
  // Empresas
  empRoofPad: '#3a7a3a',
  empStripe: '#3a7a3a',
  winLit: '#8fcf9b',
  winUnlit: '#cfe3d6',
  // Hub
  hubRingPulse: '#3a7a3a',
  hubWall: '#e0ece5',
  hubTop: '#ffffff',
  hubDash: '#a9c5bb',
  hubShadow: 'rgba(42,95,46,0.18)',
  hubLeafCircle: '#ffffff',
  hubLeafStroke: '#3a7a3a',
  hubText: '#3a7a3a',
  // Orbits
  orbitOuter: '#a9c5bb',
  orbitInner: '#a9c5bb',
  orbitDot: '#3a7a3a',
  // Packages
  pkgShadow: 'rgba(18,33,26,0.14)',
  pkgMaterial: {
    top: '#e3f2e7',
    left: '#a9d3b3',
    right: '#85bb94',
    edge: '#4f8f5f',
  },
  pkgValidated: {
    top: '#9bd8a6',
    left: '#58a86b',
    right: '#3f8a52',
    edge: '#2a5f2e',
  },
  badgeCircle: '#ffffff',
  badgeCheck: '#3a7a3a',
  certBox: {
    top: '#ffffff',
    left: '#f1f7f3',
    right: '#e0ece5',
  },
  certStroke: '#3a7a3a',
  certSeal: '#3a7a3a',
};

const DARK_PALETTE: typeof LIGHT_PALETTE = {
  isDark: true,
  green: '#53e8a5',
  greenDark: '#357f5c',
  muted: '#a3c2b4',
  line: 'rgba(83, 232, 165, 0.28)',
  edge: '#245a46',
  soft: 'rgba(83, 232, 165, 0.18)',
  mint: '#163b2f',
  faces: {
    top: '#16362a',
    left: '#10271f',
    right: '#0b1d16',
  },
  roadFill: '#0d221a',
  roadStroke: '#1a4938',
  roadDash: '#53e8a5',
  tagBg: '#091813',
  tagBorder: 'rgba(83, 232, 165, 0.35)',
  tagText: '#bcf2d8',
  slabDash: 'rgba(83, 232, 165, 0.35)',
  // Municipalidad
  muniCol: '#275e4b',
  muniDoor: '#091c16',
  muniRoofL: '#183d30',
  muniRoofR: '#122f25',
  muniRoofFront: '#15362b',
  muniPediment: '#53e8a5',
  flagPole: '#53e8a5',
  flag: '#baff3c',
  // Cooperativa
  coopStripe: '#53e8a5',
  coopDoor: '#091c16',
  coopWindow: '#0e2b20',
  coopRoofL: '#183d30',
  coopRoofR: '#122f25',
  coopRoofFront: '#0f271f',
  bale: {
    top: '#285537',
    left: '#1a3c26',
    right: '#132c1c',
    stroke: '#3c8454',
  },
  // Empresas
  empRoofPad: '#53e8a5',
  empStripe: '#53e8a5',
  winLit: '#baff3c',
  winUnlit: '#0c221a',
  // Hub
  hubRingPulse: '#53e8a5',
  hubWall: '#0c1f18',
  hubTop: '#143328',
  hubDash: 'rgba(83, 232, 165, 0.35)',
  hubShadow: 'rgba(0, 0, 0, 0.55)',
  hubLeafCircle: '#0f271f',
  hubLeafStroke: '#53e8a5',
  hubText: '#53e8a5',
  // Orbits
  orbitOuter: 'rgba(186, 255, 60, 0.22)',
  orbitInner: 'rgba(83, 232, 165, 0.25)',
  orbitDot: '#baff3c',
  // Packages
  pkgShadow: 'rgba(0, 0, 0, 0.5)',
  pkgMaterial: {
    top: '#2c613e',
    left: '#1f482e',
    right: '#163622',
    edge: '#4fa86d',
  },
  pkgValidated: {
    top: '#53e8a5',
    left: '#32b478',
    right: '#228a5a',
    edge: '#7df5c2',
  },
  badgeCircle: '#091813',
  badgeCheck: '#53e8a5',
  certBox: {
    top: '#183d30',
    left: '#112d23',
    right: '#0b2019',
  },
  certStroke: '#53e8a5',
  certSeal: '#baff3c',
};

const AnimationThemeContext =
  createContext<typeof LIGHT_PALETTE>(LIGHT_PALETTE);

const MONO =
  "'Space Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/* ───────────── Proyección isométrica 2:1 ─────────────
   x, y = plano del suelo · z = altura
   Lo que tiene mayor (x + y) queda más cerca del espectador. */
type Point3D = [number, number, number?];
type Point2D = [number, number];

const iso = (x: number, y: number, z = 0): Point2D => [x - y, (x + y) / 2 - z];
const f = (n: number) => +n.toFixed(2);
const P = (pts: Point3D[]) =>
  pts
    .map(([x, y, z = 0]) =>
      iso(x, y, z)
        .map((n) => f(n))
        .join(','),
    )
    .join(' ');

/* Camino con esquinas redondeadas (para que los paquetes giren suave) */
const roundedPath = (pts: Point2D[], r = 16) => {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py);
    const l2 = Math.hypot(nx - cx, ny - cy);
    const k1 = Math.min(r, l1 / 2) / l1;
    const k2 = Math.min(r, l2 / 2) / l2;
    d += ` L${f(cx + (px - cx) * k1)} ${f(cy + (py - cy) * k1)}`;
    d += ` Q${f(cx)} ${f(cy)} ${f(cx + (nx - cx) * k2)} ${f(cy + (ny - cy) * k2)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
};

/* ───────────── Geometría de la escena ───────────── */
const SPOKE = 190; // distancia hub → edificio
const EDGE = 146; // borde de cada plataforma (donde empieza/termina el camino)

const NODE = {
  municipalidad: { x: 0, y: -SPOKE }, // arriba-derecha
  cooperativa: { x: SPOKE, y: 0 }, // abajo-derecha
  empresas: { x: 0, y: SPOKE }, // abajo-izquierda
};

type PackageKind = 'material' | 'validated' | 'certificate';

interface RouteDef {
  id: string;
  kind: PackageKind;
  pts: Point2D[];
}

/* Rutas de los paquetes: [x, y] en coordenadas de suelo */
const RAW_ROUTES: RouteDef[] = [
  // Empresas entregan material → Cooperativa (pasa por el registro)
  {
    id: 'material',
    kind: 'material',
    pts: [
      [0, EDGE],
      [0, 0],
      [EDGE, 0],
    ],
  },
  // Cooperativa valida y registra → Municipalidad
  {
    id: 'validado',
    kind: 'validated',
    pts: [
      [EDGE, 0],
      [0, 0],
      [0, -EDGE],
    ],
  },
  // Municipalidad devuelve certificado / beneficio → Empresas
  {
    id: 'certificado',
    kind: 'certificate',
    pts: [
      [0, -EDGE],
      [0, 0],
      [0, EDGE],
    ],
  },
];

const ROUTES: (RouteDef & { d: string })[] = RAW_ROUTES.map((r) => ({
  ...r,
  d: roundedPath(r.pts.map(([x, y]) => iso(x, y))),
}));

const CYCLE = 9; // segundos por vuelta completa de un paquete
const STAGGER = 1.5; // un paquete llega al hub cada 1.5 s

/* ───────────── Primitivas ───────────── */

interface BoxFaces {
  top?: string;
  left: string;
  right: string;
}

interface IsoBoxProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  faces?: BoxFaces;
  stroke?: string;
  sw?: number;
  top?: boolean;
}

/** Prisma rectangular isométrico (x, y = centro · w, d = medios anchos · h = alto) */
function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  faces,
  stroke,
  sw = 1.1,
  top = true,
}: IsoBoxProps) {
  const C = useContext(AnimationThemeContext);
  const actualFaces = faces ?? C.faces;
  const actualStroke = stroke ?? C.edge;

  const x0 = x - w,
    x1 = x + w,
    y0 = y - d,
    y1 = y + d,
    z1 = z + h;
  return (
    <g stroke={actualStroke} strokeWidth={sw} strokeLinejoin="round">
      <polygon
        points={P([
          [x0, y1, z],
          [x1, y1, z],
          [x1, y1, z1],
          [x0, y1, z1],
        ])}
        fill={actualFaces.left}
      />
      <polygon
        points={P([
          [x1, y1, z],
          [x1, y0, z],
          [x1, y0, z1],
          [x1, y1, z1],
        ])}
        fill={actualFaces.right}
      />
      {top && (
        <polygon
          points={P([
            [x0, y0, z1],
            [x1, y0, z1],
            [x1, y1, z1],
            [x0, y1, z1],
          ])}
          fill={actualFaces.top}
        />
      )}
    </g>
  );
}

interface BuildingBox {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
}

/* Rectángulos pegados a la cara izquierda (+y) o derecha (+x) de una caja.
   u0..u1 = posición horizontal (0-1) · v0..v1 = posición vertical (0-1) */
const leftRect = (
  b: BuildingBox,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
): Point3D[] => {
  const xa = b.x - b.w + u0 * 2 * b.w;
  const xb = b.x - b.w + u1 * 2 * b.w;
  const y = b.y + b.d;
  const za = b.z + v0 * b.h;
  const zb = b.z + v1 * b.h;
  return [
    [xa, y, za],
    [xb, y, za],
    [xb, y, zb],
    [xa, y, zb],
  ];
};

const rightRect = (
  b: BuildingBox,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
): Point3D[] => {
  const x = b.x + b.w;
  const ya = b.y + b.d - u0 * 2 * b.d;
  const yb = b.y + b.d - u1 * 2 * b.d;
  const za = b.z + v0 * b.h;
  const zb = b.z + v1 * b.h;
  return [
    [x, ya, za],
    [x, yb, za],
    [x, yb, zb],
    [x, ya, zb],
  ];
};

interface WindowsProps {
  b: BuildingBox;
  side: 'left' | 'right';
  cols: number;
  rows: number;
  seed?: number;
}

/** Ventanas en cuadrícula; algunas "parpadean" suavemente */
function Windows({ b, side, cols, rows, seed = 0 }: WindowsProps) {
  const C = useContext(AnimationThemeContext);
  const rect = side === 'left' ? leftRect : rightRect;
  const out = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const u0 = (c + 0.2) / cols,
        u1 = (c + 0.8) / cols;
      const v0 = 0.1 + (0.8 * (r + 0.2)) / rows,
        v1 = 0.1 + (0.8 * (r + 0.8)) / rows;
      const lit = (c * 3 + r * 2 + seed) % 4 === 0;
      out.push(
        <polygon
          key={`${side}-${c}-${r}`}
          points={P(rect(b, u0, u1, v0, v1))}
          fill={lit ? C.winLit : C.winUnlit}
        >
          {lit && (
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${2.4 + ((c + r + seed) % 4) * 0.7}s`}
              begin={`${((c * 5 + r * 3 + seed) % 7) * 0.4}s`}
              repeatCount="indefinite"
            />
          )}
        </polygon>,
      );
    }
  }
  return <g>{out}</g>;
}

/** Plataforma base de cada edificio */
function Slab({ x, y }: { x: number; y: number }) {
  const C = useContext(AnimationThemeContext);
  return (
    <g>
      <IsoBox x={x} y={y} w={44} d={44} h={4} />
      <polygon
        points={P([
          [x - 38, y - 38, 4],
          [x + 38, y - 38, 4],
          [x + 38, y + 38, 4],
          [x - 38, y + 38, 4],
        ])}
        fill="none"
        stroke={C.slabDash}
        strokeWidth="1"
        strokeDasharray="3 4"
      />
    </g>
  );
}

/** Camino (calle) desde el hub hasta un edificio */
function Road({ dx, dy }: { dx: number; dy: number }) {
  const C = useContext(AnimationThemeContext);
  const hw = 9;
  const nx = -dy,
    ny = dx;
  const ex = dx * EDGE,
    ey = dy * EDGE;
  const [x1, y1] = iso(0, 0);
  const [x2, y2] = iso(ex, ey);
  return (
    <g>
      <polygon
        points={P([
          [nx * hw, ny * hw],
          [ex + nx * hw, ey + ny * hw],
          [ex - nx * hw, ey - ny * hw],
          [-nx * hw, -ny * hw],
        ])}
        fill={C.roadFill}
        stroke={C.roadStroke}
        strokeWidth="1"
      />
      <line
        x1={f(x1)}
        y1={f(y1)}
        x2={f(x2)}
        y2={f(y2)}
        stroke={C.roadDash}
        strokeWidth="1.2"
        strokeDasharray="4 6"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-20"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </line>
    </g>
  );
}

/** Etiqueta con caja, como en el diseño original */
function Tag({ x, y, text }: { x: number; y: number; text: string }) {
  const C = useContext(AnimationThemeContext);
  const w = text.length * 7.2 + 22;
  const h = 22;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        fill={C.tagBg}
        stroke={C.tagBorder}
        strokeWidth="1.2"
        rx="2"
      />
      <text
        textAnchor="middle"
        dy="0.35em"
        fontFamily={MONO}
        fontSize="11.5"
        letterSpacing="0.02em"
        fill={C.tagText}
      >
        {text}
      </text>
    </g>
  );
}

/* ───────────── Edificios ───────────── */

function Municipalidad({ x, y }: { x: number; y: number }) {
  const C = useContext(AnimationThemeContext);
  const b: BuildingBox = { x, y, z: 4, w: 34, d: 26, h: 38 };
  const z1 = 42; // alto del techo
  const rz = 54; // alto de la cumbrera
  const [px, py] = iso(x, y, rz);
  const columns = [0.17, 0.39, 0.61, 0.83];
  return (
    <g>
      <Slab x={x} y={y} />
      <IsoBox {...b} top={false} />
      {/* columnas del frente y puerta */}
      {columns.map((u) => (
        <polygon
          key={u}
          points={P(leftRect(b, u - 0.035, u + 0.035, 0, 1))}
          fill={C.muniCol}
          stroke={C.edge}
          strokeWidth="1"
        />
      ))}
      <polygon
        points={P(leftRect(b, 0.45, 0.55, 0, 0.45))}
        fill={C.muniDoor}
        stroke={C.edge}
        strokeWidth="1"
      />
      {/* techo a dos aguas con frontón */}
      <g stroke={C.edge} strokeWidth="1.1" strokeLinejoin="round">
        <polygon
          points={P([
            [x - b.w, y - b.d, z1],
            [x - b.w, y + b.d, z1],
            [x, y + b.d, rz],
            [x, y - b.d, rz],
          ])}
          fill={C.muniRoofL}
        />
        <polygon
          points={P([
            [x + b.w, y - b.d, z1],
            [x + b.w, y + b.d, z1],
            [x, y + b.d, rz],
            [x, y - b.d, rz],
          ])}
          fill={C.muniRoofR}
        />
        <polygon
          points={P([
            [x - b.w, y + b.d, z1],
            [x + b.w, y + b.d, z1],
            [x, y + b.d, rz],
          ])}
          fill={C.muniRoofFront}
        />
      </g>
      <polygon
        points={P([
          [x - b.w + 8, y + b.d, z1 + 2],
          [x + b.w - 8, y + b.d, z1 + 2],
          [x, y + b.d, rz - 3],
        ])}
        fill="none"
        stroke={C.muniPediment}
        strokeWidth="1"
      />
      {/* bandera */}
      <line
        x1={f(px)}
        y1={f(py)}
        x2={f(px)}
        y2={f(py - 18)}
        stroke={C.flagPole}
        strokeWidth="1.3"
      />
      <polygon
        transform={`translate(${f(px)} ${f(py - 18)})`}
        points="0,0 13,2 0,7"
        fill={C.flag}
      >
        <animate
          attributeName="points"
          values="0,0 13,2 0,7;0,0 10,4 0,7;0,0 13,2 0,7"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </polygon>
    </g>
  );
}

function Cooperativa({ x, y }: { x: number; y: number }) {
  const C = useContext(AnimationThemeContext);
  const b: BuildingBox = { x, y, z: 4, w: 34, d: 26, h: 28 };
  const z1 = 32;
  const rz = 44;
  const x0 = x - b.w,
    x1 = x + b.w,
    y0 = y - b.d,
    y1 = y + b.d;
  return (
    <g>
      <Slab x={x} y={y} />
      <IsoBox {...b} top={false} />
      {/* franja verde, portón y ventanas */}
      <polygon
        points={P(leftRect(b, 0, 1, 0.86, 1))}
        fill={C.coopStripe}
        opacity="0.85"
      />
      <polygon
        points={P(leftRect(b, 0.1, 0.52, 0, 0.7))}
        fill={C.coopDoor}
        stroke={C.edge}
        strokeWidth="1"
      />
      {[0.2, 0.34, 0.48, 0.62].map((v) => (
        <polygon
          key={v}
          points={P(leftRect(b, 0.1, 0.52, v * 0.7, v * 0.7 + 0.004))}
          fill="none"
          stroke={C.edge}
          strokeWidth="0.8"
        />
      ))}
      <polygon
        points={P(leftRect(b, 0.64, 0.9, 0.3, 0.62))}
        fill={C.coopWindow}
      />
      <polygon
        points={P(rightRect(b, 0.18, 0.4, 0.35, 0.7))}
        fill={C.coopWindow}
      />
      <polygon
        points={P(rightRect(b, 0.6, 0.82, 0.35, 0.7))}
        fill={C.coopWindow}
      />
      {/* techo (cumbrera en x) */}
      <g stroke={C.edge} strokeWidth="1.1" strokeLinejoin="round">
        <polygon
          points={P([
            [x0, y0, z1],
            [x1, y0, z1],
            [x1, y, rz],
            [x0, y, rz],
          ])}
          fill={C.coopRoofL}
        />
        <polygon
          points={P([
            [x0, y1, z1],
            [x1, y1, z1],
            [x1, y, rz],
            [x0, y, rz],
          ])}
          fill={C.coopRoofR}
        />
        <polygon
          points={P([
            [x1, y1, z1],
            [x1, y0, z1],
            [x1, y, rz],
          ])}
          fill={C.coopRoofFront}
        />
      </g>
      {/* fardos de material apilados */}
      {[-22, -8, 6].map((dx) => (
        <IsoBox
          key={dx}
          x={x + dx}
          y={y + 36}
          z={4}
          w={6.5}
          d={6.5}
          h={8}
          faces={C.bale}
          stroke={C.bale.stroke}
          sw={1}
        />
      ))}
      <IsoBox
        x={x - 8}
        y={y + 36}
        z={12}
        w={6.5}
        d={6.5}
        h={8}
        faces={C.bale}
        stroke={C.bale.stroke}
        sw={1}
      />
    </g>
  );
}

function Empresas({ x, y }: { x: number; y: number }) {
  const C = useContext(AnimationThemeContext);
  const A: BuildingBox = { x: x - 6, y: y - 4, z: 4, w: 17, d: 17, h: 76 };
  const B: BuildingBox = { x: x + 16, y: y + 12, z: 4, w: 14, d: 14, h: 44 };
  return (
    <g>
      <Slab x={x} y={y} />
      <IsoBox {...A} />
      <Windows b={A} side="left" cols={3} rows={7} seed={1} />
      <Windows b={A} side="right" cols={3} rows={7} seed={2} />
      <polygon
        points={P([
          [A.x - 11, A.y - 11, A.z + A.h],
          [A.x + 11, A.y - 11, A.z + A.h],
          [A.x + 11, A.y + 11, A.z + A.h],
          [A.x - 11, A.y + 11, A.z + A.h],
        ])}
        fill={C.empRoofPad}
        opacity="0.22"
      />
      <IsoBox {...B} />
      <Windows b={B} side="left" cols={2} rows={4} seed={3} />
      <Windows b={B} side="right" cols={2} rows={4} seed={0} />
      <polygon
        points={P(leftRect(B, 0, 1, 0.9, 1))}
        fill={C.empStripe}
        opacity="0.85"
      />
    </g>
  );
}

/* ───────────── Hub central: "Registro verificable" ───────────── */

function Hub() {
  const C = useContext(AnimationThemeContext);
  const pulse = { dur: '1.5s', begin: '3.15s', repeatCount: 'indefinite' }; // sincronizado con la llegada de paquetes
  return (
    <g>
      <ellipse
        rx="46"
        ry="23"
        fill="none"
        stroke={C.hubRingPulse}
        strokeWidth="1.4"
        opacity="0"
      >
        <animate attributeName="rx" values="46;112" {...pulse} />
        <animate attributeName="ry" values="23;56" {...pulse} />
        <animate attributeName="opacity" values="0.55;0" {...pulse} />
      </ellipse>
      <path
        d="M-46 0 v6 a46 23 0 0 0 92 0 v-6"
        fill={C.hubWall}
        stroke={C.hubRingPulse}
        strokeWidth="1.4"
      />
      <ellipse
        rx="46"
        ry="23"
        fill={C.hubTop}
        stroke={C.hubRingPulse}
        strokeWidth="1.6"
      />
      <ellipse
        rx="33"
        ry="16.5"
        fill="none"
        stroke={C.hubDash}
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <ellipse cy="2" rx="13" ry="6.5" fill={C.hubShadow}>
        <animate
          attributeName="rx"
          values="13;9;13"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="ry"
          values="6.5;4.5;6.5"
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* hoja flotante */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 -44;0 -51;0 -44"
          dur="3s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
        />
        <circle
          r="19"
          fill={C.hubLeafCircle}
          stroke={C.hubLeafStroke}
          strokeWidth="1.6"
        />
        <g
          transform="translate(-13 -13) scale(1.08)"
          fill="none"
          stroke={C.hubLeafStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </g>
      </g>
    </g>
  );
}

/* ───────────── Paquetes ───────────── */

function PackageBody({ kind }: { kind: PackageKind }) {
  const C = useContext(AnimationThemeContext);
  if (kind === 'certificate') {
    // hoja plana con sello
    return (
      <g>
        <IsoBox
          x={0}
          y={0}
          z={9}
          w={7}
          d={5}
          h={1.6}
          faces={C.certBox}
          stroke={C.certStroke}
          sw={1}
        />
        <ellipse cx="0" cy={f(-10.6)} rx="3" ry="1.5" fill={C.certSeal} />
      </g>
    );
  }
  const pal = kind === 'material' ? C.pkgMaterial : C.pkgValidated;
  return (
    <g>
      <IsoBox
        x={0}
        y={0}
        z={3}
        w={4.5}
        d={4.5}
        h={9}
        faces={pal}
        stroke={pal.edge}
        sw={1}
      />
      {kind === 'validated' && (
        <g transform="translate(0 -22)">
          <circle
            r="4.8"
            fill={C.badgeCircle}
            stroke={C.badgeCheck}
            strokeWidth="1.2"
          />
          <path
            d="M-2.3 0.2 L-0.7 1.8 L2.4 -1.7"
            fill="none"
            stroke={C.badgeCheck}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
}

function Package({
  d,
  kind,
  begin,
}: {
  d: string;
  kind: PackageKind;
  begin: number;
}) {
  const C = useContext(AnimationThemeContext);
  const t = { dur: `${CYCLE}s`, begin: `${begin}s`, repeatCount: 'indefinite' };
  return (
    <g opacity="0">
      <animateMotion
        path={d}
        {...t}
        calcMode="spline"
        keyPoints="0;1;1"
        keyTimes="0;0.7;1"
        keySplines="0.45 0 0.55 1;0 0 1 1"
      />
      <animate
        attributeName="opacity"
        values="0;1;1;0;0"
        keyTimes="0;0.05;0.65;0.7;1"
        {...t}
      />
      <ellipse rx="9" ry="4.5" fill={C.pkgShadow} />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 -3;0 0"
          dur="1.2s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
        />
        <PackageBody kind={kind} />
      </g>
    </g>
  );
}

/* ───────────── Componente principal ───────────── */

export interface EcoNetworkAnimationProps {
  className?: string;
  style?: CSSProperties;
  isDark?: boolean;
}

export function EcoNetworkAnimation({
  className,
  style,
  isDark: isDarkProp,
}: EcoNetworkAnimationProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [internalDark, setInternalDark] = useState(false);

  // Detección automática en caso de que no se pase isDark explícitamente
  useEffect(() => {
    if (isDarkProp !== undefined) return;
    const checkDark = () => {
      const siteShell = document.querySelector('.site-shell');
      if (siteShell) {
        setInternalDark(siteShell.classList.contains('dark'));
      } else {
        setInternalDark(
          window.matchMedia('(prefers-color-scheme: dark)').matches,
        );
      }
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [isDarkProp]);

  const activeDark = isDarkProp ?? internalDark;
  const themeColors = activeDark ? DARK_PALETTE : LIGHT_PALETTE;

  // Pausa la animación fuera de pantalla o con "reducir movimiento"
  useEffect(() => {
    const svg = ref.current;
    if (!svg || typeof svg.pauseAnimations !== 'function') return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    const sync = () =>
      visible && !reduce.matches
        ? svg.unpauseAnimations()
        : svg.pauseAnimations();
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(svg);
    reduce.addEventListener('change', sync);
    sync();
    return () => {
      io.disconnect();
      reduce.removeEventListener('change', sync);
    };
  }, []);

  const ringOuter = { rx: SPOKE * Math.SQRT2, ry: (SPOKE * Math.SQRT2) / 2 };
  const ringInner = { rx: 95 * Math.SQRT2, ry: (95 * Math.SQRT2) / 2 };
  const orbitPath = `M${f(ringOuter.rx)} 0 A${f(ringOuter.rx)} ${f(ringOuter.ry)} 0 1 1 ${f(-ringOuter.rx)} 0 A${f(ringOuter.rx)} ${f(ringOuter.ry)} 0 1 1 ${f(ringOuter.rx)} 0`;

  const mS = iso(NODE.municipalidad.x, NODE.municipalidad.y);
  const cS = iso(NODE.cooperativa.x, NODE.cooperativa.y);
  const eS = iso(NODE.empresas.x, NODE.empresas.y);

  return (
    <AnimationThemeContext.Provider value={themeColors}>
      <svg
        ref={ref}
        className={className}
        viewBox="-300 -245 600 410"
        width="100%"
        role="img"
        aria-label="Red de confianza: empresas, cooperativas y municipalidad conectadas por un registro verificable"
        style={{
          display: 'block',
          height: 'auto',
          overflow: 'visible',
          ...style,
        }}
      >
        {/* órbitas (guiño al diseño original) */}
        <ellipse
          rx={f(ringOuter.rx)}
          ry={f(ringOuter.ry)}
          fill="none"
          stroke={themeColors.orbitOuter}
          strokeWidth="1.2"
          strokeDasharray="2 7"
        />
        <ellipse
          rx={f(ringInner.rx)}
          ry={f(ringInner.ry)}
          fill="none"
          stroke={themeColors.orbitInner}
          strokeWidth="1"
          opacity="0.6"
        />
        <g>
          <circle r="7" fill={themeColors.orbitDot} opacity="0.15" />
          <circle r="3" fill={themeColors.orbitDot} />
          <animateMotion path={orbitPath} dur="26s" repeatCount="indefinite" />
        </g>

        {/* calles */}
        <Road dx={1} dy={0} />
        <Road dx={0} dy={-1} />
        <Road dx={0} dy={1} />

        {/* de atrás hacia adelante */}
        <Municipalidad {...NODE.municipalidad} />
        <Hub />
        <Cooperativa {...NODE.cooperativa} />
        <Empresas {...NODE.empresas} />

        {/* paquetes: 2 por ruta, escalonados */}
        {ROUTES.flatMap((r, ri) =>
          [0, 1].map((pi) => (
            <Package
              key={`${r.id}-${pi}`}
              d={r.d}
              kind={r.kind}
              begin={ri * STAGGER + pi * (CYCLE / 2)}
            />
          )),
        )}

        {/* textos */}
        <text
          textAnchor="middle"
          fontFamily={MONO}
          fontSize="10.5"
          letterSpacing="0.08em"
          fill={themeColors.hubText}
        >
          <tspan x="0" y="42">
            REGISTRO
          </tspan>
          <tspan x="0" y="56">
            VERIFICABLE
          </tspan>
        </text>
        <Tag x={f(mS[0])} y={-192} text="Municipalidad" />
        <Tag x={f(cS[0])} y={24} text="Cooperativas" />
        <Tag x={f(eS[0])} y={-34} text="Empresas" />
      </svg>
    </AnimationThemeContext.Provider>
  );
}

export default EcoNetworkAnimation;
