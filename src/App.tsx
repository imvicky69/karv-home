import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
// import PaymentCallbackPage from './pages/PaymentCallback/PaymentCallbackPage';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import TenantLayout from './components/layout/TenantLayout';

// Pages
import LoginPage from './pages/LoginPage/LoginPage';
import TenantHomePage from './pages/TenantHome/TenantHomePage';
import TenantBillsPage from './pages/TenantBills/TenantBillsPage';
import TenantProfilePage from './pages/TenantProfile/TenantProfilePage';

function TenantRoutes() {
  return (
    <Routes>
      <Route element={<TenantLayout />}>
        <Route path="/" element={<TenantHomePage />} />
        <Route path="/bills" element={<TenantBillsPage />} />
        <Route path="/profile" element={<TenantProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

function App() {
  const { currentUser } = useAuth();

  const AppRoutes = () => {
    if (!currentUser) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );
    }
    // Only tenant routes
    return <TenantRoutes />;
  };

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
      <Routes>
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        {/* <Route path="/payment/callback" element={<PaymentCallbackPage />} /> */}
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;