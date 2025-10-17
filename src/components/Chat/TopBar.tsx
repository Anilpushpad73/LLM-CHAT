import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Bell, Coins, LogOut, Menu, ChevronDown } from "lucide-react";
// import { logout } from '../../store/slices/authSlice';

interface TopBarProps {
  onToggleNotifications: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const TopBar = ({
  onToggleNotifications,
  onToggleSidebar,
  isSidebarOpen,
}: TopBarProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const unreadCount = useSelector(
    (state: RootState) => state.notification.unreadCount
  );
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const dispatch = useDispatch();

  function handleSignOut() {
    // dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  }

  return (
    <header
      className={`fixed top-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-in-out
      ${isSidebarOpen ? "sm:left-64 sm:right-0 sm:w-[calc(100%-16rem)]" : "left-0 right-0 w-full"}`}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">
          AI Chat Platform
        </h1>
      </div>

      {/* ---------- Desktop & Tablet View ---------- */}
      <div className="hidden sm:flex items-center space-x-3 sm:space-x-5">
        {/* Credits */}
        <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <Coins className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-sm font-semibold text-green-700">
            {user?.credits || 0} Credits
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
            {user?.username?.charAt(0).toUpperCase() || "G"}
          </div>

          <span className="hidden md:inline text-gray-800 font-semibold text-sm">
            {user?.username || "Guest"}
          </span>

          <button
            onClick={handleSignOut}
            className="ml-auto px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-lg hover:from-red-600 hover:to-rose-700 transition"
          >
            Log
            <LogOut className="w-4 h-4 inline-block ml-1" />
          </button>
        </div>
      </div>

      {/* ---------- Mobile Dropdown Menu ---------- */}
      <div className="flex sm:hidden items-center space-x-3 relative">
        {/* Avatar Dropdown Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm hover:shadow transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0).toUpperCase() || "G"}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-gray-200 w-60 p-3 animate-fadeIn z-50">
            
            {/* User Info */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "G"}
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">
                  {user?.username || "Guest"}
                </p>
                <p className="text-gray-500 text-xs">
                  {user?.email || "guest@example.com"}
                </p>
              </div>
            </div>

            {/* Credits */}
            <div className="flex items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200 mb-3">
              <Coins className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-700">
                {user?.credits || 0} Credits
              </span>
            </div>

            {/* Notifications Button */}
            <button
              onClick={onToggleNotifications}
              className="relative flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Notifications
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-lg shadow hover:shadow-lg hover:from-red-600 hover:to-rose-700 transition flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </button>
          </div>
        )}
      </div>

    </header>
  );
};

export default TopBar;
