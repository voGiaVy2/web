import { Link } from 'react-router-dom';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function RoomCard({ room }) {
  const image = room.images?.[0]?.url;

  return (
    <Link to={`/rooms/${room.id}`} className="card group block hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-sandDeep overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={room.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30">Chưa có ảnh</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-teal-600 font-medium mb-1">
          {room.category?.name}
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug line-clamp-2 mb-1">{room.title}</h3>
        <p className="text-sm text-ink/60 mb-3">{room.district}, {room.city}</p>
        <div className="flex items-center justify-between">
          <span className="text-amber-600 font-semibold">{formatPrice(Number(room.price))}<span className="text-xs text-ink/50">/tháng</span></span>
          <span className="text-xs text-ink/50">{room.area} m²</span>
        </div>
      </div>
    </Link>
  );
}
