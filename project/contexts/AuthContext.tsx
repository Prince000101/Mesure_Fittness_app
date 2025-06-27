import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData 
} from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure storage helper
const secureStorage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// Mock database - In production, this would be replaced with actual API calls
class MockDatabase {
  private users: Map<string, User & { password: string }> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    // Initialize with some demo data
    this.seedData();
  }

  private seedData() {
    const demoUser: User & { password: string } = {
      id: '1',
      email: 'demo@fitness.app',
      username: 'demo_user',
      firstName: 'Demo',
      lastName: 'User',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: true,
      password: 'demo123', // In production, this would be hashed
      preferences: {
        theme: 'system',
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          achievements: true,
          social: false,
        },
        privacy: {
          profileVisibility: 'public',
          shareWorkouts: true,
          shareProgress: true,
        },
        units: {
          weight: 'kg',
          distance: 'km',
          height: 'cm',
        },
      },
      profile: {
        height: 175,
        weight: 75,
        age: 28,
        fitnessLevel: 'intermediate',
        goals: ['Build muscle', 'Lose weight', 'Improve endurance'],
        targetWeight: 70,
        activityLevel: 'moderate',
      },
    };
    
    this.users.set(demoUser.email, demoUser);
  }

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = this.users.get(email.toLowerCase());
    if (!user || user.password !== password) {
      return null;
    }

    const token = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${user.id}-${Date.now()}-${Math.random()}`
    );

    this.sessions.set(token, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async register(data: RegisterData): Promise<{ user: User; token: string } | { error: string }> {
    if (this.users.has(data.email.toLowerCase())) {
      return { error: 'Email already exists' };
    }

    // Check if username is taken
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === data.username.toLowerCase()) {
        return { error: 'Username already taken' };
      }
    }

    const newUser: User & { password: string } = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data.email + Date.now()),
      email: data.email.toLowerCase(),
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
      password: data.password, // In production, this would be hashed
      preferences: {
        theme: 'system',
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          achievements: true,
          social: false,
        },
        privacy: {
          profileVisibility: 'public',
          shareWorkouts: true,
          shareProgress: true,
        },
        units: {
          weight: 'kg',
          distance: 'km',
          height: 'cm',
        },
      },
      profile: {
        fitnessLevel: 'beginner',
        goals: [],
        activityLevel: 'moderate',
      },
    };

    this.users.set(newUser.email, newUser);

    const token = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${newUser.id}-${Date.now()}-${Math.random()}`
    );

    this.sessions.set(token, {
      userId: newUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  async getUserByToken(token: string): Promise<User | null> {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      if (session) this.sessions.delete(token);
      return null;
    }

    for (const user of this.users.values()) {
      if (user.id === session.userId) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    }

    return null;
  }

  async updateUser(userId: string, data: UpdateProfileData): Promise<User | null> {
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        const updatedUser = {
          ...user,
          ...data,
          preferences: data.preferences ? { ...user.preferences, ...data.preferences } : user.preferences,
          profile: data.profile ? { ...user.profile, ...data.profile } : user.profile,
          updatedAt: new Date(),
        };
        
        this.users.set(email, updatedUser);
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      }
    }
    return null;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        if (user.password !== currentPassword) {
          return false;
        }
        user.password = newPassword;
        user.updatedAt = new Date();
        this.users.set(email, user);
        return true;
      }
    }
    return false;
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = this.users.get(email.toLowerCase());
    if (!user) return false;
    
    // In production, this would send an email with reset link
    // For demo purposes, we'll just log the reset token
    const resetToken = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${user.id}-reset-${Date.now()}`
    );
    
    console.log(`Password reset token for ${email}: ${resetToken}`);
    return true;
  }

  logout(token: string) {
    this.sessions.delete(token);
  }
}

const mockDB = new MockDatabase();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token) {
        const user = await mockDB.getUserByToken(token);
        if (user) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        } else {
          await secureStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockDB.login(credentials.email, credentials.password);
      
      if (!result) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Invalid email or password' 
        }));
        return { success: false, error: 'Invalid email or password' };
      }

      await secureStorage.setItem('auth_token', result.token);
      
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mockDB.register(data);
      
      if ('error' in result) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return { success: false, error: result.error };
      }

      await secureStorage.setItem('auth_token', result.token);
      
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token) {
        mockDB.logout(token);
        await secureStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const resetPassword = async (data: ResetPasswordData): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await mockDB.resetPassword(data.email);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'Email not found' };
      }
    } catch (error) {
      const errorMessage = 'Password reset failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const success = await mockDB.changePassword(
        state.user.id, 
        data.currentPassword, 
        data.newPassword
      );
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'Current password is incorrect' };
      }
    } catch (error) {
      const errorMessage = 'Password change failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedUser = await mockDB.updateUser(state.user.id, data);
      
      if (updatedUser) {
        setState(prev => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
        }));
        return { success: true };
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Profile update failed' 
        }));
        return { success: false, error: 'Profile update failed' };
      }
    } catch (error) {
      const errorMessage = 'Profile update failed. Please try again.';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const refreshUser = async () => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token) {
        const user = await mockDB.getUserByToken(token);
        if (user) {
          setState(prev => ({ ...prev, user }));
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        changePassword,
        updateProfile,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}