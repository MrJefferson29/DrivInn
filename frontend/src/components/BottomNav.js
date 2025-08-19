import React, { useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSparkles, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlineClipboardDocumentList, HiOutlineCreditCard } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

const BottomNavBar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 18px;
  z-index: 1000;
  background: rgba(255,255,255,0.98);
  box-shadow: 0 4px 32px rgba(0,0,0,0.13), 0 1.5px 8px rgba(0,0,0,0.07);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  height: 68px;
  border-radius: 22px;
  margin: 0 auto;
  max-width: 420px;
  width: calc(100vw - 24px);
  padding: 0 2px;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s;
  @media (min-width: 701px) {
    display: none;
  }
`;

const NavItem = styled(Link)`
  flex: 1;
  text-align: center;
  color: #717171;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0 2px 0;
  position: relative;
  transition: color 0.18s, font-weight 0.18s;
  min-width: 0;
  min-height: 0;
  &:active {
    background: #f7f7f7;
    border-radius: 16px;
  }
  ${({ $active }) => $active && css`
    color: #FF385C;
    font-weight: 700;
  `}
`;

const NavIcon = styled.div`
  font-size: 1.7rem;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s;
  ${({ $active }) => $active && css`
    transform: scale(1.18);
  `}
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 50%;
  bottom: 7px;
  transform: translateX(-50%);
  width: 32px;
  height: 4px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(90deg, #FF385C 60%, #FF5A5F 100%);
  box-shadow: 0 2px 8px rgba(255,56,92,0.13);
  opacity: ${({ active }) => (active ? 1 : 0)};
  transition: opacity 0.18s;
`;

// Routes where bottom nav should be visible
const bottomNavRoutes = ['/', '/experiences', '/messages', '/bookings'];

const BottomNav = () => {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(window.scrollY);
  const location = useLocation();
  const { user } = useAuth();

  // Get the appropriate label and icon for the second nav item based on user role
  const getSecondNavItem = () => {
    if (user?.role === 'admin') {
      return { label: 'Transactions', icon: <HiOutlineCreditCard /> };
    } else if (user?.role === 'host') {
      return { label: 'Listings', icon: <HiOutlineClipboardDocumentList /> };
    } else {
      // Default for guests and unauthenticated users
      return { label: 'Experiences', icon: <HiOutlineSparkles /> };
    }
  };

  const secondNavItem = getSecondNavItem();

  const navItems = [
    { to: '/', label: 'Explore', icon: <HiOutlineHome /> },
    { to: '/experiences', label: secondNavItem.label, icon: secondNavItem.icon },
    { to: '/messages', label: 'Messages', icon: <HiOutlineChatBubbleLeftRight /> },
    { to: '/bookings', label: 'Bookings', icon: <HiOutlineCalendarDays /> },
  ];

  // Check if current route should show bottom nav
  const shouldShowBottomNav = bottomNavRoutes.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setVisible(true);
      } else if (currentY > lastScrollY.current) {
        setVisible(false); // scrolling down
      } else {
        setVisible(true); // scrolling up
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render if not on a bottom nav route
  if (!shouldShowBottomNav) {
    return null;
  }

  return (
    <BottomNavBar style={{ transform: visible ? 'translateY(0)' : 'translateY(120%)' }}>
      {navItems.map(item => {
        const isActive = location.pathname === item.to;
        return (
          <NavItem
            key={item.to}
            to={item.to}
            $active={isActive}
          >
            <NavIcon $active={isActive}>{item.icon}</NavIcon>
            {item.label}
            <ActiveIndicator active={isActive} />
          </NavItem>
        );
      })}
    </BottomNavBar>
  );
};

export default BottomNav;
