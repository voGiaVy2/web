import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-sand/90 backdrop-blur border-b border-sandDeep">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold text-teal-700 tracking-tight">
          Tổ Ấm
        </Link>

        <button
          className="sm:hidden p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label="Mở menu"
          aria-expanded={open}
        >
          <span className="block w-6 h-0.5 bg-ink mb-1.5" />
          <span className="block w-6 h-0.5 bg-ink mb-1.5" />
          <span className="block w-6 h-0.5 bg-ink" />
        </button>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
          <Link to="/rooms" className="hover:text-teal-600 transition-colors">Tìm phòng</Link>
          {user && <Link to="/bookings" className="hover:text-teal-600 transition-colors">Đơn của tôi</Link>}
          {isAdmin && <Link to="/admin" className="hover:text-teal-600 transition-colors">Quản trị</Link>}
          {!user ? (
            <>
              <Link to="/login" className="hover:text-teal-600 transition-colors">Đăng nhập</Link>
              <Link to="/register" className="btn-primary !py-2 !px-5">Đăng ký</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-ink/70">Xin chào, {user.name}</span>
              <button onClick={handleLogout} className="btn-secondary !py-2 !px-5">Đăng xuất</button>
            </div>
          )}
        </div>
      </nav>

      {open && (
        <div className="sm:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium border-t border-sandDeep">
          <Link to="/rooms" onClick={() => setOpen(false)}>Tìm phòng</Link>
          {user && <Link to="/bookings" onClick={() => setOpen(false)}>Đơn của tôi</Link>}
          {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Quản trị</Link>}
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Đăng nhập</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Đăng ký</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="text-left">Đăng xuất</button>
          )}
        </div>
      )}
    </header>
  );
}
