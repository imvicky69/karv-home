// Payment success component
const PaymentSuccess = () => (
  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
    <h2>✅ Payment Successful!</h2>
    <button onClick={() => window.location.href = '/'}>Go to Home</button>
  </div>
);
export default PaymentSuccess;
