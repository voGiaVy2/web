import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import Alert from '../components/Alert';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Thiếu token xác thực.');
      return;
    }
    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Xác thực thất bại.');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold mb-4">Xác thực email</h1>
      {status === 'loading' && <p className="text-ink/60">Đang xác thực...</p>}
      {status === 'success' && <Alert type="success">{message}</Alert>}
      {status === 'error' && <Alert type="error">{message}</Alert>}
      <Link to="/login" className="btn-primary mt-6 inline-flex">Đến trang đăng nhập</Link>
    </div>
  );
}
