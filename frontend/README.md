# ECOToken — Frontend

SPA React 18 + Vite (SWC) + TypeScript + TailwindCSS. Organización **feature-first** por actor (empresa / cooperativa / admin / municipio). Modelo **custodial**: sin conexión de wallet; consume **API REST + WebSocket** y usa el explorador de bloques solo para links de verificación.

## Estructura

```
src/
├── lib/         # api.ts, ws.ts, explorer.ts (infraestructura transversal)
├── providers/   # context providers (Auth, Query, Router)
├── routes/      # rutas + ProtectedRoute (RBAC)
├── layouts/     # shells de navegación por rol
├── features/    # empresa | cooperativa | admin | municipio (pages/components/hooks/api)
└── components/ui/  # primitivos compartidos (shadcn)
```

Detalle en [`../doc/ESTRUCTURA-PROYECTO.md`](../doc/ESTRUCTURA-PROYECTO.md) §5.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # completar VITE_API_URL, VITE_WS_URL, VITE_EXPLORER_URL
npm run dev                 # http://localhost:5173
```
