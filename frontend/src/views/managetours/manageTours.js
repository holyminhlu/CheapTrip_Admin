import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './manageTours.module.css';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/tours';

function ManageTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      console.log('DATA:', res.data);
      setTours(res.data);
    } catch (err) {
      setError('Lỗi khi tải danh sách tour');
      console.error('API ERROR:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert('Đã xóa tour!');
      navigate('/dashboard/managetours');
    } catch (err) {
      alert('Lỗi khi xóa tour!');
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/managetours/edit/${id}`);
  };

  const handleAdd = () => {
    navigate('/dashboard/managetours/add');
  };

  const handleSelect = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(_id => _id !== id));
  };

  const handleHide = async () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một tour để ẩn!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn ẩn các tour đã chọn không?')) return;
    try {
      await axios.post(`${API_URL}/hide-many`, { ids: selectedIds });
      alert('Đã ẩn các tour thành công!');
      setSelectedIds([]);
      fetchTours();
    } catch (err) {
      alert('Lỗi khi ẩn tour!');
    }
  };

  const filteredTours = filter
    ? tours.filter(t => t.type === filter)
    : tours;
  // Sử dụng luôn filteredTours để hiển thị tất cả tour

  const handleToggleHide = async (id, isHidden) => {
    try {
      await axios.put(`${API_URL}/${id}/toggle-hide`, { isHidden });
      fetchTours();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái ẩn/hiện!');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>QUẢN LÝ TOUR DU LỊCH</h1>
      </div>
      <div className={styles.actionsRow}>
        <div className={styles.actionsLeft}>
          <button className={styles.hideBtn} onClick={handleHide}>Ẩn</button>
        </div>
        <div className={styles.actionsRight}>
          <button className={styles.addBtn} onClick={handleAdd}><FaPlus style={{marginRight: 6}}/>THÊM TOUR</button>
          <div className={styles.filterBox}>
            <span className={styles.filterLabel}><FaFilter style={{marginRight: 4}}/>Filt</span>
            <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="tour_thuong">Tour thường</option>
              <option value="tour_doan">Tour đoàn</option>
            </select>
          </div>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.tourTable}>
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Mã tour</th>
              <th>Tên</th>
              <th>Loại tour</th>
              <th>From</th>
              <th>To</th>
              <th>Slot</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Đang tải...</td></tr>
            ) : error ? (
              <tr><td colSpan={8}>{error}</td></tr>
            ) : filteredTours.length === 0 ? (
              <tr><td colSpan={8}>Không có tour nào</td></tr>
            ) : filteredTours.map(tour => (
              <tr key={tour._id} className={tour.isHidden ? styles.hiddenRow : ''}>
                <td><input type="checkbox" checked={selectedIds.includes(tour._id)} onChange={e => handleSelect(tour._id, e.target.checked)} disabled={tour.isHidden} /></td>
                <td>{tour.tour_id}</td>
                <td>{tour.name}</td>
                <td>{tour.type === 'tour_thuong' ? 'Tour thường' : tour.type === 'tour_doan' ? 'Tour đoàn' : tour.type}</td>
                <td>{tour.departure_location}</td>
                <td>{tour.destination}</td>
                <td>{tour.available_slots}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => handleEdit(tour._id)}><FaEdit /> Chi tiết</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(tour._id)}><FaTrash /> Xóa</button>
                  {tour.isHidden && (
                    <button className={styles.hideBtn} style={{marginLeft: 8, background: '#fffbe6', color: '#faad14', border: '1.5px solid #faad14'}} onClick={() => handleToggleHide(tour._id, false)}>
                      Bỏ ẩn
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageTours; 