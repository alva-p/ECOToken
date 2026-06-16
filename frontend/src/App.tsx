/**
 * Layout raíz. A medida que avancen los sprints se monta el router (routes/index.tsx)
 * envuelto por los providers (Auth, Query). Ver doc/ESTRUCTURA-PROYECTO.md §5.
 */
function App() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">ECOToken — Sprint 0</h1>
    </main>
  );
}

export default App;
