import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getStats().then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        ['Tổng người dùng', stats.totalUsers, '/admin/users'],
        ['Tổng số phòng', stats.totalRooms, '/admin/rooms'],
        ['Phòng còn trống', stats.availableRooms, '/admin/rooms'],
        ['Tổng đơn đặt', stats.totalBookings, '/admin/bookings'],
        ['Đơn chờ duyệt', stats.pendingBookings, '/admin/bookings'],
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Tổng quan</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([label, value, to]) => (
          <Link key={label} to={to} className="card p-6 block hover:shadow-md transition-shadow">
            <p className="text-sm text-ink/50 mb-2">{label}</p>
            <p className="text-3xl font-display font-semibold text-teal-700">{value}</p>
            {label === 'Đơn chờ duyệt' && Number(value) > 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">→ Bấm để duyệt ngay</p>
            )}
          </Link>
        ))}
      </div>
      {!stats && <p className="text-ink/50 mt-6">Đang tải số liệu...</p>}
    </div>
  );
}
