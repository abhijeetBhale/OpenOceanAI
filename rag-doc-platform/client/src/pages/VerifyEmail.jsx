import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Email Verification</h2>

        {loading && <p className="loading">Verifying your email...</p>}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
