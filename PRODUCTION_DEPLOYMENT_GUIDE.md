# Production Deployment Guide

## 🎯 **Migration Strategy: Demo → Production**

This guide shows you how to transition from demo accounts to real user accounts for production deployment.

## 📋 **Pre-Deployment Checklist**

### Phase 1: Infrastructure Setup
- [ ] Set up production MongoDB database
- [ ] Configure production environment variables
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure production domain/hosting
- [ ] Set up monitoring and logging
- [ ] Configure backup systems

### Phase 2: Security Hardening
- [ ] Remove demo credentials
- [ ] Implement proper password hashing
- [ ] Set up rate limiting
- [ ] Configure CORS for production domain
- [ ] Implement input validation
- [ ] Set up authentication middleware

### Phase 3: Feature Migration
- [ ] Enable real database routes
- [ ] Implement user registration
- [ ] Set up email verification
- [ ] Configure password reset
- [ ] Implement role-based permissions

---

## 🔧 **Step-by-Step Migration Process**

### Step 1: Environment Configuration

**Current Demo Setup:**
```env
# Backend/.env (Demo)
DEMO_MODE=true
JWT_SECRET=demo_jwt_secret_key
PORT=5000
```

**Production Setup:**
```env
# Backend/.env (Production)
DEMO_MODE=false
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms_production

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here

# Email (for verification/reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Step 2: Database Migration

**A. Set up Production Database:**
```bash
# 1. Create production MongoDB database
# 2. Update connection string in .env
# 3. Run database setup
cd Backend
npm run db:setup
```

**B. Remove Demo Data (Optional):**
```javascript
// Backend/controllers/authController.js
// Remove or comment out demo user logic:

// REMOVE THIS BLOCK IN PRODUCTION:
/*
if (isDemoUser(email)) {
  const demoUser = getDemoUser(email);
  // ... demo login logic
}
*/
```

### Step 3: Enable Real Routes

**Current (Demo Mode):**
```javascript
// Backend/index.js (Demo)
// app.use('/api/student', require('./routes/studentRoutes'));
// app.use('/api/faculty', require('./routes/facultyRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
```

**Production:**
```javascript
// Backend/index.js (Production)
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/super-admin', require('./routes/superAdminRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/execute', require('./routes/executionRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
```

### Step 4: Frontend Configuration

**Update API endpoints:**
```typescript
// Frontend/src/services/api.ts (Create new file)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com/api'
  : 'http://localhost:5000/api';

// Replace demo API calls with real API calls
export const studentApi = {
  getDashboard: () => apiCall('/student/dashboard'),  // Not /demo/student/dashboard
  // ... other endpoints
};
```

**Remove demo credentials from login page:**
```typescript
// Frontend/src/pages/LoginPage.tsx
// REMOVE OR COMMENT OUT:
/*
const demoCredentials = [
  { label: 'Student', email: 'student@demo.com', role: 'student' },
  // ... other demo credentials
];
*/
```

### Step 5: Security Enhancements

**A. Implement Proper Password Hashing:**
```javascript
// Backend/models/User.js (Already implemented)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12); // Increase rounds for production
  this.password = await bcrypt.hash(this.password, salt);
});
```

**B. Add Rate Limiting:**
```javascript
// Backend/middleware/rateLimiter.js (Create new file)
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };
```

**C. Configure CORS for Production:**
```javascript
// Backend/index.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 🔄 **Migration Strategies**

### Strategy 1: Complete Cutover (Recommended for New Apps)
1. Set `DEMO_MODE=false`
2. Enable all real routes
3. Remove demo login buttons
4. Deploy to production

### Strategy 2: Gradual Migration (For Existing Users)
1. Keep demo accounts active initially
2. Add user registration functionality
3. Gradually migrate users to real accounts
4. Remove demo accounts after migration

### Strategy 3: Hybrid Mode (For Development/Staging)
1. Keep demo accounts for testing
2. Add real user functionality alongside
3. Use environment variables to control visibility

---

## 🛡️ **Security Checklist**

### Authentication & Authorization
- [ ] Remove demo credentials from production
- [ ] Implement strong password requirements
- [ ] Add email verification for new accounts
- [ ] Set up password reset functionality
- [ ] Implement session management
- [ ] Add role-based access control

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS for all communications
- [ ] Implement input validation and sanitization
- [ ] Set up SQL injection protection
- [ ] Configure XSS protection headers

### Infrastructure Security
- [ ] Set up firewall rules
- [ ] Configure database access restrictions
- [ ] Implement logging and monitoring
- [ ] Set up automated backups
- [ ] Configure error handling (don't expose stack traces)

---

## 📊 **Deployment Environments**

### Development
```env
DEMO_MODE=true
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lms_dev
```

### Staging
```env
DEMO_MODE=false
NODE_ENV=staging
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lms_staging
```

### Production
```env
DEMO_MODE=false
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lms_production
```

---

## 🚀 **Deployment Commands**

### Local to Staging
```bash
# 1. Update environment
cp .env.staging .env

# 2. Install dependencies
npm install --production

# 3. Run database migrations
npm run db:setup

# 4. Start application
npm start
```

### Staging to Production
```bash
# 1. Update environment
cp .env.production .env

# 2. Build frontend
cd Frontend && npm run build

# 3. Deploy backend
cd Backend && npm start

# 4. Configure reverse proxy (nginx/apache)
# 5. Set up SSL certificates
# 6. Configure domain DNS
```

---

## 🔍 **Testing Production Setup**

### Pre-Deployment Tests
```bash
# 1. Test database connection
npm run db:test-connection

# 2. Test API endpoints
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"SecurePass123","role":"student"}'

# 3. Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

### Post-Deployment Verification
- [ ] User registration works
- [ ] Email verification works
- [ ] Password reset works
- [ ] All role-based features work
- [ ] Database is properly secured
- [ ] SSL certificates are valid
- [ ] Monitoring is active

---

## 📝 **Migration Timeline**

### Week 1: Infrastructure
- Set up production database
- Configure hosting environment
- Set up SSL and domain

### Week 2: Backend Migration
- Update environment variables
- Enable real database routes
- Implement security features

### Week 3: Frontend Migration
- Update API endpoints
- Remove demo credentials
- Add user registration UI

### Week 4: Testing & Launch
- Comprehensive testing
- Security audit
- Production deployment

---

## 🆘 **Rollback Plan**

If issues occur during deployment:

1. **Immediate Rollback:**
   ```bash
   # Revert to demo mode
   echo "DEMO_MODE=true" > .env
   npm restart
   ```

2. **Database Rollback:**
   ```bash
   # Restore from backup
   mongorestore --uri="mongodb://..." --drop backup/
   ```

3. **Frontend Rollback:**
   ```bash
   # Deploy previous version
   git checkout previous-stable-tag
   npm run build && npm run deploy
   ```

---

## 🎯 **Success Metrics**

Track these metrics post-deployment:
- User registration rate
- Login success rate
- Feature adoption rate
- System performance metrics
- Security incident count
- User satisfaction scores

---

**Remember:** Always test thoroughly in a staging environment before deploying to production!