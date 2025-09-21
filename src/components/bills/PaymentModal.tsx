import { useState } from 'react';
import axios from 'axios';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { FiX, FiZap } from 'react-icons/fi';
import logo from '../../assets/logo.png';
import { API_CONFIG } from '../../utils/apiConfig';

import type { Bill } from '../../types/bill';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
}

const PaymentModal = ({ isOpen, onClose, bill }: PaymentModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bill) return null;

  const handlePhonePePayment = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Starting payment process for bill:', bill);
    
    try {
      // Get the API URL from our config
      const apiUrl = API_CONFIG.getApiUrl('createPayment');
      console.log('Using payment API URL:', apiUrl);
      
      // Call backend PhonePe payment endpoint
      const response = await axios.post(apiUrl, {
        amount: bill.totalAmount,
        redirectUrl: window.location.origin + '/payment/callback',
        metaInfo: {
          udf1: bill.billId,
          udf2: bill.unitName,
          // udf3: custom field here if needed
        }
      }, API_CONFIG.getAxiosConfig());
      
      console.log('Payment API response:', response.data);
      
      if (response.data.success && response.data.data.redirectUrl) {
        console.log('Payment initiated successfully, redirecting to:', response.data.data.redirectUrl);
        // Store payment information in localStorage for reference
        localStorage.setItem('pendingPayment', JSON.stringify({
          merchantOrderId: response.data.data.merchantOrderId,
          billId: bill.billId,
          amount: bill.totalAmount,
          timestamp: Date.now()
        }));
        window.location.href = response.data.data.redirectUrl;
      } else {
        console.error('Payment initiation response error:', response.data);
        setError('Payment initiation failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Payment error:', err);
      
      // Detailed error logging
      if (typeof err === 'object' && err !== null) {
        if ('response' in err) {
          const axiosError = err as { 
            response?: { 
              data?: Record<string, unknown>, 
              status?: number,
              statusText?: string,
              headers?: Record<string, string>
            },
            request?: unknown,
            message?: string,
            config?: {
              url?: string;
              method?: string;
              [key: string]: unknown;
            }
          };
          
          console.error('API Error Details:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            responseHeaders: axiosError.response?.headers,
            requestURL: axiosError.config?.url,
            requestMethod: axiosError.config?.method
          });
          
          const responseData = axiosError.response?.data as { message?: string, error?: string };
          const errorMessage = responseData?.message || 
                                responseData?.error || 
                                `API Error: ${axiosError.response?.statusText || 'Unknown error'}`;
          setError(errorMessage);
        } else if (err instanceof Error) {
          setError(`Network error: ${err.message}`);
        } else {
          console.error('Unknown error object:', err);
          setError('Payment initiation failed. Please check your connection and try again.');
        }
      } else {
        setError('Payment initiation failed. Unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: 'custom-modal rounded-2xl p-0',
        closeButton: 'hidden',
      }}
    >
      <div className="p-8 max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <img src={logo} alt="KARV Logo" className="w-24" />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="text-text-secondary" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-text-secondary">You are paying for</p>
          <h2 className="text-2xl font-bold text-text-primary">{bill.billId}</h2>
          <p className="text-5xl font-bold text-primary my-4">₹{bill.totalAmount}</p>
        </div>

        <div className="bg-primary/10 p-4 rounded-lg text-sm text-primary my-6">
          You will be securely redirected to PhonePe to complete your payment.
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
        )}

        <button
          onClick={handlePhonePePayment}
          disabled={isLoading}
          className="w-full button-primary flex items-center justify-center"
        >
          <FiZap className="mr-2" />
          {isLoading ? 'Processing...' : 'Proceed to Pay Securely'}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;