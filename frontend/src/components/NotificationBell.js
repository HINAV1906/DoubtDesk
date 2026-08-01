import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeaders, authJsonHeaders } from '../api';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const previousUnreadRef = useRef(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const newUnread = data.unread_count || 0;
        const newNotifs = data.notifications || [];

        // Check if new unread notification arrived
        if (newUnread > previousUnreadRef.current && newNotifs.length > 0) {
          const newest = newNotifs[0];
          setToast(newest);
          setTimeout(() => setToast(null), 5000);
        }

        previousUnreadRef.current = newUnread;
        setUnreadCount(newUnread);
        setNotifications(newNotifs);
      }
    } catch (err) {
      // ignore transient network errors during polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${API_BASE}/notifications/${id}/read/`, {
        method: 'POST',
        headers: authJsonHeaders(),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      previousUnreadRef.current = Math.max(0, previousUnreadRef.current - 1);
    } catch (err) {
      console.error(err);
    }

    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all/`, {
        method: 'POST',
        headers: authJsonHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      previousUnreadRef.current = 0;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className="notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="notif-bell-icon"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-header-title">
              Notifications
              {unreadCount > 0 && <span className="notif-header-count">{unreadCount} unread</span>}
            </div>
            {unreadCount > 0 && (
              <button className="notif-mark-all-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${item.is_read ? 'read' : 'unread'}`}
                  onClick={(e) => handleMarkAsRead(item.id, item.link, e)}
                >
                  <div className="notif-item-header">
                    <span className="notif-item-title">{item.title}</span>
                    <span className="notif-item-time">{item.created_at}</span>
                  </div>
                  <p className="notif-item-msg">{item.message}</p>
                  {!item.is_read && <div className="notif-unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Live Toast Popup */}
      {toast && (
        <div
          className="notif-toast"
          onClick={() => {
            if (toast.link) navigate(toast.link);
            setToast(null);
          }}
        >
          <div className="notif-toast-content">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            className="notif-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              setToast(null);
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
