import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { X, CheckCheck, Bell } from 'lucide-react';
import api from '../../services/api';
import { markAsRead, markAllAsRead } from '../../store/slices/notificationSlice';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notification/${notificationId}/read`);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notification/read-all');
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Notifications</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {notifications.length > 0 && unreadCount > 0 && (
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all as read
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No notifications yet</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                className={`p-4 cursor-pointer transition ${
                  notification.read ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
