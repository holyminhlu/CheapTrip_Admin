import React, { useState, useEffect } from "react";
import "./statistical.css";
import Counter from "./Counter";
import BarChart from "./BarChart";
import AnimatedCircle from "./AnimatedCircle";

const API_TOURS = 'http://localhost:5000/api/tours';
const API_USERS = 'http://localhost:5003/api/users';
const API_BOOKINGS = 'http://localhost:5002/api/bookings';

const Statistical = () => {
  const [tourCount, setTourCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [normalBookingCount, setNormalBookingCount] = useState(0);
  const [groupBookingCount, setGroupBookingCount] = useState(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [topTour, setTopTour] = useState('');
  const [topRatedTour, setTopRatedTour] = useState('');
  const [percentNormal, setPercentNormal] = useState(0);
  const [percentGroup, setPercentGroup] = useState(0);

  useEffect(() => {
    // Lấy số lượng tour
    fetch(API_TOURS)
      .then(res => res.json())
      .then(data => {
        setTourCount(data.length || 0);
        // Tìm tour có nhiều người tham gia nhất và tour có rate cao nhất
        if (data.length > 0) {
          // Tour nhiều người tham gia nhất
          let maxTour = data[0];
          let maxRatedTour = data[0];
          data.forEach(t => {
            if ((t.review_count || 0) > (maxTour.review_count || 0)) maxTour = t;
            if ((t.average_rating || 0) > (maxRatedTour.average_rating || 0)) maxRatedTour = t;
          });
          setTopTour(maxTour.name || '---');
          setTopRatedTour(maxRatedTour.name || '---');
        }
      });
    // Lấy số lượng người dùng
    fetch(API_USERS)
      .then(res => res.json())
      .then(data => setUserCount(data.length || 0));
    // Lấy booking
    fetch(API_BOOKINGS)
      .then(res => res.json())
      .then(data => {
        // Thống kê đơn đặt tour thường/đoàn trong tháng hiện tại
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        let normal = 0, group = 0, revenue = 0;
        data.forEach(b => {
          if (!b.time_booking) return;
          const date = new Date(b.time_booking);
          if (date.getMonth() + 1 === month && date.getFullYear() === year) {
            const type = (b.type || '').trim().toLowerCase();
            if (type === 'tour thường' || type === 'tour_thuong') normal++;
            if (type === 'tour đoàn' || type === 'tour_doan') group++;
            if ((b.payment_status || '').trim().toLowerCase() === 'đã thanh toán' && b.total_amount) {
              revenue += b.total_amount;
            }
          }
        });
        setNormalBookingCount(normal);
        setGroupBookingCount(group);
        setCurrentMonthRevenue(revenue);
        // Tính phần trăm
        const total = normal + group;
        setPercentNormal(total > 0 ? Math.round((normal / total) * 100) : 0);
        setPercentGroup(total > 0 ? Math.round((group / total) * 100) : 0);
      });
  }, []);

  return (
    <div className="statistical-content">
      {/* Hàng 1: Tổng quan */}
      <div className="statistical-header">
        <div className="statistical-total">
          <div className="statistical-total-number">
            <Counter from={0} to={tourCount} duration={1000} />
          </div>
          <div className="statistical-total-label">SỐ LƯỢNG TOUR</div>
        </div>
        <div className="statistical-highlight">
          <div className="statistical-highlight-item">
            <span className="statistical-highlight-icon">&#x1F451;</span>
            <div className="statistical-highlight-title">{topTour}</div>
            <div className="statistical-highlight-label">TOUR CÓ NHIỀU NGƯỜI THAM GIA NHẤT</div>
          </div>
          <div className="statistical-highlight-item">
            <span className="statistical-highlight-icon">&#x2728;</span>
            <div className="statistical-highlight-title">{topRatedTour}</div>
            <div className="statistical-highlight-label">TOUR CÓ RATE CAO NHẤT</div>
          </div>
        </div>
        <div className="statistical-type-group">
          <div className="statistical-type">
            <div className="statistical-type-title">TOUR THƯỜNG</div>
            <AnimatedCircle to={percentNormal} duration={1000} />
          </div>
          <div className="statistical-type">
            <div className="statistical-type-title">TOUR ĐOÀN</div>
            <AnimatedCircle to={percentGroup} duration={1000} />
          </div>
        </div>
      </div>
      {/* Hàng 2: Số người sử dụng + Thống kê số đơn đặt tour */}
      <div className="statistical-row">
        <div className="statistical-user-box">
          <span className="statistical-user-icon">
            <i className="fa fa-users"></i>
          </span>
          <span className="statistical-user-number">
            <Counter from={0} to={userCount} duration={1500} />
          </span>
          <span className="statistical-user-label">
             NGƯỜI SỬ DỤNG DỊCH VỤ CỦA WEBSITE <span className="cheaptrip">CHEAPTRIP</span>
          </span>
        </div>
        <div className="statistical-order-box">
          <div className="statistical-order-title">
            TRONG <span className="statistical-order-month">THÁNG {new Date().getMonth() + 1}</span> NÀY, CHÚNG TÔI CÓ
          </div>
          <div className="statistical-order-content">
            <div className="statistical-order-col">
              <div className="statistical-order-number">
                <Counter from={0} to={normalBookingCount} duration={1000} />
              </div>
              <div className="statistical-order-label">ĐƠN ĐẶT TOUR THƯỜNG</div>
            </div>
            <div className="statistical-order-col">
              <div className="statistical-order-number">
                <Counter from={0} to={groupBookingCount} duration={1000} />
              </div>
              <div className="statistical-order-label">ĐƠN ĐẶT TOUR ĐOÀN</div>
            </div>
          </div>
        </div>
      </div>
      {/* Hàng 3: Doanh thu tháng này */}
      <div className="statistical-row">
        <div className="statistical-box statistical-box-full" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1BC6E8', marginBottom: 8, letterSpacing: 1 }}>DOANH THU THÁNG NÀY</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#F36E08', marginBottom: 18, letterSpacing: 1 }}>{currentMonthRevenue.toLocaleString()} VNĐ</div>
        </div>
      </div>
    </div>
  );
};

export default Statistical; 