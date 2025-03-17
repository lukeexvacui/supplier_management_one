import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SupplierList } from './pages/SupplierList';
import { SupplierProfile } from './pages/SupplierProfile';
import { EvaluationForm } from './pages/EvaluationForm';
import { EvaluationHistory } from './pages/EvaluationHistory';
import { ImportData } from './pages/ImportData';
import { SupplierMetrics } from './pages/SupplierMetrics';
import { NonConformityManagement } from './pages/NonConformityManagement';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useStore } from './store';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { loadInitialData } = useStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadInitialData();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    initializeApp();
  }, [loadInitialData]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <PrivateRoute>
            <Layout>
              <SupplierList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/suppliers/:supplierId"
        element={
          <PrivateRoute>
            <Layout>
              <SupplierProfile />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluate/:supplierId"
        element={
          <PrivateRoute>
            <Layout>
              <EvaluationForm />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <Layout>
              <EvaluationHistory />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/import"
        element={
          <PrivateRoute>
            <Layout>
              <ImportData />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/metrics"
        element={
          <PrivateRoute>
            <Layout>
              <SupplierMetrics />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/non-conformities"
        element={
          <PrivateRoute>
            <Layout>
              <NonConformityManagement />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;