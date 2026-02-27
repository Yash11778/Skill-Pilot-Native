# Skill Pilot Mobile - React Native App

A comprehensive career development and learning platform built with React Native and Expo.

## Features

- 🔐 **Authentication**: Login & Registration with JWT
- 📊 **Dashboard**: Personalized learning dashboard
- 📝 **Assessments**: Career and skill assessments
- 🎯 **Career Paths**: AI-powered career recommendations
- 📚 **Courses**: Course recommendations and tracking
- 💬 **AI Mentor**: Chat with AI career advisor
- 👥 **Mentorship**: Connect with industry mentors
- 📱 **Responsive**: Beautiful mobile UI with modern design

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Redux Toolkit** for state management
- **Axios** for API calls
- **AsyncStorage** for local storage
- **React Native Vector Icons** (Ionicons)
- **Expo Linear Gradient** for beautiful gradients

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Backend server running (see Backend setup below)

## Installation

1. **Install Dependencies**
   ```bash
   cd "Skill Pilot Phone React Native"
   npm install
   ```

2. **Configure Backend URL**
   
   Edit `src/services/api.ts` and update the API_BASE_URL:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5001/api';
   ```
   
   **Important**: 
   - For Android Emulator, use your computer's IP address (not localhost)
   - For iOS Simulator, you can use `http://localhost:5001/api`
   - To find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

3. **Start the Backend Server**
   
   Navigate to the backend folder:
   ```bash
   cd "../Web Venture/Skill Pilot/Backend"
   npm install
   node server.js
   ```

4. **Start the Expo Dev Server**
   ```bash
   npm start
   ```

## Running the App

After running `npm start`, you'll see options:

- **Press `i`** - Run on iOS Simulator
- **Press `a`** - Run on Android Emulator
- **Scan QR Code** - Run on your physical device using Expo Go app

## Project Structure

```
Skill Pilot Phone React Native/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with Redux Provider
│   ├── index.tsx                # Splash/Initial screen
│   ├── (auth)/                  # Auth routes
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (dashboard)/             # Dashboard routes (Tab Navigator)
│   │   ├── index.tsx           # Dashboard home
│   │   ├── assessments.tsx
│   │   ├── careers.tsx
│   │   ├── courses.tsx
│   │   ├── profile.tsx
│   │   ├── ai-chat.tsx
│   │   └── mentorship.tsx
│   └── setup/                   # Profile setup
│       └── index.tsx
├── src/
│   ├── services/                # API services
│   │   ├── api.ts              # Axios instance
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   └── assessmentService.ts
│   └── store/                   # Redux store
│       ├── index.ts            # Store configuration
│       └── slices/             # Redux slices
│           ├── authSlice.ts
│           ├── userSlice.ts
│           ├── assessmentSlice.ts
│           ├── careerSlice.ts
│           ├── courseSlice.ts
│           ├── mentorSlice.ts
│           ├── aiSlice.ts
│           └── uiSlice.ts
├── app.json                     # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Features Overview

### 1. Authentication
- User registration with email/password
- Login with JWT token
- Persistent authentication using AsyncStorage
- Auto-redirect based on auth state

### 2. Dashboard
- Personalized stats (courses, hours, points)
- Quick action buttons
- Recent activity feed
- Continue learning section

### 3. Assessments
- Personality, Skills, Career Interests, Aptitude tests
- Track completed assessments
- View results and scores

### 4. Career Paths
- AI-matched career recommendations
- Salary ranges and growth projections
- Career exploration tools

### 5. Courses
- Course recommendations
- Progress tracking
- Platform integration (Coursera, Udemy, etc.)

### 6. AI Mentor
- Real-time chat interface
- Career guidance and advice
- Skill gap analysis

### 7. Mentorship
- Browse industry mentors
- Request mentorship sessions
- View mentor profiles and ratings

### 8. Profile Setup
- Multi-step onboarding
- Education, skills, interests, and goals
- Progress indicator

## API Integration

The app connects to the backend API at `http://YOUR_IP:5001/api`:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **User**: `/api/user/profile`, `/api/user/dashboard`
- **Assessment**: `/api/assessment`, `/api/assessment/{id}/submit`
- **And more...**

## Troubleshooting

### Cannot connect to backend
- Make sure backend is running on port 5001
- Check that API_BASE_URL uses your computer's IP, not localhost
- Verify firewall isn't blocking the connection

### App crashes on startup
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Redux Persist issues
- Clear AsyncStorage in Expo Go app settings
- Or run: `expo start -c` to clear cache

## Development Tips

1. **Hot Reload**: Enable Fast Refresh for instant updates
2. **Debugging**: Shake device to open dev menu
3. **Network**: Use Redux DevTools for state debugging
4. **Logs**: Check console for API errors

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Coding! 🚀**
