import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';

const statusLabels = {
  PENDING: ['Chờ xác nhận', 'bg-amber-100 text-amber-700'],
  CONFIRMED: ['Đã xác nhận', 'bg-teal-100 text-teal-700'],
  CANCELLED: ['Đã hủy', 'bg-red-100 text-red-700'],
  COMPLETED: ['Hoàn tất', 'bg-sandDeep text-ink/70'],
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getMyBookings().then((res) => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold mb-8">Đơn đặt phòng của tôi</h1>

      {loading ? (
        <p className="text-ink/50">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <p className="text-ink/50">Bạn chưa có đơn đặt phòng nào. <Link to="/rooms" className="text-teal-600 hover:underline">Tìm phòng ngay</Link></p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const [label, cls] = statusLabels[b.status] || statusLabels.PENDING;
            return (
              <div key={b.id} className="card p-4 flex gap-4">
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-sandDeep shrink-0">
                  {b.room?.images?.[0] && (
                    <img src={b.room.images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link to={`/rooms/${b.roomId}`} className="font-semibold hover:text-teal-600">{b.room?.title}</Link>
                  <p className="text-sm text-ink/60">
                    {new Date(b.fromDate).toLocaleDateString('vi-VN')} → {new Date(b.toDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-amber-600 font-medium text-sm">{formatPrice(Number(b.room?.price || 0))}/tháng</p>
                </div>
                <span className={`h-fit px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
