import React, { useEffect, useState } from "react";
import "./statistical.css";

const AnimatedCircle = ({ to = 0, duration = 1000 }) => {
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(to);
    if (start === end) return;
    let incrementTime = Math.max(10, Math.floor(duration / end));
    let timer = setInterval(() => {
      start += 1;
      setPercent(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [to, duration]);
  return (
    <div className="statistical-circle" style={{ "--percent": percent }}>
      <span>{percent}%</span>
    </div>
  );
};

export default AnimatedCircle; 