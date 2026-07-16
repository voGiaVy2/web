import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import roomService from '../services/roomService';
import RoomCard from '../components/RoomCard';

export default function Home() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    roomService.getRooms({ limit: 6, sort: 'newest' }).then((res) => setRooms(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-teal-700 text-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-widest text-amber-400 text-xs font-semibold mb-4">
              Tìm phòng trọ · Nhanh · Minh bạch
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-6">
              Một mái nhà mới,<br />chỉ vài cú nhấp chuột.
            </h1>
            <p className="text-sand/80 mb-8 max-w-md">
              Tổ Ấm giúp bạn tìm phòng trọ, chung cư mini, căn hộ dịch vụ phù hợp túi tiền —
              xem chi tiết, đặt lịch xem phòng, tất cả trong một nơi.
            </p>
            <div className="flex gap-4">
              <Link to="/rooms" className="btn-primary bg-amber-600 hover:bg-amber-500">
                Tìm phòng ngay
              </Link>
              <Link to="/register" className="btn-secondary !border-sand !text-sand hover:!bg-teal-600">
                Tạo tài khoản
              </Link>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="aspect-square rounded-xl2 bg-teal-600/40 border border-sand/10 flex items-center justify-center">
              <span className="font-display text-8xl text-amber-400">Tổ Ấm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">Phòng mới đăng</h2>
          <Link to="/rooms" className="text-teal-600 font-medium hover:underline">Xem tất cả →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-white border-y border-sandDeep">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-3 gap-8">
          {[
            ['Minh bạch giá', 'Giá thuê, diện tích, vị trí rõ ràng — không phí ẩn.'],
            ['Xác thực tin đăng', 'Mỗi phòng đều được kiểm duyệt trước khi hiển thị.'],
            ['Bảo mật tài khoản', 'Mật khẩu mã hoá, xác thực email, đăng nhập an toàn.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <h3 className="font-display text-xl font-semibold mb-2 text-teal-700">{title}</h3>
              <p className="text-ink/60 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
