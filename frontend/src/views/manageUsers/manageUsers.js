import React, { useState, useEffect } from 'react';
import styles from './manageUsers.module.css';
import { FaEye, FaBan } from 'react-icons/fa';
// XÓA: import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5003/api/users';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;
  // XÓA: const navigate = useNavigate();
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError('Lỗi khi tải danh sách người dùng');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    fetch('http://localhost:5002/api/bookings-with-username')
      .then(res => res.json())
      .then(data => {
        const bookings = data.filter(b => b.email === selectedUser.email);
        setUserBookings(bookings);
      });
  }, [selectedUser]);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  // SỬA: Khi bấm xem chi tiết thì set selectedUser để hiện popup
  const handleViewDetail = (user) => {
    setSelectedUser(user);
  };

  const handleDisable = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?')) return;
    await fetch(`http://localhost:5003/api/users/${userId}/disable`, { method: 'PATCH' });
    // Backend sẽ tự động gửi mail!
  };

  // Thêm hàm enable user
  const handleEnable = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ vô hiệu hóa tài khoản này?')) return;
    await fetch(`http://localhost:5003/api/users/${userId}/enable`, { method: 'PATCH' });
    // Backend sẽ tự động gửi mail!
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Hàm tính tổng số tour đã book và tổng chi tiêu
  const getUserStats = (user) => {
    const bookedTours = userBookings.length;
    const totalSpent = userBookings
      .filter(b => (b.payment_status || '').toLowerCase() === 'đã thanh toán')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    return {
      bookedTours,
      totalSpent: totalSpent ? totalSpent.toLocaleString() + ' VNĐ' : '0 VNĐ',
    };
  };

  return (
    <div className={styles.container}>
      <h1>QUẢN LÝ NGƯỜI DÙNG</h1>
      <div className={styles.tableWrapper}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan={5}>{error}</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr><td colSpan={5}>Không có tài khoản nào</td></tr>
            ) : paginatedUsers.map(user => (
              <tr key={user._id} className={user.status === 'disabled' ? styles.disabledRow : ''}>
                <td>{user.fullName || user.username}</td>
                <td>{user.email}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toISOString().slice(0,10) : ''}</td>
                <td>{user.status === 'active' ? 'Hoạt động' : 'Đã vô hiệu hóa'}</td>
                <td>
                  <button className={styles.detailBtn} onClick={() => handleViewDetail(user)}><FaEye /> Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&laquo; Trước</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? styles.activePage : ''}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &raquo;</button>
          </div>
        )}
      </div>
      {/* Popup modal chi tiết user */}
      {selectedUser && (
        <div className={styles.detailModal}>
          <div className={styles.detailContent}>
            <h2>Chi tiết tài khoản</h2>
            <p><b>Tên đăng nhập:</b> {selectedUser.fullName || selectedUser.username}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Số điện thoại:</b> {selectedUser.phone || '---'}</p>
            <p><b>Ngày tạo:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toISOString().slice(0,10) : ''}</p>
            <p><b>Trạng thái:</b> {selectedUser.status === 'active' ? 'Hoạt động' : 'Đã vô hiệu hóa'}</p>
            <p><b>Số tour đã book:</b> {getUserStats(selectedUser).bookedTours}</p>
            <p><b>Tổng chi tiêu:</b> {getUserStats(selectedUser).totalSpent}</p>
            <div style={{display: 'flex', gap: 12, width: '100%', justifyContent: 'center'}}>
              {selectedUser.status === 'disabled' ? (
                <button className={styles.disableBtn} onClick={async () => {
                  await handleEnable(selectedUser._id);
                  setSelectedUser(null);
                }}>Gỡ vô hiệu hóa</button>
              ) : (
                <button className={styles.disableBtn} onClick={async () => {
                  await handleDisable(selectedUser._id);
                  setSelectedUser(null);
                }}>Vô hiệu hóa</button>
              )}
              <button onClick={() => setSelectedUser(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers; 