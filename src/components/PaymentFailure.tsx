// Payment failure component
const PaymentFailure = () => (
  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
    <h2>❌ Payment Failed</h2>
    <button onClick={() => window.location.href = '/'}>Go to Home</button>
  </div>
);
export default PaymentFailure;
