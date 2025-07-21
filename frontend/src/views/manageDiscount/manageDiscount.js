import React, { useState, useEffect } from 'react';
import styles from './manageDiscount.module.css';

// Giả lập danh sách tour (sau này lấy từ API)
const mockTours = [
  { tour_id: 'T001', name: 'Tour Đà Nẵng' },
  { tour_id: 'T002', name: 'Tour Nha Trang' },
  { tour_id: 'T003', name: 'Tour Phú Quốc' },
  { tour_id: 'T004', name: 'Tour Sapa' },
];
// Giả lập danh sách khuyến mãi đã tạo
const mockDiscounts = [
  {
    discount_id: 'GG001',
    title: 'Ưu đãi mùa hè',
    discount_percent: 10,
    start_date: '2025-07-01',
    end_date: '2025-07-31',
    tour_id: ['T001', 'T002', 'T003'],
  },
  {
    discount_id: 'GG002',
    title: 'Giảm giá cuối năm',
    discount_percent: 15,
    start_date: '2025-12-01',
    end_date: '2025-12-31',
    tour_id: ['T002', 'T004'],
  },
];

const API_DISCOUNTS = 'http://localhost:5004/api/discounts';
const API_TOURS = 'http://localhost:5000/api/tours';

function ManageDiscount() {
  // State cho danh sách khuyến mãi
  const [discounts, setDiscounts] = useState(mockDiscounts);
  // State cho form tạo mới
  const [showCreate, setShowCreate] = useState(false);
  const [discount, setDiscount] = useState({
    discount_id: '',
    title: '',
    description: '',
    discount_percent: 0,
    start_date: '',
    end_date: '',
    tour_id: [],
  });
  const [tours, setTours] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewDiscount, setViewDiscount] = useState(null);
  const [editDiscount, setEditDiscount] = useState(null);

  useEffect(() => {
    // Lấy danh sách discount từ backend
    fetch(API_DISCOUNTS)
      .then(res => res.json())
      .then(data => setDiscounts(data))
      .catch(() => setDiscounts([]));
    // Lấy danh sách tour từ backend
    fetch(API_TOURS)
      .then(res => res.json())
      .then(data => setTours(data))
      .catch(() => setTours([]));
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setDiscount(prev => ({ ...prev, [name]: value }));
  };

  const handleTourChange = (id) => {
    setDiscount(prev => {
      const exists = prev.tour_id.includes(id);
      return {
        ...prev,
        tour_id: exists ? prev.tour_id.filter(tid => tid !== id) : [...prev.tour_id, id]
      };
    });
  };

  const handleSelectAll = () => {
    setDiscount(prev => ({ ...prev, tour_id: tours.map(t => t.tour_id) }));
    setSelectAll(true);
  };

  const handleDeselectAll = () => {
    setDiscount(prev => ({ ...prev, tour_id: [] }));
    setSelectAll(false);
  };

  // Hàm lấy tên tour từ tour_id
  const getTourNames = (ids) => ids.map(id => {
    const t = tours.find(t => t.tour_id === id);
    return t ? t.name : id;
  }).join(', ');

  // Hàm định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('vi-VN');
  };

  // Popup xem chi tiết
  const renderViewModal = () => viewDiscount && (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Chi tiết khuyến mãi</h2>
        <p><b>Mã KM:</b> {viewDiscount.discount_id}</p>
        <p><b>Tiêu đề:</b> {viewDiscount.title}</p>
        <p><b>Mô tả:</b> {viewDiscount.description || '(Không có)'}</p>
        <p><b>Phần trăm giảm:</b> {viewDiscount.discount_percent}%</p>
        <p><b>Ngày bắt đầu:</b> {formatDate(viewDiscount.start_date)}</p>
        <p><b>Ngày kết thúc:</b> {formatDate(viewDiscount.end_date)}</p>
        <p><b>Áp dụng cho tour:</b></p>
        <ul style={{marginTop: 4, marginBottom: 12}}>
          {(viewDiscount.tour_id || []).map(id => {
            const t = tours.find(t => t.tour_id === id);
            return <li key={id}>{t ? t.name : id}</li>;
          })}
        </ul>
        <div style={{textAlign:'right',marginTop:16}}>
          <button style={{background:'#1BC6E8',color:'#fff',border:'none',borderRadius:4,padding:'8px 18px',fontWeight:500,fontSize:16,cursor:'pointer'}} onClick={()=>setViewDiscount(null)}>Đóng</button>
        </div>
      </div>
    </div>
  );

  // Hàm lưu discount đã sửa (mock, cập nhật state tại chỗ)
  const handleSaveEdit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn lưu thay đổi khuyến mãi này?')) return;
    try {
      const res = await fetch(`${API_DISCOUNTS}/${editDiscount.discount_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDiscount)
      });
      if (!res.ok) throw new Error('Lỗi cập nhật');
      const updated = await res.json();
      setDiscounts(discounts.map(d => d.discount_id === updated.discount_id ? updated : d));
      setEditDiscount(null);
    } catch (err) {
      alert('Lỗi khi cập nhật khuyến mãi!');
    }
  };

  // Form sửa discount
  const renderEditForm = () => editDiscount && (
    <div className="discount-bg">
      <div className={styles.container}>
        <h2>Sửa khuyến mãi</h2>
        <div className={styles['form-group']}>
          <label>Mã khuyến mãi:</label>
          <input type="text" name="discount_id" value={editDiscount.discount_id} disabled />
        </div>
        <div className={styles['form-group']}>
          <label>Tiêu đề:</label>
          <input type="text" name="title" value={editDiscount.title} onChange={e => setEditDiscount(prev => ({ ...prev, title: e.target.value }))} />
        </div>
        <div className={styles['form-group']}>
          <label>Mô tả:</label>
          <textarea name="description" value={editDiscount.description} onChange={e => setEditDiscount(prev => ({ ...prev, description: e.target.value }))} />
        </div>
        <div className={styles['form-group']}>
          <label>Phần trăm giảm (%):</label>
          <input name="discount_percent" type="number" value={editDiscount.discount_percent} onChange={e => setEditDiscount(prev => ({ ...prev, discount_percent: e.target.value }))} min={0} max={100} style={{ width: 80 }} />
        </div>
        <div className={styles['form-group']}>
          <label>Ngày bắt đầu:</label>
          <input name="start_date" type="date" value={editDiscount.start_date ? editDiscount.start_date.slice(0,10) : ''} onChange={e => setEditDiscount(prev => ({ ...prev, start_date: e.target.value }))} />
        </div>
        <div className={styles['form-group']}>
          <label>Ngày kết thúc:</label>
          <input name="end_date" type="date" value={editDiscount.end_date ? editDiscount.end_date.slice(0,10) : ''} onChange={e => setEditDiscount(prev => ({ ...prev, end_date: e.target.value }))} />
        </div>
        <div className={styles['form-group']}>
          <label>Áp dụng cho tour:</label>
          <div className={styles['tour-actions']}>
            <button type="button" onClick={() => setEditDiscount(prev => ({ ...prev, tour_id: tours.map(t => t.tour_id) }))} style={{ marginRight: 8 }}>Chọn tất cả</button>
            <button type="button" onClick={() => setEditDiscount(prev => ({ ...prev, tour_id: [] }))}>Bỏ chọn tất cả</button>
          </div>
          <div className={styles['tour-list']}>
            {tours.map(tour => (
              <div key={tour.tour_id}>
                <label>
                  <input
                    type="checkbox"
                    checked={editDiscount.tour_id.includes(tour.tour_id)}
                    onChange={() => setEditDiscount(prev => {
                      const exists = prev.tour_id.includes(tour.tour_id);
                      return {
                        ...prev,
                        tour_id: exists ? prev.tour_id.filter(tid => tid !== tour.tour_id) : [...prev.tour_id, tour.tour_id]
                      };
                    })}
                  />
                  {tour.name} ({tour.tour_id})
                </label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <button style={{ background: '#ccc', color: '#222', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 16, marginRight: 12, cursor: 'pointer' }} onClick={() => setEditDiscount(null)}>Hủy</button>
          <button style={{ background: '#1BC6E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={handleSaveEdit}>Lưu</button>
        </div>
      </div>
    </div>
  );

  // Giao diện bảng danh sách khuyến mãi
  const renderDiscountTable = () => (
    <div className="discount-bg">
      <div className={styles['discount-list-container']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: '#1BC6E8', margin: 0 }}>Danh sách khuyến mãi đã tạo</h3>
          <button style={{ background: '#1BC6E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={() => setShowCreate(true)}>
            + Tạo mới giảm giá
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#f4f8fb' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Mã KM</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Tiêu đề</th>
              <th style={{ textAlign: 'center', padding: 8 }}>% Giảm</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Bắt đầu</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Kết thúc</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Số tour áp dụng</th>
              <th style={{ textAlign: 'center', padding: 8 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 16 }}>Chưa có khuyến mãi nào</td></tr>
            ) : discounts.map(d => (
              <tr key={d.discount_id}>
                <td style={{ textAlign: 'left', padding: 8 }}>{d.discount_id}</td>
                <td style={{ textAlign: 'left', padding: 8 }}>{d.title}</td>
                <td style={{ textAlign: 'center', padding: 8 }}>{d.discount_percent}%</td>
                <td style={{ textAlign: 'center', padding: 8 }}>{formatDate(d.start_date)}</td>
                <td style={{ textAlign: 'center', padding: 8 }}>{formatDate(d.end_date)}</td>
                <td style={{ textAlign: 'center', padding: 8 }}>{d.tour_id.length}</td>
                <td style={{ textAlign: 'center', padding: 8 }}>
                  <button style={{ marginRight: 8, background: '#1BC6E8', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => setViewDiscount(d)}>Xem</button>
                  <button style={{ marginRight: 8, background: '#F36E08', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => setEditDiscount({ ...d })}>Sửa</button>
                  <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }} onClick={() => handleDeleteDiscount(d.discount_id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Giao diện form tạo mới khuyến mãi
  const renderCreateForm = () => (
    <div className="discount-bg">
      <div className={styles.container}>
        <h2>Quản lý khuyến mãi</h2>
        <div className={styles['form-group']}>
          <label>Mã khuyến mãi:</label>
          <input type="text" name="discount_id" value={discount.discount_id} readOnly disabled placeholder="Mã sẽ tự sinh khi lưu" />
        </div>
        <div className={styles['form-group']}>
          <label>Tiêu đề:</label>
          <input type="text" name="title" value={discount.title} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label>Mô tả:</label>
          <textarea name="description" value={discount.description} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label>Phần trăm giảm (%):</label>
          <input name="discount_percent" type="number" value={discount.discount_percent} onChange={handleInputChange} min={0} max={100} style={{ width: 80 }} />
        </div>
        <div className={styles['form-group']}>
          <label>Ngày bắt đầu:</label>
          <input name="start_date" type="date" value={discount.start_date} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label>Ngày kết thúc:</label>
          <input name="end_date" type="date" value={discount.end_date} onChange={handleInputChange} />
        </div>
        <div className={styles['form-group']}>
          <label>Áp dụng cho tour:</label>
          <div className={styles['tour-actions']}>
            <button type="button" onClick={handleSelectAll} style={{ marginRight: 8 }}>Chọn tất cả</button>
            <button type="button" onClick={handleDeselectAll}>Bỏ chọn tất cả</button>
          </div>
          <div className={styles['tour-list']}>
            {tours.map(tour => (
              <div key={tour.tour_id}>
                <label>
                  <input
                    type="checkbox"
                    checked={discount.tour_id.includes(tour.tour_id)}
                    onChange={() => handleTourChange(tour.tour_id)}
                  />
                  {tour.name} ({tour.tour_id})
                </label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <button style={{ background: '#ccc', color: '#222', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 16, marginRight: 12, cursor: 'pointer' }} onClick={() => setShowCreate(false)}>Hủy</button>
          <button style={{ background: '#1BC6E8', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 500, fontSize: 16, cursor: 'pointer' }} onClick={handleCreateDiscount}>Lưu</button>
        </div>
      </div>
    </div>
  );

  // Hàm tạo mới discount
  const handleCreateDiscount = async () => {
    try {
      const res = await fetch(API_DISCOUNTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...discount,
          discount_id: undefined // để backend tự sinh
        })
      });
      if (!res.ok) throw new Error('Lỗi tạo mới');
      const newDiscount = await res.json();
      alert('Tạo khuyến mãi thành công! Mã: ' + newDiscount.discount_id);
      setDiscounts([...discounts, newDiscount]);
      setShowCreate(false);
      setDiscount({
        discount_id: '',
        title: '',
        description: '',
        discount_percent: 0,
        start_date: '',
        end_date: '',
        tour_id: [],
      });
    } catch (err) {
      alert('Lỗi khi tạo mới khuyến mãi!');
    }
  };

  // Hàm xóa discount
  const handleDeleteDiscount = async (discount_id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      const res = await fetch(`${API_DISCOUNTS}/${discount_id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Lỗi xóa');
      setDiscounts(discounts.filter(d => d.discount_id !== discount_id));
    } catch (err) {
      alert('Lỗi khi xóa khuyến mãi!');
    }
  };

  return <>
    {editDiscount ? renderEditForm() : showCreate ? renderCreateForm() : renderDiscountTable()}
    {renderViewModal()}
  </>;
}

export default ManageDiscount; 