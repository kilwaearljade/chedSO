import React, { useEffect, useState, useRef } from 'react';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationBellProps {
  onNotificationClick?: () => void;
  showDropdown?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNotificationClick,
  showDropdown = false,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadNotifications,
  } = useNotifications({ pollInterval: 10000 });

  const [isOpen, setIsOpen] = useState(showDropdown);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadNotifications(5);
  }, [fetchUnreadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationRoute = (notification: Notification): string => {
    switch (notification.type) {
      case 'appointment_confirmed':
      case 'appointment_pending':
      case 'appointment_activity':
        return '/appointment';
      case 'new_message':
      case 'message_activity':
        return '/messages';
      case 'event_created':
      case 'event_activity':
        return '/calendar';
      case 'new_registration':
        return '/schools';
      default:
        return '/notifications';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    const route = getNotificationRoute(notification);
    window.location.href = route;
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_pending':
      case 'appointment_activity':
        return 'bg-blue-100 text-blue-800';
      case 'new_message':
      case 'message_activity':
        return 'bg-purple-100 text-purple-800';
      case 'event_created':
      case 'event_activity':
        return 'bg-green-100 text-green-800';
      case 'new_registration':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onNotificationClick?.();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-blue-50 cursor-pointer transition ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
