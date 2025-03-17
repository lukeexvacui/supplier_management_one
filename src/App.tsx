import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SupplierList } from './pages/SupplierList';
import { SupplierProfile } from './pages/SupplierProfile';
import { EvaluationForm } from './pages/EvaluationForm';
import { EvaluationHistory } from './pages/EvaluationHistory';
import { ImportData } from './pages/ImportData';
import { SupplierMetrics } from './pages/SupplierMetrics';
import { NonConformityManagement } from './pages/NonConformityManagement';
import { useStore } from './store';

function App() {
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
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/suppliers/:supplierId" element={<SupplierProfile />} />
          <Route path="/evaluate/:supplierId" element={<EvaluationForm />} />
          <Route path="/history" element={<EvaluationHistory />} />
          <Route path="/import" element={<ImportData />} />
          <Route path="/metrics" element={<SupplierMetrics />} />
          <Route path="/non-conformities" element={<NonConformityManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;