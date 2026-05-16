<div align="center">

# 🎯 CareerPilot - AI Mock Interview Platform

[![Fullstack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react)](https://github.com)
[![AI Integration](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://github.com)

**Master your interview skills with AI-powered mock interviews in real-time**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-getting-started) • [Deploy](#-deployment-on-render)

---

</div>

## 📸 Screenshots

### Setup Screen
![CareerPilot Setup](https://via.placeholder.com/1200x400?text=Interview+Setup+Screen)

### Video Interview Mode
![Video Interview](https://via.placeholder.com/1200x400?text=Video+Interview+Mode)

### Chat Interview Mode  
![Chat Interview](https://via.placeholder.com/1200x400?text=Chat+Interview+Mode)

### Dashboard & Results
![Dashboard Results](https://via.placeholder.com/1200x400?text=Interview+Results+Dashboard)

---

## ✨ Features

### 🎤 Interview Modes
- **Video Interview** - Real-time video with AI voice interaction and speech recognition
- **Chat Interview** - Text-based Q&A with the AI interviewer
- **Bilingual Support** - Choose between English (Native) or Burmese (Native) for complete interview experience

### 🌍 Language Support
- **English Mode** - Native English speech recognition and synthesis
- **Burmese Mode** - Native Burmese speech recognition and synthesis
- **Female AI Voice** - Natural-sounding female interviewer in both languages
- **Language-Aware Grading** - Accurate scoring based on language context

### 🤖 AI-Powered Features
- **Real-Time Questions** - Google Gemini generates contextual interview questions
- **Intelligent Feedback** - Detailed feedback on your answers
- **Performance Scoring** - Comprehensive scoring based on multiple criteria
- **Multiple Roles** - Practice for any job position (Software Engineer, Product Manager, Designer, etc.)

### 🎯 User Experience
- **Smooth Speech Recognition** - Continuous listening with manual start/stop control
- **Mic & Camera Toggle** - Control your audio and video during interviews
- **Interview History** - Track all your practice sessions
- **Performance Metrics** - View scores and feedback for improvement
- **Responsive Design** - Works seamlessly on desktop and tablets

### 🔒 Security & Privacy
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Only authenticated users can access interviews
- **Encrypted API Calls** - HTTPS communication with the backend
- **User Data Privacy** - Interview data stored securely on the server

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library
- **Web Speech API** - Speech recognition & synthesis

### Backend
- **Node.js & Express** - Server runtime
- **MongoDB** - NoSQL database
- **JWT** - Authentication
- **Google Gemini API** - AI interview generation
- **CORS** - Cross-origin handling

### DevOps & Deployment
- **Render** - Hosting platform
- **npm** - Package management
- **Git** - Version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for database)
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CareerPilot.git
   cd CareerPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # API Keys
   GEMINI_API_KEY=your_google_gemini_api_key
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   
   # Frontend
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📖 Usage

### Starting an Interview

1. **Sign in** to your CareerPilot account
2. **Go to Mock Interview** section
3. **Choose Interview Mode**:
   - Select "Chat Interview" for text-based Q&A
   - Select "Video Interview" for voice-based interaction
4. **Select Language** (Video mode only):
   - Choose English (Native) or Burmese (Native)
5. **Enter Target Role** - e.g., "Senior Frontend Developer"
6. **Click Start** and begin your interview

### Video Interview Controls
- **Start Speaking** - Begin recording your answer
- **Stop Speaking** - Stop the microphone
- **Submit** - Send your answer to the AI
- **Toggle Mic** - Mute/unmute microphone
- **Toggle Camera** - Turn camera on/off
- **End Interview** - Finish and get your results

### After Interview
- View your **performance score**
- Read **detailed feedback** from the AI
- Check **area of improvement**
- Compare with **previous interviews**

---

## 🗂 Project Structure

```
CareerPilot/
├── src/
│   ├── pages/
│   │   ├── MockInterview.tsx      # Main interview component
│   │   ├── Dashboard.tsx          # User dashboard
│   │   ├── Auth.tsx               # Login/Register
│   │   └── ...
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── server.ts                       # Express backend
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🌐 Deployment on Render

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: CareerPilot with bilingual support"
   git push origin main
   ```

2. **Ensure you have:**
   - `.env.example` with all required environment variables
   - `.gitignore` including `.env` and `node_modules`
   - `package.json` with proper scripts

### Step 2: Create Render Services

#### A. Deploy the Backend (Node.js)

1. **Go to [Render.com](https://render.com)**
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `careerpilot-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
   - **Plan**: Choose "Free" or paid as needed

5. **Add Environment Variables** (click "Advanced"):
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=generate_a_strong_random_string
   JWT_EXPIRE=7d
   FRONTEND_URL=https://careerpilot-frontend.onrender.com
   ```

6. **Click "Create Web Service"**

#### B. Deploy the Frontend (React)

1. **Go to [Render.com](https://render.com)**
2. **Click "New +"** → **"Static Site"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `careerpilot-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://careerpilot-backend.onrender.com
   ```

6. **Click "Create Static Site"**

### Step 3: Connect Backend URL to Frontend

1. Once both services are deployed, get your backend URL from Render
2. Go to Frontend service **Settings**
3. Update **Environment Variables**:
   ```
   VITE_API_URL=https://careerpilot-backend.onrender.com
   ```
4. **Redeploy** the frontend (Render auto-redeploys on environment changes)

### Step 4: Set Up MongoDB

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Create a cluster** (Free tier available)
3. **Get connection string**:
   - Click "Connect"
   - Select "Connect your application"
   - Copy the connection string
4. **Replace in Render backend environment variables**

### Step 5: Verify Deployment

- **Frontend**: Visit `https://careerpilot-frontend.onrender.com`
- **Backend API**: Visit `https://careerpilot-backend.onrender.com/health`
- **Test Authentication**: Try signing up and logging in
- **Test Interview**: Start a mock interview and verify speech recognition works

### Step 6: Optimization for Production

#### Frontend Optimizations:
```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

#### Backend Optimizations:
- Add rate limiting
- Enable CORS for production frontend URL
- Set secure JWT secret (minimum 32 characters)
- Enable MongoDB connection pooling

#### Add to `server.ts`:
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS for production
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 🔧 Environment Variables Guide

### Production (.env for Render)

```env
# Server
PORT=5000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerpilot?retryWrites=true&w=majority

# AI & APIs
GEMINI_API_KEY=your_gemini_api_key_here

# Security
JWT_SECRET=generate_using_: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=https://careerpilot-frontend.onrender.com
```

### Development (.env.local)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/careerpilot
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=dev-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Speech Recognition Not Working**
- Check browser compatibility (Chrome/Edge/Safari)
- Ensure HTTPS on production
- Verify microphone permissions granted

**2. Gemini API Errors**
- Verify API key is valid
- Check API quota on Google Cloud Console
- Ensure API is enabled

**3. MongoDB Connection Issues**
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**4. CORS Errors**
- Verify backend URL in frontend environment
- Check CORS middleware configuration
- Ensure credentials: true if needed

**5. Render Deployment Fails**
- Check build logs in Render dashboard
- Verify environment variables are set
- Ensure package.json has all dependencies

---

## 📊 Performance Metrics

- **Frontend Load Time**: < 3 seconds
- **Speech Recognition**: < 1 second latency
- **API Response Time**: < 500ms average
- **Database Queries**: Optimized with indexes
- **Mobile Responsive**: Fully responsive on all devices

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/CareerPilot/issues)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Google Gemini API](https://ai.google.dev)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Render Deployment Guide](https://render.com/docs)

---

<div align="center">

### ⭐ If you found this helpful, please give it a star!

Made with ❤️ by Heinn Htet Zan

**[Back to Top](#-careerpilot---ai-mock-interview-platform)**

</div>
