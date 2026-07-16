import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Alert from '../components/Alert';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Liên kết không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword(token, form.password);
      setSuccess(res.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">Đặt lại mật khẩu</h1>
      <p className="text-ink/60 mb-8">Tạo mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Mật khẩu mới</label>
          <input
            id="password" type="password" required className="input-field" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirm">Xác nhận mật khẩu mới</label>
          <input
            id="confirm" type="password" required className="input-field" value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        <Link to="/login" className="text-teal-600 font-medium hover:underline">← Quay lại đăng nhập</Link>
      </p>
    </div>
  );
}
