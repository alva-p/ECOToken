import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';

/**
 * Definición de rutas. A medida que avancen los sprints se agregan las rutas por
 * actor envueltas en <ProtectedRoute roles={[...]}> y sus layouts.
 * Ver doc/ESTRUCTURA-PROYECTO.md §5. STUB inicial.
 */
export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  // { path: '/empresa', element: <ProtectedRoute roles={['EMPRESA']}><EmpresaLayout/></ProtectedRoute>, children: [...] },
  // { path: '/cooperativa', element: <ProtectedRoute roles={['COOPERATIVA']}>...</ProtectedRoute> },
  // { path: '/admin', element: <ProtectedRoute roles={['ADMIN']}>...</ProtectedRoute> },
]);
