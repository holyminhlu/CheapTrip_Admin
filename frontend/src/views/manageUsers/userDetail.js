import React, { useState, useEffect } from 'react';
import styles from './manageUsers.module.css';
import { FaBan } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BOOKINGS = 'http://localhost:5002/api/bookings';
const API_TOURS = 'http://localhost:5000/api/tours';

function UserDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = state?.user;
  const [disabled, setDisabled] = useState(user?.status === 'disabled');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tours, setTours] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BOOKINGS);
        const data = await res.json();
        // Lọc booking theo email user
        setBookings(data.filter(b => b.email === user.email));
      } catch (err) {
        setError('Lỗi khi tải booking');
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  useEffect(() => {
    // Fetch danh sách tour
    fetch(API_TOURS)
      .then(res => res.json())
      .then(data => setTours(data))
      .catch(() => setTours([]));
  }, []);

  // Map tour_id -> name
  const tourIdToName = {};
  tours.forEach(t => { tourIdToName[t.tour_id] = t.name; });

  if (!user) {
    return <div className={styles.container}><h2>Không tìm thấy tài khoản</h2></div>;
  }

  // Tách booking đã thanh toán/chưa thanh toán
  const paidTours = bookings.filter(t => (t.payment_status || '').trim().toLowerCase() === 'đã thanh toán');
  const unpaidTours = bookings.filter(t => (t.payment_status || '').trim().toLowerCase() !== 'đã thanh toán');
  const totalSpent = paidTours.reduce((sum, t) => sum + (t.total_amount || t.price || 0), 0);

  const handleDisable = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?')) return;
    try {
      const res = await fetch(`http://localhost:5003/api/users/${user._id}/disable`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setDisabled(true);
        alert('Đã vô hiệu hóa tài khoản và gửi mail cho người dùng!');
      } else {
        alert('Có lỗi xảy ra: ' + (data.error || ''));}
    } catch (err) {
      alert('Lỗi khi gửi yêu cầu đến server!');
    }
  };

  const handleEnable = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ vô hiệu hóa tài khoản này?')) return;
    try {
      const res = await fetch(`http://localhost:5003/api/users/${user._id}/enable`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setDisabled(false);
        alert('Đã gỡ vô hiệu hóa tài khoản và gửi mail cho người dùng!');
      } else {
        alert('Có lỗi xảy ra: ' + (data.error || ''));}
    } catch (err) {
      alert('Lỗi khi gửi yêu cầu đến server!');
    }
  };

  return (
    <div className={styles.container}>
      <h1>CHI TIẾT TÀI KHOẢN</h1>
      <div className={styles.infoGrid}>
        <div className={styles.infoColLeft}>
          <p><b>Tên đăng nhập:</b> {user.fullName || user.username}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Ngày tạo:</b> {user.createdAt ? new Date(user.createdAt).toISOString().slice(0,10) : ''}</p>
        </div>
        <div className={styles.infoColRight}>
          <p><b>Số tour đã book:</b> {bookings.length}</p>
          <p><b>Tổng chi tiêu:</b> {totalSpent.toLocaleString()} VNĐ</p>
        </div>
      </div>
      <div className={styles.tourTables}>
        {loading ? <div>Đang tải booking...</div> : error ? <div>{error}</div> : <>
        <div style={{margin: '0 0 32px 0'}}>
          <b>Tour đã thanh toán:</b>
          <table className={styles.tourTable}>
            <thead>
              <tr>
                <th>Mã tour</th>
                <th>Tên tour</th>
                <th>Loại tour</th>
                <th>Người lớn</th>
                <th>Trẻ em</th>
                <th>Giá tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {paidTours.length === 0 ? (
                <tr><td colSpan={7}>Không có</td></tr>
              ) : paidTours.map(t => (
                <tr key={t._id}>
                  <td>{t.tour_id}</td>
                  <td>{tourIdToName[t.tour_id] || t.tour_id}</td>
                  <td>{t.booking_type === 'tour_thuong' ? 'Tour thường' : 'Tour đoàn'}</td>
                  <td>{t.adult}</td>
                  <td>{t.children}</td>
                  <td>{(t.total_amount || t.price || 0).toLocaleString()} VNĐ</td>
                  <td>{t.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <b>Tour chưa thanh toán:</b>
          <table className={styles.tourTable}>
            <thead>
              <tr>
                <th>Mã tour</th>
                <th>Tên tour</th>
                <th>Loại tour</th>
                <th>Người lớn</th>
                <th>Trẻ em</th>
                <th>Giá tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {unpaidTours.length === 0 ? (
                <tr><td colSpan={7}>Không có</td></tr>
              ) : unpaidTours.map(t => (
                <tr key={t._id}>
                  <td>{t.tour_id}</td>
                  <td>{tourIdToName[t.tour_id] || t.tour_id}</td>
                  <td>{t.booking_type === 'tour_thuong' ? 'Tour thường' : 'Tour đoàn'}</td>
                  <td>{t.adult}</td>
                  <td>{t.children}</td>
                  <td>{(t.total_amount || t.price || 0).toLocaleString()} VNĐ</td>
                  <td>{t.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>}
      </div>
      <div className={styles.buttonRow}>
        {disabled ? (
          <button className={styles.disableBtn} onClick={handleEnable} style={{width: 180}}>
            Gỡ vô hiệu hóa
          </button>
        ) : (
          <button className={styles.disableBtn} onClick={handleDisable} style={{width: 180}}>
            <FaBan style={{marginRight: 6}}/> Vô hiệu hóa
          </button>
        )}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    </div>
  );
}

export default UserDetail; 