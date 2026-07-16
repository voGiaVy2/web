import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';
import bookingService from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fromDate: '', toDate: '', note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    roomService.getRoomById(id).then((res) => setRoom(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/rooms/${id}` } } });
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookingService.createBooking({ roomId: Number(id), ...form });
      setMessage(res.message);
      setForm({ fromDate: '', toDate: '', note: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt phòng thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-24 text-ink/50">Đang tải...</p>;
  if (!room) return <p className="text-center py-24 text-ink/50">Không tìm thấy phòng.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <div className="aspect-video rounded-xl2 overflow-hidden bg-sandDeep mb-3">
          {room.images?.[activeImage] ? (
            <img src={room.images[activeImage].url} alt={room.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30">Chưa có ảnh</div>
          )}
        </div>
        {room.images?.length > 1 && (
          <div className="flex gap-2 mb-8">
            {room.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-14 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-teal-600' : 'border-transparent'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="text-xs uppercase tracking-wide text-teal-600 font-medium mb-1">{room.category?.name}</p>
        <h1 className="text-3xl font-semibold mb-2">{room.title}</h1>
        <p className="text-ink/60 mb-6">{room.address}, {room.district}, {room.city}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 text-center">
            <p className="text-xs text-ink/50">Diện tích</p>
            <p className="font-semibold">{room.area} m²</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-ink/50">Tối đa</p>
            <p className="font-semibold">{room.maxPeople} người</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-ink/50">Trạng thái</p>
            <p className={`font-semibold ${room.isAvailable ? 'text-teal-600' : 'text-red-500'}`}>
              {room.isAvailable ? 'Còn trống' : 'Đã cho thuê'}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
        <p className="text-ink/70 leading-relaxed whitespace-pre-line">{room.description}</p>
      </div>

      <aside>
        <div className="card p-6 sticky top-24">
          <p className="text-2xl font-semibold text-amber-600 mb-1">
            {formatPrice(Number(room.price))}<span className="text-sm text-ink/50">/tháng</span>
          </p>
          <p className="text-sm text-ink/50 mb-6">Đặt lịch xem phòng miễn phí</p>

          <form onSubmit={handleBooking} className="space-y-3">
            <Alert type="error">{error}</Alert>
            <Alert type="success">{message}</Alert>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày nhận phòng</label>
              <input
                type="date" required className="input-field" value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ngày trả phòng (dự kiến)</label>
              <input
                type="date" required className="input-field" value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                className="input-field" rows="3" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <button type="submit" disabled={submitting || !room.isAvailable} className="btn-primary w-full">
              {!room.isAvailable ? 'Phòng đã cho thuê' : submitting ? 'Đang gửi...' : 'Đặt lịch xem phòng'}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
