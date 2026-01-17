# LmSS Backend

This is the backend for the LmSS project, built with Node.js, Express, and MongoDB.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `Backend` directory (or modify the existing one) with the following content:
    ```
    NODE_ENV=development
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/lmss
    JWT_SECRET=your_jwt_secret
    ```
    Replace `MONGO_URI` with your actual MongoDB connection string if it's different.

3.  **Seed Database:**
    To populate the database with the mock data used in the frontend:
    ```bash
    npm run data:import
    ```
    *Note: Make sure your MongoDB instance is running before running this command.*

4.  **Run Server:**
    ```bash
    npm run dev
    ```

## API Endpoints

-   **Auth**
    -   `POST /api/auth/register`: Register a new user
    -   `POST /api/auth/login`: Login user
    -   `GET /api/auth/profile`: Get current user profile (Protected)

-   **Student**
    -   `GET /api/student/dashboard`: Get student dashboard data (Protected)
    -   `GET /api/student/problems`: Get coding problems (Protected)

-   **Faculty**
    -   `GET /api/faculty/dashboard`: Get faculty dashboard data (Protected)

-   **College Admin**
    -   `GET /api/admin/dashboard`: Get college admin dashboard data (Protected)

-   **Super Admin**
    -   `GET /api/super-admin/dashboard`: Get super admin dashboard data (Protected)
