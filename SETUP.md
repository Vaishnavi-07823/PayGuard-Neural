# PayGuard Neural - Setup & Quick Start

## 🚀 Quick Start Guide

### Frontend Setup

1. **Open the application:**
   - Login page: Open `login` file in your browser
   - Registration page: Open `registration.html` in your browser

2. **Key Features:**
   - Modern neural-themed UI with glassmorphism design
   - Real-time password strength validation
   - Form validation on both client and server
   - Secure registration with MongoDB

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure MongoDB:**
   ```bash
   # Copy environment template
   cp .env.example .env
   ```
   
   **Option A: Local MongoDB**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB: `mongod`
   - Update `.env`: `MONGODB_URI=mongodb://localhost:27017/payguard-neural`

   **Option B: MongoDB Atlas (Recommended for production)**
   - Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get connection string
   - Update `.env`: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payguard-neural`

3. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run at `http://localhost:5000`

4. **Test the setup:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 📋 API Endpoints

### Authentication (`/api/auth`)
- **POST** `/register` - Create new account
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }
  ```

- **POST** `/login` - Login to account
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```

- **GET** `/verify` - Check token validity (requires Bearer token)

- **POST** `/refresh-token` - Get new JWT token (requires Bearer token)

### Users (`/api/users`)
- **GET** `/profile` - Get user profile (requires Bearer token)
- **PUT** `/profile` - Update profile (requires Bearer token)
- **PUT** `/password` - Change password (requires Bearer token)
- **DELETE** `/account` - Delete account (requires Bearer token)

### Health Check
- **GET** `/api/health` - Check server and database status

## 🔐 Security Features

✅ **Password Security**
- Minimum 8 characters
- Requires uppercase, lowercase, number, and special character
- Real-time validation feedback

✅ **Authentication**
- JWT token-based authentication
- Secure password hashing with bcrypt
- Token expiration and refresh

✅ **Account Protection**
- Account lockout after 5 failed login attempts (30 minutes)
- Password strength requirements
- Email uniqueness validation

✅ **API Security**
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Request logging (Morgan)

## 📦 Technology Stack

**Frontend:**
- HTML5 / CSS3 / JavaScript
- Canvas API for neural particle effect
- Fetch API for HTTP requests

**Backend:**
- Node.js / Express
- MongoDB (Mongoose ODM)
- JWT for authentication
- Bcrypt for password hashing

**Dependencies:**
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `express-validator` - Input validation
- `cors` - Cross-origin requests
- `helmet` - Security headers
- `morgan` - Request logging

## 📁 Project Structure

```
PayGuard-Neural/
├── index.html              # Main landing page
├── login                   # Login page (no extension)
├── registration.html       # Registration page
├── kyc.html               # KYC verification page
├── style.css              # Global styles
├── README.md              # This file
├── backend/
│   ├── server.js          # Express server setup
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables (create from .env.example)
│   ├── .env.example       # Environment template
│   ├── .gitignore         # Git ignore rules
│   ├── README.md          # Backend documentation
│   ├── models/
│   │   └── User.js        # User data model
│   └── routes/
│       ├── auth.js        # Authentication endpoints
│       └── users.js       # User management endpoints
```

## 🔧 Environment Variables

Create `.env` file in `backend/` folder:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/payguard-neural

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing Registration

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Open registration page:**
   - Open `registration.html` in browser
   - Fill in the form with valid data
   - Password must have: uppercase, lowercase, number, special char (!@#$%^&*)

3. **Example valid registration:**
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Phone: +1 (555) 123-4567
   Company: Acme Inc
   Password: SecurePass123!
   ```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running: `mongod`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in `.env` or kill process: `lsof -ti:5000 | xargs kill -9`

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update `CORS_ORIGIN` in `.env` to match your frontend URL

### Email Already Exists
```
"email already registered"
```
**Solution:** Use a different email or delete the user from MongoDB

## 📚 Additional Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# View all registered users (from MongoDB)
# Connect to MongoDB and run: db.users.find()

# Clear all users
# Connect to MongoDB and run: db.users.deleteMany({})
```

## 🚀 Deployment

### Deploy to Heroku
```bash
# Install Heroku CLI
# Then:
heroku create payguard-neural
git push heroku main
```

### Deploy to Vercel (Frontend only)
```bash
npm install -g vercel
vercel
```

## 📞 Support

For issues or questions, check:
1. Console errors (F12 Developer Tools)
2. Backend logs (terminal output)
3. MongoDB connection status: `GET /api/health`

## 📄 License

MIT License - Feel free to use this project

---

**Last Updated:** 2024
**Version:** 1.0.0
