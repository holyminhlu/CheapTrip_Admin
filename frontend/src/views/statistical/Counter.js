import React, { useEffect, useState } from "react";

const Counter = ({ from = 0, to, duration = 1500 }) => {
  const [count, setCount] = useState(from);
  useEffect(() => {
    let start = from;
    const end = parseInt(to);
    if (start === end) return;
    let incrementTime = Math.max(10, Math.floor(duration / (end - start)));
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [from, to, duration]);
  return <span>{count}</span>;
};

export default Counter; 