import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import roomService from '../services/roomService';
import RoomCard from '../components/RoomCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';

export default function RoomList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const filters = {
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: Number(searchParams.get('page')) || 1,
  };

  useEffect(() => {
    setLoading(true);
    roomService
      .getRooms({ ...filters, limit: 12 })
      .then((res) => {
        setRooms(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) params[k] = v;
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    handleFilterChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Tìm phòng trọ</h1>
      <div className="mb-8">
        <SearchFilter filters={filters} onChange={handleFilterChange} />
      </div>

      {loading ? (
        <p className="text-ink/50 text-center py-16">Đang tải danh sách phòng...</p>
      ) : rooms.length === 0 ? (
        <p className="text-ink/50 text-center py-16">Không tìm thấy phòng phù hợp với bộ lọc.</p>
      ) : (
        <>
          <p className="text-sm text-ink/50 mb-4">Tìm thấy {pagination.total} phòng</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
