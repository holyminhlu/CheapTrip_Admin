import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './editTour.module.css';
import { FaFilePdf } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api/tours';

function EditTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState({
    tour_id: '', name: '', type: 'tour_thuong', image_url: '', price_per_adult: '', price_per_children: '',
    review_count: 0, average_rating: 0, duration: '', departure_date: '', hotel: '',
    departure_location: '', transportation: '', available_slots: 0, destination: '', file_info: '', file_name: '', file_view_url: ''
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (id) fetchTour();
  }, [id]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}`);
      const found = res.data.find(t => t._id === id);
      if (found) setTour(found);
      else setError('Không tìm thấy tour');
    } catch (err) {
      setError('Lỗi khi tải tour');
    }
    setLoading(false);
  };

  const handleChange = e => {
    setTour({ ...tour, [e.target.name]: e.target.value });
  };

  const handleImageLinkChange = (e) => {
    setImageLink(e.target.value);
  };

  const processImageLink = () => {
    if (!imageLink.trim()) {
      alert('Vui lòng nhập link ảnh!');
      return;
    }

    // Kiểm tra format link ảnh (Cloudinary, Google Drive, hoặc link thường)
    const imageRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    const cloudinaryRegex = /^https:\/\/res\.cloudinary\.com\/.+/i;
    const driveRegex = /^https:\/\/drive\.google\.com\/.+/i;
    
    if (!imageRegex.test(imageLink) && !cloudinaryRegex.test(imageLink) && !driveRegex.test(imageLink)) {
      alert('Link không đúng định dạng ảnh! Vui lòng kiểm tra lại.');
      return;
    }

    setTour({
      ...tour,
      image_url: imageLink
    });

    setImageLink('');
    alert('Đã thêm link ảnh thành công!');
  };

  const handleGoogleDriveLinkChange = (e) => {
    setGoogleDriveLink(e.target.value);
  };

  const processGoogleDriveLink = async () => {
    if (!googleDriveLink.trim()) {
      alert('Vui lòng nhập link Google Drive!');
      return;
    }

    // Kiểm tra format link Google Drive
    const driveRegex = /https:\/\/drive\.google\.com\/(file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    const match = googleDriveLink.match(driveRegex);
    
    if (!match) {
      alert('Link không đúng định dạng Google Drive! Vui lòng kiểm tra lại.');
      return;
    }

    const fileId = match[2];
    const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;

    // Lấy tên file từ link (có thể cần API call để lấy tên thực)
    const fileName = `File_${fileId.substring(0, 8)}.pdf`;

    setTour({
      ...tour,
      file_info: downloadUrl,
      file_view_url: viewUrl,
      file_name: fileName
    });

    setGoogleDriveLink('');
    alert('Đã xử lý link Google Drive thành công!');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!window.confirm('Bạn có chắc chắn muốn lưu thay đổi?')) return;
    try {
      // Ép kiểu các trường số về Number
      let tourData = {
        ...tour,
        price_per_adult: tour.price_per_adult ? Number(tour.price_per_adult) : undefined,
        price_per_children: tour.price_per_children ? Number(tour.price_per_children) : undefined,
        available_slots: tour.available_slots ? Number(tour.available_slots) : undefined,
        tour_id: undefined // để backend tự sinh
      };
      // Nếu thêm mới, sinh average_rating ngẫu nhiên từ 4.0 đến 5.0
      if (!id) {
        tourData = {
          ...tourData,
          average_rating: Math.round((Math.random() * (5 - 4) + 4) * 10) / 10
        };
        const res = await axios.post(`${API_URL}`, tourData);
        const newTourId = res.data.tour_id || (res.data.data && res.data.data.tour_id);
        setSuccessMsg(`Thêm tour mới thành công! Mã tour: ${newTourId || 'Không xác định'}`);
        setTimeout(() => {
          setSuccessMsg('');
          navigate('/dashboard/managetours');
        }, 2000);
        return;
      }
      // Nếu sửa tour
      await axios.put(`${API_URL}/${id}`, tourData);
      setSuccessMsg('Lưu thành công!');
      setTimeout(() => {
        setSuccessMsg('');
        navigate('/dashboard/managetours');
      }, 2000);
    } catch (err) {
      alert('Lỗi khi lưu!');
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.editContainer}>
      <div className={styles.editHeader}>
        <h2>{id ? 'THÔNG TIN CHI TIẾT' : 'Thêm tour mới'}</h2>
      </div>
      {successMsg && (
        <div style={{width: '100%', textAlign: 'center', marginBottom: 16}}>
          <span style={{background: '#e6fff7', color: '#1bc6e8', padding: '10px 32px', borderRadius: 8, fontWeight: 600, fontSize: '1.1rem', display: 'inline-block'}}>
            {successMsg}
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formCol}>
          <div className={styles.formRow}>
            <label>Mã tour</label>
            <input name="tour_id" value={tour.tour_id} readOnly disabled placeholder="Mã tour sẽ tự sinh khi tạo mới" />
          </div>
          <div className={styles.formRow}>
            <label>Tên tour</label>
            <input name="name" value={tour.name} onChange={handleChange} required />
          </div>
          <div className={styles.formRow}>
            <label>Loại</label>
            <select name="type" value={tour.type} onChange={handleChange} required>
              <option value="tour_thuong">Tour thường</option>
              <option value="tour_doan">Tour đoàn</option>
            </select>
          </div>
          <div className={styles.formRow}>
            <label>Ảnh - Dán link ảnh</label>
            <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
              <input 
                type="text" 
                placeholder="Dán link ảnh vào đây (Cloudinary, Google Drive, hoặc link thường)..."
                value={imageLink}
                onChange={handleImageLinkChange}
                style={{flex: 1}}
              />
              <button 
                type="button" 
                onClick={processImageLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1bc6e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Thêm
              </button>
            </div>
            {tour.image_url && (
              <div style={{marginTop: 8}}>
                <img src={tour.image_url} alt="Ảnh tour" style={{maxWidth: 120, maxHeight: 80, borderRadius: 6, boxShadow: '0 1px 4px #eee'}} />
                <div>
                  <a href={tour.image_url} target="_blank" rel="noopener noreferrer" style={{color: '#1bc6e8', fontWeight: 600}}>Xem ảnh gốc</a>
                </div>
              </div>
            )}
            <div style={{marginTop: 8, fontSize: 12, color: '#666'}}>
              <strong>Hướng dẫn:</strong> Copy link ảnh từ Cloudinary, dán vào ô trên và nhấn "Thêm"
            </div>
          </div>
          <div className={styles.formRow}>
            <label>Giá người lớn</label>
            <input name="price_per_adult" type="number" value={tour.price_per_adult} onChange={handleChange} required />
          </div>
          <div className={styles.formRow}>
            <label>Giá trẻ em</label>
            <input name="price_per_children" type="number" value={tour.price_per_children} onChange={handleChange} required />
          </div>
        </div>
        <div className={styles.formCol}>
          <div className={styles.formRow}>
            <label>Ngày khởi hành</label>
            <input name="departure_date" type="date" value={tour.departure_date ? tour.departure_date.slice(0,10) : ''} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Khách sạn</label>
            <input name="hotel" value={tour.hotel} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Điểm khởi hành</label>
            <input name="departure_location" value={tour.departure_location} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Phương tiện</label>
            <input name="transportation" value={tour.transportation} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Số chỗ</label>
            <input name="available_slots" type="number" value={tour.available_slots} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Thời lượng (ví dụ: 3 ngày 2 đêm)</label>
            <input name="duration" value={tour.duration} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>Điểm đến</label>
            <input name="destination" value={tour.destination} onChange={handleChange} />
          </div>
          <div className={styles.formRow}>
            <label>File info (PDF) - Dán link Google Drive</label>
            <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
              <input 
                type="text" 
                placeholder="Dán link Google Drive vào đây..."
                value={googleDriveLink}
                onChange={handleGoogleDriveLinkChange}
                style={{flex: 1}}
              />
              <button 
                type="button" 
                onClick={processGoogleDriveLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1bc6e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Xử lý
              </button>
            </div>
            {tour.file_info && (
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
                <FaFilePdf color="#e74c3c" size={28} />
                <a
                  href={tour.file_info}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{color: '#1bc6e8', fontWeight: 600, marginRight: 16}}
                >
                  {tour.file_name || 'Tải file PDF'}
                </a>
                {tour.file_view_url && (
                  <a
                    href={tour.file_view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{color: '#888', fontWeight: 400, fontSize: 13}}
                  >
                    Xem trên Google Drive
                  </a>
                )}
              </div>
            )}
            <div style={{marginTop: 8, fontSize: 12, color: '#666'}}>
              <strong>Hướng dẫn:</strong> Copy link Google Drive của file PDF, dán vào ô trên và nhấn "Xử lý"
            </div>
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn}>Lưu</button>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate('/dashboard/managetours')}>Quay lại</button>
        </div>
      </form>
    </div>
  );
}

export default EditTour; 