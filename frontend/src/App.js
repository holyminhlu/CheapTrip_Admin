import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard';
import Statistical from './views/statistical/statistical';
import TopWidget from './components/TopWidget';
import ManageTours from './views/managetours/manageTours';
import EditTour from './views/managetours/editTour';
import ManageUsers from './views/manageUsers/manageUsers';
import UserDetail from './views/manageUsers/userDetail';
import ManageBooking from './views/manageBooking/manageBooking';
import ManageDiscount from './views/manageDiscount/manageDiscount';
import AdminLogin from './views/admin/AdminLogin';
import './App.css';

function AdminLayout() {
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 950);
  const handleToggleSidebar = () => setShowSidebar((prev) => !prev);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 950);
      if (window.innerWidth >= 950) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Sidebar overlay nếu mobile */}
      {isMobile && showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '260px',
            height: '100vh',
            zIndex: 2000,
            background: '#222',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          }}
        >
          <Dashboard showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        </div>
      )}
      {/* Overlay mờ khi mở sidebar ở mobile */}
      {isMobile && showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 1000
          }}
          onClick={() => setShowSidebar(false)}
        />
      )}
      {/* Sidebar thường ở desktop */}
      {!isMobile && showSidebar && (
        <div style={{height: '100vh', zIndex: 1}}>
          <Dashboard showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        </div>
      )}
      {/* Nội dung bên phải */}
      <div style={{ flex: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column', zIndex: 0 }}>
        <TopWidget onToggleSidebar={handleToggleSidebar} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function Logout() {
  const navigate = useNavigate();
  const [showMsg, setShowMsg] = React.useState(false);
  React.useEffect(() => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (confirmed) {
      localStorage.removeItem('token');
      setShowMsg(true);
      const timer = setTimeout(() => {
        setShowMsg(false);
        navigate('/admin/login', { replace: true });
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      navigate(-1);
    }
  }, [navigate]);
  return showMsg ? (
    <div style={{width:'100vw',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#1BC6E8',fontWeight:600}}>
      Đăng xuất thành công!
    </div>
  ) : null;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="tours" element={<ManageTours />} />
          <Route path="managetours" element={<ManageTours />} />
          <Route path="managetours/add" element={<EditTour />} />
          <Route path="managetours/edit/:id" element={<EditTour />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="manageusers" element={<ManageUsers />} />
          <Route path="manageusers/detail" element={<UserDetail />} />
          <Route path="managebooking" element={<ManageBooking />} />
          <Route path="managediscount" element={<ManageDiscount />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
