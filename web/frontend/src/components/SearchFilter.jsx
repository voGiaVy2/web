import { useState, useEffect } from 'react';
import roomService from '../services/roomService';

export default function SearchFilter({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    roomService.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => setLocal(filters), [filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange({ ...local, page: 1 });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
      <input
        className="input-field lg:col-span-2"
        placeholder="Tìm theo tên, địa chỉ..."
        value={local.search || ''}
        onChange={(e) => setLocal({ ...local, search: e.target.value })}
      />
      <select
        className="input-field"
        value={local.categoryId || ''}
        onChange={(e) => setLocal({ ...local, categoryId: e.target.value })}
      >
        <option value="">Tất cả loại phòng</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        className="input-field"
        placeholder="Giá từ (VNĐ)"
        value={local.minPrice || ''}
        onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
      />
      <input
        type="number"
        min="0"
        className="input-field"
        placeholder="Giá đến (VNĐ)"
        value={local.maxPrice || ''}
        onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
      />
      <button type="submit" className="btn-primary">Tìm kiếm</button>
    </form>
  );
}
