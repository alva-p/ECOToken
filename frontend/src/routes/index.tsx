import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RankingPage } from '@/features/ranking/pages/RankingPage';
import { VerificarPage } from '@/features/certificados/pages/VerificarPage';
import { EmpresaLayout } from '@/layouts/EmpresaLayout';
import { EmpresaDashboardPage } from '@/features/empresa/pages/DashboardPage';
import { CooperativaLayout } from '@/layouts/CooperativaLayout';
import { CooperativaDashboardPage } from '@/features/cooperativa/pages/DashboardPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/pages/DashboardPage';
import { CooperativasPage } from '@/features/admin/pages/CooperativasPage';
import { ContratoPage } from '@/features/admin/pages/ContratoPage';
import { MunicipioLayout } from '@/layouts/MunicipioLayout';
import { MunicipioDashboardPage } from '@/features/municipio/pages/DashboardPage';

/** Definición de rutas. Ver doc/ESTRUCTURA-PROYECTO.md §5. */
export const router = createBrowserRouter([
  // Públicas, sin login (E11-HU03).
  { path: '/', element: <App /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/ranking', element: <RankingPage /> },
  { path: '/verificar', element: <VerificarPage /> },
  { path: '/verificar/:hash', element: <VerificarPage /> },

  // Por actor, protegidas por rol.
  {
    path: '/empresa',
    element: (
      <ProtectedRoute roles={['EMPRESA']}>
        <EmpresaLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <EmpresaDashboardPage /> }],
  },
  {
    path: '/cooperativa',
    element: (
      <ProtectedRoute roles={['COOPERATIVA']}>
        <CooperativaLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <CooperativaDashboardPage /> }],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'cooperativas', element: <CooperativasPage /> },
      { path: 'contrato', element: <ContratoPage /> },
    ],
  },
  {
    path: '/municipio',
    element: (
      <ProtectedRoute roles={['MUNICIPALIDAD']}>
        <MunicipioLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <MunicipioDashboardPage /> }],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
