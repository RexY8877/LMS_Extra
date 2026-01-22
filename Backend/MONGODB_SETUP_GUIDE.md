# MongoDB Network Connection Setup Guide

This guide will help you connect your application to a network-based MongoDB instance.

## 🔧 Configuration Steps

### 1. Update Environment Variables

Edit your `Backend/.env` file with your MongoDB connection details:

```env
# Replace these values with your actual MongoDB details
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/lmss_db?authSource=admin
DB_NAME=lmss_db
```

### 2. Connection String Formats

#### For MongoDB Atlas (Cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lmss_db?retryWrites=true&w=majority
```

#### For Self-hosted MongoDB:
```env
MONGODB_URI=mongodb://username:password@192.168.1.100:27017/lmss_db?authSource=admin
```

#### For MongoDB with Replica Set:
```env
MONGODB_URI=mongodb://username:password@host1:27017,host2:27017,host3:27017/lmss_db?replicaSet=myReplicaSet&authSource=admin
```

### 3. Special Characters in Password

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

## 🧪 Testing Your Connection

### Step 1: Test Connection
```bash
cd Backend
npm run db:test-connection
```

This will:
- Test the MongoDB connection
- Verify read/write operations
- List existing collections
- Provide troubleshooting tips if connection fails

### Step 2: Setup Database and Demo Data
```bash
npm run db:setup
```

This will:
- Create the database structure
- Import demo users and data
- Display all created credentials

### Step 3: Start the Server
```bash
npm run dev
```

## 👥 Demo Credentials

After running `npm run db:setup`, you'll have these demo accounts:

### Students
- **Email:** student1@demo.com | **Password:** password123 | **Name:** Rahul Sharma
- **Email:** student2@demo.com | **Password:** password123 | **Name:** Priya Patel
- **Email:** student3@demo.com | **Password:** password123 | **Name:** Arjun Kumar
- **Email:** student4@demo.com | **Password:** password123 | **Name:** Sneha Gupta
- **Email:** student5@demo.com | **Password:** password123 | **Name:** Vikram Singh

### Faculty
- **Email:** faculty1@demo.com | **Password:** password123 | **Name:** Dr. Priya Patel
- **Email:** faculty2@demo.com | **Password:** password123 | **Name:** Prof. Rajesh Kumar
- **Email:** faculty3@demo.com | **Password:** password123 | **Name:** Dr. Anjali Sharma
- **Email:** faculty4@demo.com | **Password:** password123 | **Name:** Prof. Suresh Reddy

### Administrators
- **Email:** admin@demo.com | **Password:** password123 | **Name:** Vikram Singh (College Admin)
- **Email:** super@demo.com | **Password:** password123 | **Name:** Anjali Gupta (Super Admin)

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Connection Timeout
```
Error: MongoServerSelectionError: connection timed out
```
**Solutions:**
- Check if MongoDB server is running
- Verify network connectivity
- Check firewall settings
- Ensure correct host and port

#### 2. Authentication Failed
```
Error: MongoServerError: Authentication failed
```
**Solutions:**
- Verify username and password
- Check if user has proper permissions
- Ensure correct authSource (usually 'admin')
- Try connecting with MongoDB Compass first

#### 3. Database Not Found
```
Error: MongoServerError: Database does not exist
```
**Solutions:**
- The database will be created automatically when first document is inserted
- Ensure you have write permissions
- Check if the database name is correct

#### 4. Network Issues
```
Error: MongoNetworkError: failed to connect to server
```
**Solutions:**
- Check if MongoDB port (usually 27017) is open
- Verify the host address is correct
- Test with `telnet your-mongodb-host 27017`
- Check VPN/proxy settings

#### 5. SSL/TLS Issues
```
Error: MongoServerError: SSL handshake failed
```
**Solutions:**
- Add `&ssl=true` to connection string if required
- For development, you might need `&ssl=false`
- Check certificate validity

### MongoDB Compass Connection

To test your connection with MongoDB Compass:
1. Download MongoDB Compass
2. Use the same connection string from your .env file
3. If Compass connects successfully, your Node.js app should too

### Network Configuration Checklist

- [ ] MongoDB server is running
- [ ] Correct host address and port
- [ ] Username and password are correct
- [ ] User has read/write permissions on the database
- [ ] Firewall allows connections on MongoDB port
- [ ] Network connectivity between app and MongoDB server
- [ ] Special characters in password are URL-encoded

## 📞 Getting Help

If you're still having issues:

1. **Check MongoDB logs** on your server for error details
2. **Test with MongoDB Compass** to isolate connection issues
3. **Verify network connectivity** with ping/telnet
4. **Check MongoDB server status** and configuration
5. **Review firewall and security group settings**

## 🚀 Next Steps

Once connected successfully:

1. **Explore the API endpoints** in your application
2. **Test login with demo credentials**
3. **Check the faculty tools and course management features**
4. **Review the file storage service implementation**
5. **Customize the demo data for your needs**

## 📝 Production Considerations

For production deployment:

1. **Use strong passwords** and change default credentials
2. **Enable SSL/TLS** for encrypted connections
3. **Set up proper user roles** and permissions
4. **Configure connection pooling** appropriately
5. **Monitor connection health** and performance
6. **Set up database backups** and disaster recovery
7. **Use environment-specific configuration** files