import { NavLink } from 'react-router-dom';
import '../dashboard/dashboard.css';
import { useRef, useEffect, useState } from 'react';
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"></link>

function Dashboard({ showSidebar, setShowSidebar }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutsideSidebar(event) {
            if (
                window.innerWidth < 950 &&
                showSidebar &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                setShowSidebar(false);
            }
        }
        if (showSidebar) {
            document.addEventListener('mousedown', handleClickOutsideSidebar);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideSidebar);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideSidebar);
        };
    }, [showSidebar, setShowSidebar]);

    useEffect(() => {
        function handleClickOutsideNotification(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutsideNotification);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideNotification);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutsideNotification);
        };
    }, [showNotifications]);

    return (
        <div ref={sidebarRef} className={"dashboard_container" + (showSidebar ? " show-sidebar" : "") }>
                {/* Logo và Title */}
                <div className='logo-title'>
                    <div className='logo'>
                        <img src="../img/logo.png" alt="Logo"/>
                    </div>
                    <div className='title'>
                        <font style={{color: '#F36E08'}}>CHEAP</font>
                        <font style={{color: '#1BC6E8', marginRight: '5px'}}>TRIP</font> 
                        <font style={{color: '#FFFFFF'}}>FOR ADMIN</font>
                    </div>
                </div>

                {/* MENU */}
                <nav className="menu">
                    <ul>
                        <li>
                            <NavLink to="/dashboard/tours" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                <i className="fa-solid fa-flag"></i>QUẢN LÝ TOURS
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/managebooking" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                <i className="fa-solid fa-file-invoice"></i>QUẢN LÝ ĐƠN ĐẶT TOUR
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                <i className="fa-solid fa-users"></i>TÀI KHOẢN NGƯỜI DÙNG
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/managediscount" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                <i className="fa-solid fa-percent"></i>QUẢN LÝ GIẢM GIÁ
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/login" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                <i className="fa-solid fa-right-from-bracket"></i>ĐĂNG XUẤT
                            </NavLink>
                        </li>
                    </ul>
                </nav>
        </div>
    );
}

export default Dashboard;