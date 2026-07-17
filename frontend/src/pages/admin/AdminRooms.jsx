import { useEffect, useState } from 'react';
import roomService from '../../services/roomService';
import Alert from '../../components/Alert';

const emptyForm = {
  title: '', description: '', price: '', area: '', address: '', district: '',
  city: 'Hồ Chí Minh', maxPeople: 1, categoryId: '', images: '',
};

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRooms = () => {
    setLoading(true);
    roomService.getRooms({ limit: 50 }).then((res) => setRooms(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRooms();
    roomService.getCategories().then((res) => setCategories(res.data));
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const openEdit = (room) => {
    setForm({
      title: room.title,
      description: room.description,
      price: room.price,
      area: room.area,
      address: room.address,
      district: room.district,
      city: room.city,
      maxPeople: room.maxPeople,
      categoryId: room.categoryId,
      images: room.images?.map((i) => i.url).join(', ') || '',
    });
    setEditingId(room.id);
    setShowForm(true);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const payload = {
      ...form,
      price: Number(form.price),
      area: Number(form.area),
      maxPeople: Number(form.maxPeople),
      categoryId: Number(form.categoryId),
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) {
        await roomService.updateRoom(editingId, payload);
        setMessage('Cập nhật phòng thành công.');
      } else {
        await roomService.createRoom(payload);
        setMessage('Tạo phòng thành công.');
      }
      setShowForm(false);
      loadRooms();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.map((x) => x.message).join(' ') ||
        err.response?.data?.message ||
        'Có lỗi xảy ra.';
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa phòng này?')) return;
    try {
      await roomService.deleteRoom(id);
      loadRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Quản lý phòng</h1>
        <button onClick={openCreate} className="btn-primary">+ Thêm phòng</button>
      </div>

      <Alert type="success">{message}</Alert>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 my-6 space-y-3">
          <h2 className="text-xl font-semibold mb-2">{editingId ? 'Sửa phòng' : 'Thêm phòng mới'}</h2>
          <Alert type="error">{error}</Alert>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Tiêu đề" className="input-field" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select required className="input-field" value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Chọn danh mục</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required type="number" placeholder="Giá (VNĐ/tháng)" className="input-field" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input required type="number" placeholder="Diện tích (m²)" className="input-field" value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })} />
            <input required placeholder="Địa chỉ" className="input-field" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input required placeholder="Quận/Huyện" className="input-field" value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <input type="number" placeholder="Số người tối đa" className="input-field" value={form.maxPeople}
              onChange={(e) => setForm({ ...form, maxPeople: e.target.value })} />
            <input placeholder="Thành phố" className="input-field" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <textarea required placeholder="Mô tả" rows="3" className="input-field" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="URL ảnh, cách nhau bằng dấu phẩy" className="input-field" value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editingId ? 'Lưu thay đổi' : 'Tạo phòng'}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-ink/50">Đang tải...</p>
      ) : (
        <div className="space-y-8">
          <RoomsTable
            title="Phòng còn trống"
            rooms={rooms.filter((r) => r.isAvailable)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
          <RoomsTable
            title="Phòng đã được thuê"
            rooms={rooms.filter((r) => !r.isAvailable)}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

function RoomsTable({ title, rooms, onEdit, onDelete }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title} ({rooms.length})</h2>
      {rooms.length === 0 ? (
        <p className="text-ink/50 text-sm">Không có phòng nào.</p>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-sandDeep text-left">
              <tr>
                <th className="p-3">Tiêu đề</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Quận</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-t border-sandDeep">
                  <td className="p-3 font-medium">{room.title}</td>
                  <td className="p-3">{formatPrice(Number(room.price))}</td>
                  <td className="p-3">{room.district}</td>
                  <td className="p-3">
                    <span className={room.isAvailable ? 'text-teal-600' : 'text-red-500'}>
                      {room.isAvailable ? 'Còn trống' : 'Đã thuê'}
                    </span>
                  </td>
                  <td className="p-3 space-x-3">
                    <button onClick={() => onEdit(room)} className="text-teal-600 hover:underline">Sửa</button>
                    <button onClick={() => onDelete(room.id)} className="text-red-500 hover:underline">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
