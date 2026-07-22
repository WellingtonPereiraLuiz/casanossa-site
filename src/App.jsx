import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import PropertiesListing from './pages/PropertiesListing';
import Services from './pages/Services';

import Landlords from './pages/Landlords';
import Evaluation from './pages/Evaluation';
import Tenants from './pages/Tenants';

const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Contact = lazy(() => import('./pages/Contact'));

// Admin imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const PropertiesList = lazy(() => import('./pages/admin/PropertiesList'));
const PropertyForm = lazy(() => import('./pages/admin/PropertyForm'));
const LeadsList = lazy(() => import('./pages/admin/LeadsList'));

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Página não encontrada</h1>
      <a href="/" className="text-marca-primaria font-bold hover:underline">Voltar para a home</a>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Carregando...</div>}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="imoveis" element={<PropertiesListing />} />
            <Route path="imovel/:id" element={<PropertyDetails />} />
            <Route path="servicos" element={<Services />} />
            <Route path="contato" element={<Contact />} />
            <Route path="proprietarios" element={<Landlords />} />
            <Route path="avaliacao" element={<Evaluation />} />
            <Route path="inquilino" element={<Tenants />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Rotas Administrativas */}
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="imoveis" element={<PropertiesList />} />
            <Route path="imoveis/:id" element={<PropertyForm />} />
            <Route path="leads" element={<LeadsList />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
