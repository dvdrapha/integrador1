import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EPIs } from './pages/EPIs';
import { Estoque } from './pages/Estoque';
import { Funcionarios } from './pages/Funcionarios';
import { EPIsUso } from './pages/EPIsUso';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/epis" element={<EPIs />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/epis-uso" element={<EPIsUso />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
