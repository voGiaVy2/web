import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import Alert from '../../components/Alert';

const statusMeta = {
  PENDING: ['Chờ duyệt', 'bg-amber-100 text-amber-700'],
  CONFIRMED: ['Đã xác nhận', 'bg-teal-100 text-teal-700'],
  CANCELLED: ['Đã hủy', 'bg-red-100 text-red-700'],
  COMPLETED: ['Hoàn tất', 'bg-sandDeep text-ink/70'],
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadBookings = () => {
    setLoading(true);
    bookingService
      .getAllBookings(filter)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Không tải được danh sách đơn.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, [filter]);

  const handleUpdateStatus = async (id, status) => {
    setError('');
    setMessage('');
    try {
      await bookingService.updateBookingStatus(id, status);
      setMessage('Cập nhật trạng thái thành công.');
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold">Duyệt đơn đặt phòng</h1>
        <select className="input-field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="CANCELLED">Đã hủy</option>
          <option value="COMPLETED">Hoàn tất</option>
        </select>
      </div>

      <Alert type="success">{message}</Alert>
      <Alert type="error">{error}</Alert>

      {loading ? (
        <p className="text-ink/50 mt-4">Đang tải...</p>
      ) : bookings.length === 0 ? (
        <p className="text-ink/50 mt-4">Không có đơn đặt phòng nào.</p>
      ) : (
        <div className="overflow-x-auto card mt-4">
          <table className="w-full text-sm">
            <thead className="bg-sandDeep text-left">
              <tr>
                <th className="p-3">Phòng</th>
                <th className="p-3">Người đặt</th>
                <th className="p-3">Ngày nhận → trả</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const [label, cls] = statusMeta[b.status] || statusMeta.PENDING;
                return (
                  <tr key={b.id} className="border-t border-sandDeep align-top">
                    <td className="p-3">
                      <Link to={`/rooms/${b.roomId}`} className="font-medium hover:text-teal-600">
                        {b.room?.title}
                      </Link>
                      <p className="text-xs text-ink/50">{formatPrice(Number(b.room?.price || 0))}/tháng</p>
                    </td>
                    <td className="p-3">
                      <p>{b.user?.name}</p>
                      <p className="text-xs text-ink/50">{b.user?.email}</p>
                    </td>
                    <td className="p-3 text-xs">
                      {new Date(b.fromDate).toLocaleDateString('vi-VN')} → {new Date(b.toDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap">
                      {b.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            className="text-teal-600 hover:underline"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            className="text-red-500 hover:underline"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          className="text-teal-600 hover:underline"
                        >
                          Đánh dấu hoàn tất
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
