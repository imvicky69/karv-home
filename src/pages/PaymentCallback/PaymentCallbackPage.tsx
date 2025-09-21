import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

const PaymentCallbackPage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract orderId from URL (query or path)
    const params = new URLSearchParams(location.search);
    let oid = params.get('orderid') || params.get('orderId');
    if (!oid) {
      // Try to extract from pathname if not in query
      const match = location.pathname.match(/callback\/?(.*)/);
      if (match && match[1]) {
        oid = match[1];
      }
    }
    setOrderId(oid);
    if (!oid) {
      setStatus('failed');
      setMessage('No orderId found in callback URL.');
      setTimeout(() => navigate('/tenant/bills'), 3000);
      return;
    }

    // Make GET request to payment status endpoint
    const fetchStatus = async () => {
      try {
        const response = await fetch(`https://us-central1-indivio-in.cloudfunctions.net/api/payment/status/${oid}`);
        const data = await response.json();
        // Expecting: { success: true, checkoutUrl, status: 'PENDING' | 'SUCCESS' }
        if (data.success && data.status) {
          if (data.status === 'SUCCESS') {
            setStatus('success');
            setMessage('Your payment was successful!');
          } else if (data.status === 'PENDING') {
            setStatus('loading');
            setMessage('Your payment is still pending. Please wait...');
          } else {
            setStatus('failed');
            setMessage('Payment failed or unknown status.');
          }
        } else {
          setStatus('failed');
          setMessage('Could not verify payment status.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Error checking payment status.');
      } finally {
        setTimeout(() => navigate('/tenant/bills'), 3500);
      }
    };
    fetchStatus();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <FiLoader className="mx-auto text-6xl text-primary animate-spin" />
            <h2 className="text-2xl font-bold mt-6 mb-2">Processing</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="mx-auto text-6xl text-green-500" />
            <h2 className="text-2xl font-bold mt-6 mb-2">Payment Successful!</h2>
          </>
        )}

        {status === 'failed' && (
          <>
            <FiAlertCircle className="mx-auto text-6xl text-red-500" />
            <h2 className="text-2xl font-bold mt-6 mb-2">Payment Failed</h2>
          </>
        )}

        <p className="text-gray-600 mb-6">{message}</p>
        {orderId && (
          <p className="text-xs text-gray-400 mb-2">Order ID: {orderId}</p>
        )}
        <p className="text-sm text-gray-400">
          You will be redirected back to bills in a few seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
