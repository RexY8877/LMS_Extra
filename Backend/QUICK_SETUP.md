# 🌐 Network MongoDB Setup Guide

## Step 1: Configure Network MongoDB Connection

Edit `Backend/.env` and update the MongoDB connection string:

```env
# Replace with your actual network MongoDB details
MONGODB_URI=mongodb://your_username:your_password@your_mongodb_host:27017/lmss_db?authSource=admin
```

### Common Network MongoDB Formats:

**Self-hosted MongoDB with Authentication:**
```env
MONGODB_URI=mongodb://admin:password123@192.168.1.100:27017/lmss_db?authSource=admin
```

**MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lmss_db?retryWrites=true&w=majority
```

**MongoDB with Replica Set:**
```env
MONGODB_URI=mongodb://username:password@host1:27017,host2:27017,host3:27017/lmss_db?replicaSet=myReplicaSet&authSource=admin
```

**Docker MongoDB:**
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/lmss_db?authSource=admin
```

## Step 2: Handle Special Characters in Password

If your password contains special characters, URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `+` becomes `%2B`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `&` becomes `%26`

Example:
```env
# If password is: myP@ssw0rd#123
MONGODB_URI=mongodb://username:myP%40ssw0rd%23123@host:27017/lmss_db?authSource=admin
```

## Step 3: Test Network Connection

```bash
cd Backend
npm run db:test-connection
```

✅ Should show: "MongoDB Connected Successfully!"

## Step 4: Setup Demo Data

```bash
npm run db:setup
```

✅ Creates all demo users and sample data

## Step 5: Start Server

```bash
npm run dev
```

✅ Server starts on http://localhost:5000

## 🎯 Demo Login Credentials

### Students
- student1@demo.com / password123 - Rahul Sharma
- student2@demo.com / password123 - Priya Patel
- student3@demo.com / password123 - Arjun Kumar
- student4@demo.com / password123 - Sneha Gupta
- student5@demo.com / password123 - Vikram Singh

### Faculty  
- faculty1@demo.com / password123 - Dr. Priya Patel
- faculty2@demo.com / password123 - Prof. Rajesh Kumar
- faculty3@demo.com / password123 - Dr. Anjali Sharma
- faculty4@demo.com / password123 - Prof. Suresh Reddy

### Admins
- admin@demo.com / password123 (College Admin)
- super@demo.com / password123 (Super Admin)

## 🔧 Troubleshooting Network Issues

### Connection Timeout
```
Error: MongoServerSelectionError: connection timed out
```
**Solutions:**
- Check if MongoDB server is running
- Verify network connectivity
- Check firewall settings
- Ensure correct host and port

### Authentication Failed
```
Error: MongoServerError: Authentication failed
```
**Solutions:**
- Verify username and password
- Check if user has proper permissions
- Ensure correct authSource (usually 'admin')
- Try connecting with MongoDB Compass first

### Network Unreachable
```
Error: MongoNetworkError: failed to connect to server
```
**Solutions:**
- Check if MongoDB port (usually 27017) is open
- Verify the host address is correct
- Test with `telnet your-mongodb-host 27017`
- Check VPN/proxy settings

## 📊 MongoDB Compass Testing

To test your connection with MongoDB Compass:
1. Download MongoDB Compass
2. Use the same connection string from your .env file
3. If Compass connects successfully, your Node.js app should too

## 🎉 That's it!

Your network MongoDB setup is ready to use with the LMS system!