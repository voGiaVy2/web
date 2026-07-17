import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/rooms', label: 'Quản lý phòng' },
  { to: '/admin/bookings', label: 'Duyệt đơn đặt phòng' },
  { to: '/admin/users', label: 'Quản lý người dùng' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-sand">
      <aside className="w-56 shrink-0 bg-teal-700 text-sand min-h-screen p-6 hidden sm:block">
        <p className="font-display text-xl font-semibold mb-8">Tổ Ấm Admin</p>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-900' : 'hover:bg-teal-600'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/" className="px-3 py-2 rounded-lg text-sm text-sand/70 hover:bg-teal-600 mt-6">
            ← Về trang chính
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
}
