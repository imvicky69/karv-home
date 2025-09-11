import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import TenantLayout from './components/layout/TenantLayout';

// Pages
import LoginPage from './pages/LoginPage/LoginPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import TenantHomePage from './pages/TenantHome/TenantHomePage';
import TenantBillsPage from './pages/TenantBills/TenantBillsPage';
import TenantProfilePage from './pages/TenantProfile/TenantProfilePage';

// Protected route logic is handled inline via AppRoutes and role checks


// This component defines the routes and layout for a Tenant
function TenantRoutes() {
  return (
    <Routes>
      <Route element={<TenantLayout />}>
        <Route path="/" element={<TenantHomePage />} />
        <Route path="/bills" element={<TenantBillsPage />} />
        <Route path="/profile" element={<TenantProfilePage />} />
        {/* Redirect any other path to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

// This component defines the routes for an Admin
function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      {/* Redirect any other path to the dashboard */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const { currentUser, role } = useAuth();

  // This is the main router logic
  const AppRoutes = () => {
    if (!currentUser) {
      // If no one is logged in, show the login page
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    }

    // Check the user's role and render the appropriate routes
    if (role === 'admin') {
      return <AdminRoutes />;
    } else if (role === 'tenant') {
      return <TenantRoutes />;
    }

    // Optional: A fallback for when role is not yet determined or invalid
    return <div>Loading...</div>;
  };

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;