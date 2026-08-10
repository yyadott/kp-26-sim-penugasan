import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/ui/navbar';
import { AppRouter } from '@/routes/appRouter';

function AppShell() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {!isLoginPage && <Navbar />}
      <main className="flex-1">
        <AppRouter />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
