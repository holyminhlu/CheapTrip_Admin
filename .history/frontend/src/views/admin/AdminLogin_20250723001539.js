import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const API_LOGIN = "http://localhost:5003/api/admin/dev-login";
const API_VERIFY = "http://localhost:5003/api/admin/verify-otp";

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  // Hàm đăng nhập hardcode ở frontend
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        setMsg("Đăng nhập thành công!");
        localStorage.setItem('token', 'admin-token');
        if (onLoginSuccess) onLoginSuccess();
        navigate('/dashboard/tours');
      } else {
        setMsg("Sai tài khoản hoặc mật khẩu");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ maxWidth: 350, margin: "60px auto", background: "#fff", borderRadius: 10, boxShadow: "0 2px 12px #ccc", padding: 32 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Đăng nhập Admin</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 18, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ width: "100%", padding: 12, background: "#1BC6E8", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700 }}>
          {loading ? "Đang gửi..." : "Đăng nhập"}
        </button>
      </form>
      {msg && <div style={{ marginTop: 18, color: msg.includes("thành công") ? "green" : "red", textAlign: "center" }}>{msg}</div>}
    </div>
  );
} 