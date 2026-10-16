import { HistorialEntregas } from '@/features/cooperativa/components/HistorialEntregas';
import { OrganizacionBeneficiosPage } from '@/features/empresa/pages/BeneficiosPage';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegistroPage } from '@/features/auth/pages/RegistroPage';
import {
  RankingContenido,
  RankingPage,
} from '@/features/ranking/pages/RankingPage';
import { VerificarPage } from '@/features/certificados/pages/VerificarPage';
import { EmpresaLayout } from '@/layouts/EmpresaLayout';
import { EmpresaDashboardPage } from '@/features/empresa/pages/DashboardPage';
import { HistorialAportesPage } from '@/features/empresa/pages/HistorialAportesPage';
import { ComprobanteAportePage } from '@/features/empresa/pages/ComprobanteAportePage';
import { CertificadosPage } from '@/features/empresa/pages/CertificadosPage';
import { PerfilPage } from '@/features/empresa/pages/PerfilPage';
import { CooperativaLayout } from '@/layouts/CooperativaLayout';
import { CooperativaDashboardPage } from '@/features/cooperativa/pages/DashboardPage';
import { CooperativaPerfilPage } from '@/features/cooperativa/pages/PerfilPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminOverviewPage } from '@/features/admin/pages/OverviewPage';
import { AdminDashboardPage } from '@/features/admin/pages/DashboardPage';
import { UsuariosPage } from '@/features/admin/pages/UsuariosPage';
import { CooperativasPage } from '@/features/admin/pages/CooperativasPage';
import { RolesPage } from '@/features/admin/pages/RolesPage';
import { ContratoPage } from '@/features/admin/pages/ContratoPage';
import { MunicipioLayout } from '@/layouts/MunicipioLayout';
import { MunicipioDashboardPage } from '@/features/municipio/pages/DashboardPage';
import { BeneficiosPage } from '@/features/municipio/pages/BeneficiosPage';

/** Definición de rutas. Ver doc/ESTRUCTURA-PROYECTO.md §5. */
export const router = createBrowserRouter([
  // Públicas, sin login (E11-HU03).
  { path: '/', element: <App /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegistroPage /> },
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
    children: [
      { index: true, element: <EmpresaDashboardPage /> },
      { path: 'aportes', element: <HistorialAportesPage /> },
      { path: 'aportes/:id', element: <ComprobanteAportePage /> },
      { path: 'ranking', element: <RankingContenido enPanel /> },
      { path: 'certificados', element: <CertificadosPage /> },
      { path: 'beneficios', element: <OrganizacionBeneficiosPage /> },
      { path: 'perfil', element: <PerfilPage /> },
    ],
  },
  {
    path: '/cooperativa',
    element: (
      <ProtectedRoute roles={['COOPERATIVA']}>
        <CooperativaLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CooperativaDashboardPage /> },
      { path: 'historial', element: <HistorialEntregas /> },
      { path: 'perfil', element: <CooperativaPerfilPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: 'empresas', element: <AdminDashboardPage /> },
      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'cooperativas', element: <CooperativasPage /> },
      { path: 'roles', element: <RolesPage /> },
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
    children: [
      { index: true, element: <MunicipioDashboardPage /> },
      { path: 'beneficios', element: <BeneficiosPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
