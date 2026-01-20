import React, { useEffect, useState } from 'react';
import { Notification } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_activity':
        return '📅';
      case 'new_message':
      case 'message_activity':
        return '💬';
      case 'event_created':
      case 'event_activity':
        return '🎉';
      case 'new_registration':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_activity':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'new_message':
      case 'message_activity':
        return 'border-l-4 border-purple-500 bg-purple-50';
      case 'event_created':
      case 'event_activity':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'new_registration':
        return 'border-l-4 border-orange-500 bg-orange-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 mb-2 rounded-lg ${getNotificationColor(notification.type)} ${!notification.is_read ? 'font-semibold' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <span className="text-2xl mr-3">{getNotificationIcon(notification.type)}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
            <p className="text-gray-500 text-xs mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {!notification.is_read && (
            <button
              onClick={() => onMarkAsRead?.(notification.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Mark Read
            </button>
          )}
          <button
            onClick={() => onDelete?.(notification.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  onMarkAsRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  maxDisplayed?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  loading = false,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onClearAll,
  maxDisplayed = 5,
}) => {
  const displayedNotifications = notifications.slice(0, maxDisplayed);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Notifications {unreadCount > 0 && <span className="text-red-600">({unreadCount})</span>}
        </h2>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Loading notifications...</p>
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div>
          {displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
          {notifications.length > maxDisplayed && (
            <p className="text-sm text-gray-500 text-center mt-4">
              +{notifications.length - maxDisplayed} more notifications
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
