import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'faculty' | 'college_admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  college?: string;
  department?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            // Map backend response to User interface
            // Backend returns: _id, name, email, role, college, department, token, isDemo
            const user: User = {
              id: data._id,
              name: data.name,
              email: data.email,
              role: data.role,
              college: data.college,
              department: data.department,
              token: data.token,
              avatar: data.avatar,
            };
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'lms-auth',
    }
  )
);
