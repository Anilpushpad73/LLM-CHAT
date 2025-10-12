# LLM Chat Platform

A complete full-stack chat platform with AI integration, user authentication, organization management, and real-time notifications.

## Features

- **Authentication**: Username/password and Google OAuth support
- **Chat Interface**: ChatGPT-style UI with persistent chat history
- **Credit System**: Token-based credit system with usage tracking
- **Organization Management**: Create, rename, and switch between organizations
- **Member Invitations**: Invite members via email
- **Real-Time Notifications**: WebSocket-based notification system
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- React Router for routing
- Tailwind CSS for styling
- Lucide React for icons
- Socket.IO Client for real-time features
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for WebSocket connections
- JWT for authentication
- Bcrypt for password hashing
- OpenAI API integration

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- OpenAI API key (optional, for AI responses)

### 1. Configure Environment Variables

Edit the `.env` file with your credentials:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatplatform?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

#### Option A: Run frontend and backend separately

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run server
```

#### Option B: Run both together
```bash
npm run dev:all
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usage

### First Time Setup
1. Navigate to http://localhost:5173
2. Click "Sign up" to create a new account
3. Fill in username, email, and password
4. A default organization will be created automatically
5. You'll be redirected to the chat interface

### Chat Features
- Click "New Chat" to start a conversation
- Type your message and press Enter or click Send
- Each message costs 10 credits
- View remaining credits in the top bar

### Organization Management
1. Click the organization button in the sidebar
2. Switch between organizations or create new ones
3. Invite members by email
4. Rename organizations (admin only)

### Notifications
- Click the bell icon to view notifications
- Notifications appear in real-time via WebSocket
- Mark notifications as read individually or all at once

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Chat
- `POST /api/chat/create` - Create new chat
- `GET /api/chat/list` - Get user's chats
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/message` - Send message
- `DELETE /api/chat/:chatId` - Delete chat

### Organization
- `GET /api/organization/list` - Get user's organizations
- `GET /api/organization/:orgId` - Get organization details
- `POST /api/organization/create` - Create organization
- `PUT /api/organization/:orgId/rename` - Rename organization
- `POST /api/organization/:orgId/invite` - Invite member
- `PUT /api/organization/switch/:orgId` - Switch active organization

### Notifications
- `GET /api/notification/list` - Get notifications
- `PUT /api/notification/:notificationId/read` - Mark as read
- `PUT /api/notification/read-all` - Mark all as read
- `POST /api/notification/send-global` - Send global notification
- `POST /api/notification/send-user` - Send user notification

## Database Schema

### User
- username, email, password
- googleId (for OAuth)
- credits (default: 1000)
- activeOrganizationId

### Organization
- name
- members (userId, role, joinedAt)
- invitations (email, invitedBy, status)

### Chat
- userId, organizationId
- title

### Message
- chatId, role (user/assistant)
- content, tokensUsed, creditsDeducted

### Notification
- userId (optional, for targeted)
- type (global/user)
- title, message, read status

## Development Notes

- The app uses simulated AI responses if OPENAI_API_KEY is not configured
- Email invitations are stored in the database but not actually sent
- Default user credit balance is 1000
- Each chat message costs 10 credits

## Production Deployment

1. Set up MongoDB Atlas production cluster
2. Configure production environment variables
3. Build the frontend: `npm run build`
4. Deploy backend to a Node.js hosting service
5. Deploy frontend build to a static hosting service
6. Update CORS settings in backend for production domain

## Troubleshooting

- **MongoDB connection error**: Check your MONGODB_URI
- **Credits not updating**: Ensure backend is running
- **Notifications not appearing**: Check Socket.IO connection
- **Login issues**: Verify JWT_SECRET is set
