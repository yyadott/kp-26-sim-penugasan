import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/ui/navbar';
import { AppRouter } from '@/routes/appRouter';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">
            <AppRouter />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
