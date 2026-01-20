import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UseNotificationsOptions {
  pollInterval?: number;
  autoMarkAsRead?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { pollInterval = 30000, autoMarkAsRead = false } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Fetch all notifications
  const fetchNotifications = useCallback(
    async (page: number = 1, perPage: number = 20) => {
      setLoading(true);
      try {
        const response = await axios.get('/notifications', {
          params: { page, per_page: perPage },
        });
        setNotifications(response.data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch unread notifications only
  const fetchUnreadNotifications = useCallback(
    async (limit: number = 10) => {
      setLoading(true);
      try {
        const response = await axios.get('/notifications/unread', {
          params: { limit },
        });
        setNotifications(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchUnreadCount();
    } catch (err: any) {
      setError(err.message);
    }
  }, [fetchUnreadCount]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await axios.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Get notifications by type
  const getByType = useCallback(async (type: string, perPage: number = 20) => {
    setLoading(true);
    try {
      const response = await axios.get('/notifications/type/' + type, {
        params: { per_page: perPage },
      });
      setNotifications(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup polling for notifications
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, pollInterval);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollInterval]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getByType,
    fetchUnreadCount,
  };
};
