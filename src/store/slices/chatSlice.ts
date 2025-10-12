import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  _id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  creditsDeducted?: number;
  createdAt: string;
}

interface Chat {
  _id: string;
  userId: string;
  organizationId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
}

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  messages: [],
  loading: false,
  sending: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload);
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
      if (state.currentChatId === action.payload) {
        state.currentChatId = null;
        state.messages = [];
      }
    },
    setCurrentChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateChatTitle: (state, action: PayloadAction<{ chatId: string; title: string }>) => {
      const chat = state.chats.find(c => c._id === action.payload.chatId);
      if (chat) {
        chat.title = action.payload.title;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.sending = action.payload;
    }
  }
});

export const {
  setChats,
  addChat,
  removeChat,
  setCurrentChat,
  setMessages,
  addMessage,
  updateChatTitle,
  setLoading,
  setSending
} = chatSlice.actions;

export default chatSlice.reducer;
