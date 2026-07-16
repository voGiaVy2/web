import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    adminService.getUsers().then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleRoleChange = async (id, role) => {
    await adminService.updateUserRole(id, role);
    loadUsers();
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Quản lý người dùng</h1>
      {loading ? (
        <p className="text-ink/50">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="bg-sandDeep text-left">
              <tr>
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Email xác thực</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-sandDeep">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.isEmailVerified ? '✅' : '—'}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="input-field !py-1.5"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
