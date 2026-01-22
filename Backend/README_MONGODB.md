# 🌐 Network MongoDB Setup - Complete Guide

## 🎯 Current Configuration

Your system is configured for **network-based MongoDB** connection.

## 🔧 Configuration Required

### 1. Update Connection String

Edit `Backend/.env` and replace the placeholder with your actual MongoDB details:

```env
# Replace these values with your actual MongoDB connection details
MONGODB_URI=mongodb://your_username:your_password@your_mongodb_host:27017/lmss_db?authSource=admin
```

### 2. Common Network MongoDB Formats

**Self-hosted MongoDB:**
```env
MONGODB_URI=mongodb://admin:password123@192.168.1.100:27017/lmss_db?authSource=admin
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lmss_db?retryWrites=true&w=majority
```

**Docker MongoDB:**
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/lmss_db?authSource=admin
```

## 🚀 Setup Steps

### 1. Test Connection
```bash
cd Backend
npm run db:test-connection
```

### 2. Setup Demo Data
```bash
npm run db:setup
```

### 3. Start Your Application
```bash
npm run dev
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:test-connection` | Test network MongoDB connection |
| `npm run db:setup` | Create database and import demo data |
| `npm run dev` | Start the development server |

## 🎯 Demo Credentials

### 👨‍🎓 Students
- **student1@demo.com** / password123 - Rahul Sharma
- **student2@demo.com** / password123 - Priya Patel
- **student3@demo.com** / password123 - Arjun Kumar
- **student4@demo.com** / password123 - Sneha Gupta
- **student5@demo.com** / password123 - Vikram Singh

### 👨‍🏫 Faculty
- **faculty1@demo.com** / password123 - Dr. Priya Patel
- **faculty2@demo.com** / password123 - Prof. Rajesh Kumar
- **faculty3@demo.com** / password123 - Dr. Anjali Sharma
- **faculty4@demo.com** / password123 - Prof. Suresh Reddy

### 👨‍💼 Administrators
- **admin@demo.com** / password123 - College Admin
- **super@demo.com** / password123 - Super Admin

## 🔧 Network Configuration

Your system includes robust network MongoDB support:

- ✅ **Connection Pooling** - Optimized for network connections
- ✅ **Automatic Reconnection** - Handles network interruptions
- ✅ **Timeout Management** - Proper timeout handling
- ✅ **Error Recovery** - Comprehensive error handling
- ✅ **Authentication Support** - Username/password authentication
- ✅ **SSL/TLS Support** - Secure connections

## 📊 What's Included

After running `npm run db:setup`, your database will have:

- ✅ **11 Demo Users** (5 students, 4 faculty, 2 admins)
- ✅ **Student Dashboard Data** with progress metrics
- ✅ **Faculty Dashboard Data** with course information
- ✅ **14 Coding Problems** with test cases and templates
- ✅ **College Analytics Data**
- ✅ **Platform Statistics**
- ✅ **Leaderboard Data**

## 🎉 Features Ready to Use

### For Students
- Coding practice with 14 problems
- Progress tracking and analytics
- Skill assessments
- Leaderboard rankings

### For Faculty
- Student monitoring dashboard
- Course and content management
- Assignment creation and grading
- File upload system (PDFs, videos)
- Analytics and reporting

### For Admins
- College-wide analytics
- User management
- Platform statistics

## 🔍 Troubleshooting Network Issues

### Connection Timeout
```
Error: MongoServerSelectionError: connection timed out
```
**Solutions:**
- Check if MongoDB server is running on the network
- Verify network connectivity to MongoDB server
- Check firewall settings
- Ensure correct host and port in connection string

### Authentication Failed
```
Error: MongoServerError: Authentication failed
```
**Solutions:**
- Verify username and password in connection string
- Check if user has proper permissions on the database
- Ensure correct authSource (usually 'admin')
- Test connection with MongoDB Compass first

### Network Unreachable
```
Error: MongoNetworkError: failed to connect to server
```
**Solutions:**
- Check if MongoDB port (usually 27017) is open
- Verify the host address is correct
- Test network connectivity: `telnet your-mongodb-host 27017`
- Check VPN/proxy settings

### DNS Resolution Issues
```
Error: getaddrinfo ENOTFOUND your-mongodb-host
```
**Solutions:**
- Verify the hostname is correct
- Check DNS resolution
- Try using IP address instead of hostname
- Ensure network connectivity

## 📁 File Storage

The system includes a complete file storage service:
- **Local Development**: Files stored in `Backend/uploads/`
- **File Validation**: Type and size checking
- **Malware Scanning**: ClamAV integration (optional)
- **Signed URLs**: Secure file access with expiration
- **Production Ready**: AWS S3 support available

## 🌐 API Endpoints

Once the server is running, you'll have access to:
- Authentication endpoints
- Student dashboard APIs
- Faculty management APIs
- File upload and management
- Coding problem execution
- Analytics and reporting

## 📖 Additional Resources

- `MONGODB_SETUP_GUIDE.md` - Comprehensive network MongoDB setup guide
- `QUICK_SETUP.md` - Quick reference for network setup
- `LOCAL_MONGODB_SETUP.md` - Local MongoDB installation (if needed)

## 🎊 Network MongoDB Ready!

Your network MongoDB setup includes:
- ✅ Network MongoDB connection with authentication
- ✅ Robust connection handling and error recovery
- ✅ Demo data and users
- ✅ File storage service
- ✅ Complete LMS functionality
- ✅ Faculty tools and course management

**Next Step:** Update your `.env` file with your actual MongoDB connection details and run the setup commands above! 🚀