import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import PropertiesListing from './pages/PropertiesListing';
import PropertyDetails from './pages/PropertyDetails';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Landlords from './pages/Landlords';
import Evaluation from './pages/Evaluation';
import Tenants from './pages/Tenants';

// Admin imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import PropertiesList from './pages/admin/PropertiesList';
import PropertyForm from './pages/admin/PropertyForm';
import LeadsList from './pages/admin/LeadsList';

function App() {
  return (
    <Router>
      <ScrollToTop />
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
    </Router>
  );
}

export default App;
