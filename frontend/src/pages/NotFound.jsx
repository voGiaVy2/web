import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-display text-7xl text-teal-700 mb-4">404</p>
      <h1 className="text-2xl font-semibold mb-2">Không tìm thấy trang</h1>
      <p className="text-ink/60 mb-8">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="btn-primary">Về trang chủ</Link>
    </div>
  );
}
