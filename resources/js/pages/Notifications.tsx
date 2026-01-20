import React, { useEffect, useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getByType,
    fetchNotifications,
  } = useNotifications({ pollInterval: 15000 });

  const { auth } = usePage().props;

  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (currentFilter) {
      getByType(currentFilter);
    } else {
      fetchNotifications(currentPage);
    }
  }, [currentPage, currentFilter]);

  const notificationTypes = [
    { key: 'appointment_confirmed', label: '📅 Appointment Confirmed' },
    { key: 'appointment_pending', label: '📅 Appointment Pending' },
    { key: 'appointment_activity', label: '📅 Appointment Activity' },
    { key: 'new_message', label: '💬 New Message' },
    { key: 'message_activity', label: '💬 Message Activity' },
    { key: 'event_created', label: '🎉 Event Created' },
    { key: 'event_activity', label: '🎉 Event Activity' },
    { key: 'new_registration', label: '👤 New Registration' },
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_activity':
      case 'appointment_pending':
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

  const getNotificationRoute = (type: string): string => {
    switch (type) {
      case 'appointment_confirmed':
      case 'appointment_pending':
      case 'appointment_activity':
        return '/appointment';
      case 'new_message':
      case 'message_activity':
        return '/messages';
      case 'event_created':
      case 'event_activity':
        return (auth as any)?.user?.role === 'admin' ? '/calendar' : '/school/calendar';
      case 'new_registration':
        return '/schools';
      default:
        return '/notifications';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    const route = getNotificationRoute(notification.type);
    window.location.href = route;
  };

  return (
    <AuthenticatedLayout>
      <Head title="Notifications" />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Mark All Read
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Total: {notifications.length} | Unread: <span className="font-bold text-red-600">{unreadCount}</span>
                </p>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setCurrentFilter(null);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentFilter === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {notificationTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => {
                        setCurrentFilter(type.key);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentFilter === type.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-4">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No notifications to display</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-6 rounded-lg ${getNotificationColor(notification.type)} ${
                        !notification.is_read ? 'ring-2 ring-blue-300' : ''
                      } cursor-pointer transition hover:shadow-lg hover:ring-2 hover:ring-blue-400`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {notification.title}
                          </h3>
                          <p className="text-gray-700 mb-3">{notification.message}</p>

                          {notification.data && Object.keys(notification.data).length > 0 && (
                            <div className="bg-white bg-opacity-50 p-3 rounded mt-3">
                              <p className="text-sm font-semibold text-gray-600 mb-2">Details:</p>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {Object.entries(notification.data).map(([key, value]) => (
                                  <li key={key}>
                                    <strong>{key.replace(/_/g, ' ')}:</strong> {String(value)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-sm text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-white bg-opacity-60">
                              {notification.type.replace(/_/g, ' ')}
                            </span>
                            {notification.is_read && (
                              <span className="text-xs px-3 py-1 rounded-full bg-green-200 text-green-800">
                                Read
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
