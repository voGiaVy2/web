import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password);
      setSuccess(res.message);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.map((e) => e.message).join(' ') ||
        err.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-2">Tạo tài khoản</h1>
      <p className="text-ink/60 mb-8">Chỉ mất một phút để bắt đầu tìm phòng.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Họ và tên</label>
          <input
            id="name" required className="input-field" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            id="email" type="email" required autoComplete="email" className="input-field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Mật khẩu</label>
          <input
            id="password" type="password" required autoComplete="new-password" className="input-field"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-xs text-ink/50 mt-1">Ít nhất 8 ký tự, gồm chữ và số.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirm">Xác nhận mật khẩu</label>
          <input
            id="confirm" type="password" required autoComplete="new-password" className="input-field"
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-6 text-center">
        Đã có tài khoản? <Link to="/login" className="text-teal-600 font-medium hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
}
