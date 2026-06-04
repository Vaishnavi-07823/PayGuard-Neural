# PayGuard Neural Backend

AI-powered payment security backend with MongoDB integration.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/payguard-neural
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   mongod
   
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payguard-neural
   ```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh-token` - Refresh JWT token

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account
- `GET /api/users/:id` - Get user by ID

#### Health
- `GET /api/health` - Check server and database status

### User Model

The User model includes the following fields:

```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: String (optional),
  company: String (optional),
  password: String (required, hashed),
  role: String (user, admin, merchant),
  isEmailVerified: Boolean,
  twoFactorEnabled: Boolean,
  status: String (active, inactive, suspended),
  lastLogin: Date,
  loginAttempts: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Security Features

✓ Password hashing with bcrypt
✓ JWT authentication
✓ Account lockout after failed login attempts
✓ Password complexity requirements
✓ CORS protection
✓ Helmet security headers
✓ Input validation and sanitization

### Testing

Run tests:
```bash
npm test
```

### Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible on your network

**Port already in use:**
- Change PORT in `.env` to an available port
- Or kill the process using the port

**CORS errors:**
- Ensure CORS_ORIGIN in `.env` matches your frontend URL
- For development: `http://localhost:3000`

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/payguard-neural" --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017/payguard-neural" ./backup
```

### Performance Considerations

- Indexes on email and createdAt fields for faster queries
- Password selected out by default to reduce data transfer
- JWT tokens for stateless authentication
- Connection pooling through Mongoose

### Future Enhancements

- Two-factor authentication
- Email verification
- Password reset functionality
- OAuth2 integration
- API rate limiting
- Request logging and monitoring
- Audit trails

---

For more information, visit the main [README](../README.md)
