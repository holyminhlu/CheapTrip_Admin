import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './manageBooking.module.css';
import { FaEye, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// XÓA generateFakeBookings và dữ liệu ảo

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'canceled', label: 'Đã hủy' },
];

function ManageBooking() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state cho ô tìm kiếm
  const bookingsPerPage = 20;

  useEffect(() => {
    axios.get('http://localhost:5002/api/bookings-with-username')
      .then(res => {
        console.log('Bookings from backend:', res.data); // Thêm dòng này để debug
        setBookings(res.data)
      })
      .catch(() => setBookings([]));
  }, []);

  // Lọc bookings theo searchTerm, hỗ trợ tìm kiếm theo ngày đặt (dd/mm/yyyy hoặc dd/mm/yyyy HH:mm:ss)
  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase().replace(/\s+/g, ' ').trim();
    return Object.entries(booking).some(([key, val]) => {
      if (!val) return false;
      if (key === 'time_booking' || key === 'departure_date') {
        const date = new Date(val);
        // Định dạng dd/mm/yyyy
        const dmy = date.toLocaleDateString('vi-VN');
        // Định dạng HH:mm:ss dd/mm/yyyy
        const hmsdmy = date.toLocaleTimeString('vi-VN') + ' ' + date.toLocaleDateString('vi-VN');
        // Loại bỏ khoảng trắng thừa để so khớp dễ hơn
        const dmyNorm = dmy.replace(/\s+/g, ' ').trim();
        const hmsdmyNorm = hmsdmy.replace(/\s+/g, ' ').trim();
        return dmyNorm.toLowerCase().includes(lower) || hmsdmyNorm.toLowerCase().includes(lower);
      }
      // Tìm kiếm theo số tiền đã format
      if (key === 'total_amount' || key === 'unit_price') {
        const raw = val.toString();
        const formatted = val.toLocaleString('vi-VN') + ' VNĐ';
        return raw.includes(lower.replace(/\D/g, '')) || formatted.toLowerCase().includes(lower);
      }
      // Tìm kiếm theo trạng thái đơn (label tiếng Việt)
      if (key === 'status') {
        const statusLabel = (statusOptions.find(opt => opt.value === val)?.label || val).toLowerCase();
        return statusLabel.includes(lower);
      }
      // Tìm kiếm theo trạng thái thanh toán (label tiếng Việt)
      if (key === 'payment_status') {
        // Map các trạng thái tiếng Việt có thể xuất hiện
        const paymentMap = {
          'đã thanh toán': 'đã thanh toán',
          'chưa thanh toán': 'chưa thanh toán'
        };
        const label = paymentMap[val.toLowerCase()] || val.toLowerCase();
        return label.includes(lower);
      }
      return val.toString().toLowerCase().includes(lower);
    });
  });

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

  // Sửa lại: Khi xác nhận thanh toán thì cập nhật cả trạng thái đơn và trạng thái thanh toán
  const handleConfirmPayment = (id) => {
    axios.put(`http://localhost:5002/api/bookings/${id}`, { payment_status: 'đã thanh toán', status: 'confirmed' })
      .then(res => {
        setBookings(bookings => bookings.map(b => b._id === id ? { ...b, payment_status: 'đã thanh toán', status: 'confirmed' } : b));
        alert('Đã xác nhận thanh toán!');
      })
      .catch(() => alert('Cập nhật thất bại!'));
  };

  // Khi hủy đơn thì cập nhật trạng thái đơn và trạng thái thanh toán về chưa thanh toán
  const handleCancel = (id) => {
    axios.put(`http://localhost:5002/api/bookings/${id}`, { status: 'canceled', payment_status: 'chưa thanh toán' })
      .then(res => {
        setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'canceled', payment_status: 'chưa thanh toán' } : b));
        alert('Đã hủy đơn!');
      })
      .catch(() => alert('Cập nhật thất bại!'));
  };

  // Thêm hàm xử lý hoàn tiền
  const handleRefund = (id) => {
    axios.put(`http://localhost:5002/api/bookings/${id}/refund`)
      .then(res => {
        setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'refunded', payment_status: 'đã hoàn tiền' } : b));
        alert('Đã hoàn tiền cho đơn này!');
      })
      .catch(() => alert('Hoàn tiền thất bại!'));
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://localhost:5002/api/bookings/${id}`, { status: newStatus })
      .then(res => {
        setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
        alert('Đã cập nhật trạng thái đơn!');
      })
      .catch(() => alert('Cập nhật thất bại!'));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Hàm xuất Excel chỉ các booking đã thanh toán
  const exportToExcel = () => {
    const paidBookings = bookings.filter(b => (b.payment_status || '').toLowerCase().trim() === 'đã thanh toán');
    const data = paidBookings.map(b => ({
      'Mã đơn': b.booking_id,
      'Email': b.email,
      'Tên người dùng': b.username,
      'Số điện thoại': b.phone,
      'Mã tour': b.tour_id,
      'Loại tour': b.booking_type === 'tour_thuong' ? 'Tour thường' : 'Tour đoàn',
      'Người lớn': b.adult,
      'Trẻ em': b.children,
      'Giá tiền': b.total_amount,
      'Trạng thái đơn': b.status,
      'Ngày đặt': b.time_booking ? new Date(b.time_booking).toLocaleString() : ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đã thanh toán');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'don_dat_tour_da_thanh_toan.xlsx');
  };

  return (
    <div className={styles.container}>
      <h1>QUẢN LÝ ĐƠN ĐẶT TOUR</h1>
      <button onClick={exportToExcel} style={{marginBottom: 16, background: '#1bc6e8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer'}}>Xuất Excel</button>
      {/* Thêm ô tìm kiếm */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          style={{ padding: 8, width: 300, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.bookingTable}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th className={styles.emailColumn}>Email</th>
              <th>Tên người dùng</th>
              <th>Số điện thoại</th>
              <th>Mã tour</th>
              <th>Loại tour</th>
              <th>Người lớn</th>
              <th>Trẻ em</th>
              <th>Giá tiền</th>
              <th>Trạng thái đơn</th>
              <th>Trạng thái thanh toán</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.length === 0 ? (
              <tr><td colSpan={12}>Không có đơn đặt tour nào</td></tr>
            ) : paginatedBookings.map(booking => (
              <tr key={booking._id} className={booking.status === 'canceled' ? styles.disabledRow : ''}>
                <td>{booking.booking_id}</td>
                <td className={styles.emailColumn}>{booking.email}</td>
                <td>{booking.username || '---'}</td>
                <td>{booking.phone || '---'}</td>
                <td>{booking.tour_id}</td>
                <td>{booking.booking_type === 'tour_thuong' ? 'Tour thường' : 'Tour đoàn'}</td>
                <td>{booking.adult}</td>
                <td>{booking.children}</td>
                <td>{booking.total_amount ? booking.total_amount.toLocaleString() : ''} VNĐ</td>
                <td>
                  {/* Hiển thị trạng thái đơn dạng text thay vì select box */}
                  {statusOptions.find(opt => opt.value === booking.status)?.label || booking.status}
                </td>
                <td>{booking.payment_status}</td>
                <td>{booking.time_booking ? new Date(booking.time_booking).toLocaleString() : ''}</td>
                <td>
                  {/* Nút xác nhận chỉ hiển thị khi trạng thái đơn là 'pending' VÀ trạng thái thanh toán là 'chưa thanh toán' */}
                  {booking.status === 'pending' && (
                    <button className={styles.confirmBtn} onClick={() => handleConfirmPayment(booking._id)} title="Xác nhận thanh toán"><FaCheck /></button>
                  )}
                  {booking.status !== 'canceled' && booking.status !== 'refunded' && (
                    <button className={styles.cancelBtn} onClick={() => handleCancel(booking._id)} title="Hủy đơn"><FaTimes /></button>
                  )}
                  {/* Nút hoàn tiền: chỉ hiển thị khi đã thanh toán, chưa hoàn tiền, chưa bị hủy */}
                  {(booking.payment_status || '').toLowerCase().trim() === 'đã thanh toán' && booking.status !== 'canceled' && booking.status !== 'refunded' && (
                    <button className={styles.refundBtn} onClick={() => handleRefund(booking._id)} title="Hoàn tiền"><FaUndo /></button>
                  )}
                  <button className={styles.detailBtn} onClick={() => handleViewDetail(booking)} title="Xem chi tiết"><FaEye /></button>
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
      {showDetail && selectedBooking && (
        <div className={styles.detailModal}>
          <div className={styles.detailContent}>
            <h2>Chi tiết đơn đặt tour</h2>
            <p><b>Mã đơn:</b> {selectedBooking.booking_id}</p>
            <p><b>Email:</b> {selectedBooking.email}</p>
            <p><b>Mã tour:</b> {selectedBooking.tour_id}</p>
            <p><b>Loại tour:</b> {selectedBooking.booking_type === 'tour_thuong' ? 'Tour thường' : 'Tour đoàn'}</p>
            <p><b>Người lớn:</b> {selectedBooking.adult}</p>
            <p><b>Trẻ em:</b> {selectedBooking.children}</p>
            <p><b>Giá tiền:</b> {selectedBooking.total_amount ? selectedBooking.total_amount.toLocaleString() : ''} VNĐ</p>
            <p><b>Trạng thái đơn:</b> {selectedBooking.status}</p>
            <p><b>Trạng thái thanh toán:</b> {selectedBooking.payment_status}</p>
            <p><b>Ngày đặt:</b> {selectedBooking.time_booking ? new Date(selectedBooking.time_booking).toLocaleString() : ''}</p>
            <p><b>Ghi chú:</b> {selectedBooking.note}</p>
            <button onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBooking; 