# Demo Setup Guide - No MongoDB Required!

## Quick Demo Setup (No Database Needed)

This guide shows you how to run the demo with **zero database setup**. Perfect for development, testing, and demonstrations.

## 🚀 Super Quick Start

### Step 1: Environment Setup
Create or update `Backend/.env`:

```env
# Demo Mode - No MongoDB required!
DEMO_MODE=true
JWT_SECRET=demo_jwt_secret_key
PORT=5000

# MongoDB settings (not needed in demo mode, but keep for future)
# MONGODB_URI=mongodb://localhost:27017/lms_platform
```

### Step 2: Start Backend
```bash
cd Backend
npm install  # if not already done
npm run dev
```

You should see:
```
Running in DEMO MODE - MongoDB connection skipped
Server running on port 5000
```

### Step 3: Start Frontend
```bash
cd Frontend
npm install  # if not already done
npm run dev
```

### Step 4: Login with Demo Accounts
Open http://localhost:5173 and use the demo buttons:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Student** | `student@demo.com` | `demo123` | Dashboard, Coding Practice, Progress |
| **Faculty** | `faculty@demo.com` | `demo123` | Course Management, Reviews, Analytics |
| **College Admin** | `admin@demo.com` | `demo123` | College Analytics, Student Management |
| **Super Admin** | `super@demo.com` | `demo123` | Platform Analytics, Multi-college View |

## ✨ What Works in Demo Mode

### ✅ **Fully Functional Features**
- **Authentication**: Login/logout with demo accounts
- **Role-based Dashboards**: Different views for each user type
- **Student Features**:
  - Personal dashboard with progress tracking
  - Coding practice with 2 sample problems
  - Skill breakdown and weekly progress charts
  - AI recommendations and upcoming assessments
- **Faculty Features**:
  - Faculty dashboard with pending reviews
  - Batch progress monitoring
  - Recent submissions overview
- **College Admin Features**:
  - College-wide analytics and metrics
  - Batch-wise performance data
  - High-risk student identification
- **Super Admin Features**:
  - Platform-wide statistics
  - Multi-college comparison
  - Growth metrics and usage analytics
- **Coding Practice**:
  - Browse coding problems
  - Submit solutions (simulated execution)
  - View submission results
- **Leaderboard**: Sample competitive rankings

### 🔄 **Hybrid Architecture Benefits**
- **No Database Setup**: Works immediately without MongoDB
- **Production Ready**: Easy to switch to real database later
- **Full Feature Testing**: All UI components and workflows work
- **Development Friendly**: Perfect for frontend development
- **Demo Safe**: No risk of data corruption or setup issues

## 🔧 Advanced Configuration

### Switch to Production Mode
When ready for real users, update `.env`:

```env
DEMO_MODE=false
MONGODB_URI=mongodb://localhost:27017/lms_platform
# or your cloud MongoDB connection string
```

Then run the database seeder:
```bash
npm run db:setup
```

### API Endpoints

Demo mode provides these endpoints:
- `POST /api/auth/login` - Handles both demo and real users
- `GET /api/demo/student/dashboard` - Student data
- `GET /api/demo/faculty/dashboard` - Faculty data  
- `GET /api/demo/college/analytics` - College analytics
- `GET /api/demo/platform/analytics` - Platform analytics
- `GET /api/demo/coding/problems` - Coding problems
- `POST /api/demo/coding/submit` - Code submission
- `GET /api/demo/leaderboard` - Leaderboard data

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is free
netstat -an | findstr :5000

# Try different port
PORT=3001 npm run dev
```

### Frontend Can't Connect
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_BASE_URL in `Frontend/src/services/demoApi.ts`

### Demo Login Not Working
- Check browser network tab for API calls
- Verify demo credentials exactly match:
  - `student@demo.com` / `demo123`
  - `faculty@demo.com` / `demo123`
  - `admin@demo.com` / `demo123`
  - `super@demo.com` / `demo123`

## 🎯 Perfect For

- **Demos & Presentations**: Show full functionality instantly
- **Frontend Development**: Work on UI without database setup
- **Testing**: Validate user flows and features
- **Onboarding**: New developers can start immediately
- **CI/CD**: Run tests without database dependencies

## 🚀 Next Steps

1. **Explore Features**: Login as different roles to see all dashboards
2. **Customize Demo Data**: Edit `Backend/data/demoData.js` to modify sample data
3. **Add Real Features**: Implement actual functionality using the demo structure
4. **Scale Up**: Switch to production mode when ready for real users

**No MongoDB, No Problem!** 🎉