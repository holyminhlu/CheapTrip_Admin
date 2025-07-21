import React, { useState, useRef, useEffect } from "react";
import "./dashboard/dashboard.css";

const TopWidget = ({ onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="topwidget">
      <div className="menu-toggle" onClick={onToggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </div>
      <div className="admin-info">
        <img
          src="../img/avataradmin.png"
          alt="Admin Avatar"
          className="admin-avatar"
        />
        <span className="admin-name">Admin</span>
      </div>
      {/* ĐÃ XÓA PHẦN THÔNG BÁO */}
    </div>
  );
};

export default TopWidget; 