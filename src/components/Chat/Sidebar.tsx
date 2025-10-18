import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { Plus, MessageSquare, Trash2, Building2, Pen, Search } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';
import { addChat, setCurrentChat, removeChat, setMessages, updateChatTitle } from '../../store/slices/chatSlice';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenOrgModal: () => void;
}

const Sidebar = ({ isOpen, onOpenOrgModal }: SidebarProps) => {
  const dispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chat.chats);
  const currentChatId = useSelector((state: RootState) => state.chat.currentChatId);
  const currentOrg = useSelector((state: RootState) => state.organization.currentOrganization);

  const [searchQuery, setSearchQuery] = useState('');

  const handleNewChat = async () => {
    try {
      const response = await api.post('/chat/create');
      dispatch(addChat(response.data.chat));
      dispatch(setCurrentChat(response.data.chat._id));
      dispatch(setMessages([]));
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      dispatch(setCurrentChat(chatId));
      const response = await api.get(`/chat/${chatId}/messages`);
      dispatch(setMessages(response.data.messages));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handlechangetitle = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt("Enter new chat title:");
    if (!newTitle || newTitle.trim() === "") return;

    try {
      const response = await api.put(`/chat/${chatId}/title`, { title: newTitle });
      dispatch(updateChatTitle({ chatId, title: newTitle }));
      console.log("Chat title updated:", response.data);
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;

    try {
      await api.delete(`/chat/${chatId}`);
      dispatch(removeChat(chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Filter chats based on search input
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed top-0 left-0 border-r border-slate-700 z-40">
      <div className="p-3 border-b border-slate-700">
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-700 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 text-white text-sm px-2 py-1 rounded-md focus:outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
            Recent Chats
          </h3>

          {filteredChats.length === 0 ? (
            <p className="text-sm text-gray-500 px-2 py-4">No matching chats found.</p>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat._id)}
                  className={`group relative flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition ${
                    currentChatId === chat._id
                      ? 'bg-slate-700'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0 text-gray-400" />
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(chat._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-500 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handlechangetitle(chat._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-500 rounded transition"
                  >
                    <Pen className="w-4 h-4 text-black" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onOpenOrgModal}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center text-sm"
        >
          <Building2 className="w-4 h-4 mr-2" />
          {currentOrg ? currentOrg.name : 'Organizations'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
