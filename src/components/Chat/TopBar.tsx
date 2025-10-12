import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Bell, Coins, Menu } from 'lucide-react';

interface TopBarProps {
  onToggleNotifications: () => void;
  onToggleSidebar: () => void;
}

const TopBar = ({ onToggleNotifications, onToggleSidebar }: TopBarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">AI Chat Platform</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <Coins className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-sm font-semibold text-green-700">
            {user?.credits || 0} Credits
          </span>
        </div>

        <button
          onClick={onToggleNotifications}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
