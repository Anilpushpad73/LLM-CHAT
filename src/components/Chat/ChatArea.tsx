import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { Send, Loader } from 'lucide-react';
import api from '../../services/api';
import { addMessage, setSending, updateChatTitle } from '../../store/slices/chatSlice';
import { updateCredits } from '../../store/slices/authSlice';

const ChatArea = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const currentChatId = useSelector((state: RootState) => state.chat.currentChatId);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const sending = useSelector((state: RootState) => state.chat.sending);
  const user = useSelector((state: RootState) => state.auth.user);
  const chats = useSelector((state: RootState) => state.chat.chats);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !currentChatId || sending) return;

    const content = input.trim();
    setInput('');
    dispatch(setSending(true));

    try {
      const response = await api.post(`/chat/${currentChatId}/message`, { content });

      dispatch(addMessage(response.data.userMessage));
      dispatch(addMessage(response.data.assistantMessage));
      dispatch(updateCredits(response.data.remainingCredits));

      const currentChat = chats.find(c => c._id === currentChatId);
      if (currentChat?.title === 'New Chat') {
        dispatch(updateChatTitle({
          chatId: currentChatId,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        }));
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.response?.data?.error === 'Insufficient credits') {
        alert('You do not have enough credits to send this message. Please purchase more credits.');
      }
    } finally {
      dispatch(setSending(false));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Start a New Conversation
          </h2>
          <p className="text-gray-600">
            Click "New Chat" to begin chatting with AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                How can I help you today?
              </h3>
              <p className="text-gray-500">
                Type a message below to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={user && user.credits < 10 ? 'Insufficient credits' : 'Type your message...'}
              disabled={sending || (!!user && user.credits < 10)}
              className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || (!!user && user.credits < 10)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          {user && user.credits < 10 && (
            <p className="text-red-600 text-sm mt-2">
              You need at least 10 credits to send a message
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
