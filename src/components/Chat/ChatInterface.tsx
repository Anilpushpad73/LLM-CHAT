import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import TopBar from './TopBar';
import NotificationPanel from '../Notifications/NotificationPanel';
import OrganizationModal from '../Organization/OrganizationModal';
import api from '../../services/api';
import socketService from '../../services/socket';
import { setChats} from '../../store/slices/chatSlice';
import { setNotifications, addNotification } from '../../store/slices/notificationSlice';
import { setOrganizations, setCurrentOrganization } from '../../store/slices/organizationSlice';

const ChatInterface = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch(); 
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      loadInitialData();
      setupSocket();
    }

    return () => {
      socketService.offNotification();
    };
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [chatsRes, notificationsRes, orgsRes] = await Promise.all([
        api.get('/chat/list'),
        api.get('/notification/list'),
        api.get('/organization/list')
      ]);

      dispatch(setChats(chatsRes.data.chats));
      dispatch(setNotifications(notificationsRes.data.notifications));
      dispatch(setOrganizations(orgsRes.data.organizations));

      if (user?.activeOrganizationId) {
        const orgRes = await api.get(`/organization/${user.activeOrganizationId}`);
        dispatch(setCurrentOrganization(orgRes.data.organization));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const setupSocket = () => {
    if (user) {
      socketService.connect(user.id);
      socketService.onNotification((notification) => {
        dispatch(addNotification(notification));
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenOrgModal={() => setShowOrgModal(true)}
      />

      <div className="flex-1 flex flex-col ">
        <TopBar
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        <ChatArea />
      </div>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {showOrgModal && (
        <OrganizationModal onClose={() => setShowOrgModal(false)} />
      )}
    </div>
  );
};

export default ChatInterface;
