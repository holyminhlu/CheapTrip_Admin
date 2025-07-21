import React, { useState, useEffect } from "react";
import "./statistical.css";

const API_BOOKINGS = 'http://localhost:5002/api/bookings';
const months = [
  "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"
];

const barWidth = 48; // tăng kích thước cột
const gap = 16;
const chartHeight = 220;
const ANIMATION_DURATION = 800; // ms

const BarChart = () => {
  const [hovered, setHovered] = useState(null);
  const [progress, setProgress] = useState(0); // 0 -> 1
  const [data, setData] = useState(Array(12).fill(0));

  useEffect(() => {
    fetch(API_BOOKINGS)
      .then(res => res.json())
      .then(bookings => {
        // Tính tổng doanh thu từng tháng theo time_booking
        const revenue = Array(12).fill(0);
        bookings.forEach(b => {
          if (!b.time_booking || !b.total_amount) return;
          if (((b.payment_status || '').trim().toLowerCase()) !== 'đã thanh toán') return;
          const date = new Date(b.time_booking);
          if (date.getMonth() === 6 && date.getFullYear() === 2025) {
            console.log('Booking tháng 7 được cộng:', b);
          }
          const month = date.getMonth(); // 0-11
          revenue[month] += b.total_amount;
        });
        setData(revenue.map(v => v > 0 ? Math.round(v / 1_000_000) : 0)); // Nếu không có booking, luôn là 0
      });
  }, []);

  const max = Math.max(...data);
  const barCount = data.length;
  const chartWidth = barCount * barWidth + (barCount - 1) * gap + 40;

  useEffect(() => {
    let start;
    function animate(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(1, elapsed / ANIMATION_DURATION);
      setProgress(p);
      if (p < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [data]);

  return (
    <>
      <div className="barchart-title">DOANH THU 12 THÁNG TRONG NĂM {new Date().getFullYear()}</div>
      <div className="barchart-container barchart-bg">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="barchart-svg">
          <rect x="0" y="0" width={chartWidth} height={chartHeight} fill="#1BC6E8" />
          {data.map((value, i) => {
            const barHeight = (max > 0 ? ((value / max) * 140) : 0) * progress;
            const x = 20 + i * (barWidth + gap);
            return (
              <g key={i}>
                {/* Tooltip chỉ là text */}
                {hovered === i && (
                  <text
                    x={x + barWidth / 2}
                    y={180 - barHeight - 18}
                    textAnchor="middle"
                    fontSize="15"
                    fill="#fff"
                    fontWeight="bold"
                  >
                    {value} triệu đồng
                  </text>
                )}
                <rect
                  x={x}
                  y={180 - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill="#F36E08"
                  rx={8}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", transition: "y 0.4s, height 0.4s" }}
                />
                <text
                  x={x + barWidth / 2}
                  y={180 - barHeight - 8}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#222"
                  fontWeight="bold"
                  style={{ opacity: progress }}
                >
                  {value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={205}
                  textAnchor="middle"
                  fontSize="15"
                  fill="#222"
                >
                  {months[i]}
                </text>
              </g>
            );
          })}
          {/* trục ngang */}
          <line x1="10" y1="180" x2={chartWidth - 10} y2="180" stroke="#888" strokeWidth="2" />
        </svg>
      </div>
    </>
  );
};

export default BarChart; 