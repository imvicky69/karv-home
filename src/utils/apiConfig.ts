// Minimal API config placeholder used by PaymentModal
type PhonePeEndpoints = Record<string, string>;

interface ApiConfig {
  phonepe?: PhonePeEndpoints;
  getApiUrl: (endpoint: string) => string;
  getAxiosConfig: () => { headers: Record<string, string> };
}

export const API_CONFIG: ApiConfig = {
  getApiUrl: () => '',
  getAxiosConfig: () => ({ headers: { 'Content-Type': 'application/json' } })
};

export default API_CONFIG;
