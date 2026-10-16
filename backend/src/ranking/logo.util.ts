/** Ruta pública del logo (`/empresas/:id/logo`), o null si la empresa no subió uno. */
export const rutaLogo = (e: { id: string; logoUrl: string | null }) =>
  e.logoUrl ? `/empresas/${e.id}/logo` : null;
