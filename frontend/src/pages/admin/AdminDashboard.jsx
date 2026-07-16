import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.getStats().then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        ['Tổng người dùng', stats.totalUsers],
        ['Tổng số phòng', stats.totalRooms],
        ['Phòng còn trống', stats.availableRooms],
        ['Tổng đơn đặt', stats.totalBookings],
        ['Đơn chờ xác nhận', stats.pendingBookings],
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Tổng quan</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-6">
            <p className="text-sm text-ink/50 mb-2">{label}</p>
            <p className="text-3xl font-display font-semibold text-teal-700">{value}</p>
          </div>
        ))}
      </div>
      {!stats && <p className="text-ink/50 mt-6">Đang tải số liệu...</p>}
    </div>
  );
}
