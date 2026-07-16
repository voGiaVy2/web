import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import roomService from '../services/roomService';
import RoomCard from '../components/RoomCard';

const categoryIcons = {
  'Phòng trọ giá rẻ': '🏠',
  'Chung cư mini': '🏢',
  'Căn hộ dịch vụ': '🛎️',
  'Nhà nguyên căn': '🏡',
};

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    roomService.getRooms({ limit: 6, sort: 'newest' }).then((res) => setRooms(res.data)).catch(() => {});
    roomService.getCategories().then((res) => setCategories(res.data)).catch(() => {});
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

      {/* Stats bar */}
      <section className="bg-teal-900 text-sand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            ['500+', 'Phòng đã đăng'],
            ['1,200+', 'Người thuê hài lòng'],
            ['7', 'Khu vực tại TP.HCM'],
            ['24/7', 'Hỗ trợ khách hàng'],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="font-display text-2xl sm:text-3xl font-semibold text-amber-400">{num}</p>
              <p className="text-xs sm:text-sm text-sand/70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Bạn đang tìm loại phòng nào?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/rooms?categoryId=${c.id}`}
              className="card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-3xl block mb-3">{categoryIcons[c.name] || '🔑'}</span>
              <span className="font-medium text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured rooms */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
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

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">Người thuê nói gì?</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            ['Minh Anh', 'Sinh viên Quận 7', 'Tìm được phòng ưng ý chỉ trong một buổi tối, thông tin rõ ràng không như mấy web khác.'],
            ['Hữu Phát', 'Nhân viên văn phòng', 'Đặt lịch xem phòng online tiện lợi, không phải gọi điện qua lại nhiều lần.'],
            ['Thu Trang', 'Chủ trọ Bình Thạnh', 'Đăng tin và quản lý phòng cho thuê dễ dàng, có dashboard theo dõi rõ ràng.'],
          ].map(([name, role, quote]) => (
            <div key={name} className="card p-6">
              <p className="text-ink/70 italic mb-4">"{quote}"</p>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-ink/50">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-amber-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">Sẵn sàng tìm tổ ấm mới?</h2>
          <p className="text-white/80 mb-6">Hàng trăm phòng trọ đang chờ bạn khám phá.</p>
          <Link to="/rooms" className="btn-primary bg-white !text-amber-700 hover:!bg-sand">
            Bắt đầu tìm kiếm
          </Link>
        </div>
      </section>
    </div>
  );
}
