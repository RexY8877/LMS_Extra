# 🏠 Local MongoDB Setup Guide

This guide will help you install and set up MongoDB locally on your system.

## 📥 Download and Install MongoDB

### Windows
1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Download the `.msi` installer

2. **Install MongoDB**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

3. **Verify Installation**
   ```cmd
   mongod --version
   mongo --version
   ```

### macOS
1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if you don't have it
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB Service**
   ```bash
   brew services start mongodb-community
   ```

### Linux (Ubuntu/Debian)
1. **Import MongoDB GPG Key**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB Service**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## 🚀 Quick Start

### 1. Check if MongoDB is Running
```bash
# Windows
net start | findstr MongoDB

# macOS/Linux
brew services list | grep mongodb
# or
sudo systemctl status mongod
```

### 2. Test Connection
```bash
cd Backend
npm run db:test-connection
```

### 3. Setup Demo Data
```bash
npm run db:setup
```

### 4. Start Your Application
```bash
npm run dev
```

## 🔧 Common Commands

### Start MongoDB Service
```bash
# Windows (as Administrator)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Stop MongoDB Service
```bash
# Windows (as Administrator)
net stop MongoDB

# macOS
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

### Connect to MongoDB Shell
```bash
mongosh
# or older versions:
mongo
```

### Check MongoDB Status
```bash
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

## 📊 MongoDB Compass (GUI Tool)

MongoDB Compass is a graphical interface for MongoDB:

1. **Download**: https://www.mongodb.com/products/compass
2. **Connect**: Use connection string `mongodb://localhost:27017`
3. **Browse**: View your `lmss_db` database and collections

## 🎯 Demo Credentials

After running `npm run db:setup`, you'll have these accounts:

### Students
- **student1@demo.com** / password123 - Rahul Sharma
- **student2@demo.com** / password123 - Priya Patel
- **student3@demo.com** / password123 - Arjun Kumar
- **student4@demo.com** / password123 - Sneha Gupta
- **student5@demo.com** / password123 - Vikram Singh

### Faculty
- **faculty1@demo.com** / password123 - Dr. Priya Patel
- **faculty2@demo.com** / password123 - Prof. Rajesh Kumar
- **faculty3@demo.com** / password123 - Dr. Anjali Sharma
- **faculty4@demo.com** / password123 - Prof. Suresh Reddy

### Administrators
- **admin@demo.com** / password123 - College Admin
- **super@demo.com** / password123 - Super Admin

## 🔍 Troubleshooting

### MongoDB Won't Start
1. **Check if port 27017 is in use**
   ```bash
   netstat -an | findstr :27017
   ```

2. **Check MongoDB logs**
   - Windows: `C:\Program Files\MongoDB\Server\6.0\log\mongod.log`
   - macOS: `/usr/local/var/log/mongodb/mongo.log`
   - Linux: `/var/log/mongodb/mongod.log`

3. **Restart MongoDB service**
   ```bash
   # Windows
   net stop MongoDB && net start MongoDB
   
   # macOS
   brew services restart mongodb-community
   
   # Linux
   sudo systemctl restart mongod
   ```

### Connection Issues
1. **Verify MongoDB is listening**
   ```bash
   netstat -an | grep 27017
   ```

2. **Check firewall settings**
   - Ensure port 27017 is not blocked

3. **Test with MongoDB shell**
   ```bash
   mongosh mongodb://localhost:27017/lmss_db
   ```

### Permission Issues (Linux/macOS)
```bash
# Fix data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

## 📁 Default File Locations

### Windows
- **Installation**: `C:\Program Files\MongoDB\Server\6.0\`
- **Data**: `C:\data\db\`
- **Config**: `C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg`
- **Logs**: `C:\Program Files\MongoDB\Server\6.0\log\`

### macOS (Homebrew)
- **Installation**: `/usr/local/bin/`
- **Data**: `/usr/local/var/mongodb/`
- **Config**: `/usr/local/etc/mongod.conf`
- **Logs**: `/usr/local/var/log/mongodb/`

### Linux
- **Installation**: `/usr/bin/`
- **Data**: `/var/lib/mongodb/`
- **Config**: `/etc/mongod.conf`
- **Logs**: `/var/log/mongodb/`

## 🎉 Success Checklist

- [ ] MongoDB installed successfully
- [ ] MongoDB service is running
- [ ] Port 27017 is listening
- [ ] Connection test passes (`npm run db:test-connection`)
- [ ] Demo data imported (`npm run db:setup`)
- [ ] Application starts (`npm run dev`)
- [ ] Can login with demo credentials

## 🔗 Useful Links

- **MongoDB Documentation**: https://docs.mongodb.com/
- **MongoDB Community**: https://www.mongodb.com/community
- **MongoDB University**: https://university.mongodb.com/
- **MongoDB Compass**: https://www.mongodb.com/products/compass

---

**Need Help?** If you encounter any issues, check the troubleshooting section above or refer to the official MongoDB documentation.