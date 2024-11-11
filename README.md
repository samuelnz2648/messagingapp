# Real-Time Messaging Application

A full-stack real-time messaging application built with React, Node.js, Express, Socket.IO, and MongoDB. The application features real-time chat functionality, private rooms, user authentication, and message persistence.

## Features

### Authentication & User Management
- User registration with secure password requirements
- JWT-based authentication
- Secure session management
- User profile management

### Chat Functionality
- Real-time messaging using Socket.IO
- Public and private chat rooms
- Message editing and deletion
- Read receipts
- Typing indicators
- Message history persistence
- System messages for user join/leave events

### Room Management
- Create public/private chat rooms
- Join/leave room functionality
- Room member management
- Real-time room updates

### UI/UX Features
- Responsive design using Tailwind CSS
- Clean and modern interface
- Real-time status indicators
- Loading states and animations
- Error handling and feedback

## Technology Stack

### Frontend
- React.js
- Socket.IO Client
- React Router for navigation
- Styled Components
- Tailwind CSS
- Axios for HTTP requests

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Development Tools
- ESLint
- Prettier
- Nodemon
- Create React App

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or later)
- MongoDB (v4.4 or later)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd messaging-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/messagingapp
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user profile
- `GET /api/auth/users` - Get all users
- `GET /api/auth/user-rooms` - Get user's rooms

### Room Endpoints
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - Get all public rooms
- `GET /api/rooms/:id` - Get specific room
- `POST /api/rooms/:id/join` - Join a room
- `POST /api/rooms/:id/leave` - Leave a room

### Message Endpoints
- `GET /api/messages/:room` - Get messages for a room
- `POST /api/messages/:messageId/read` - Mark message as read

## Socket.IO Events

### Client Events
- `joinRoom` - Join a chat room
- `leaveRoom` - Leave a chat room
- `chatMessage` - Send a message
- `editMessage` - Edit a message
- `deleteMessage` - Delete a message
- `typing` - Emit typing status
- `markMessageRead` - Mark message as read

### Server Events
- `message` - New message received
- `messageUpdated` - Message edited
- `messageDeleted` - Message deleted
- `userTyping` - User typing status
- `messageRead` - Message read status
- `userJoinedRoom` - User joined notification
- `userLeftRoom` - User left notification

## Project Structure

```
messaging-app/
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── utils/         # Utility functions
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # Context providers
│       ├── hooks/       # Custom hooks
│       └── styles/      # Styled components
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- XSS protection
- Rate limiting
- CORS configuration

## Error Handling

The application implements comprehensive error handling:
- API error responses
- Socket connection error handling
- Form validation errors
- Network error handling
- Authentication error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
