export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  profile: FitnessProfile;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    achievements: boolean;
    social: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    shareWorkouts: boolean;
    shareProgress: boolean;
  };
  units: {
    weight: 'kg' | 'lbs';
    distance: 'km' | 'miles';
    height: 'cm' | 'ft';
  };
}

export interface FitnessProfile {
  height?: number;
  weight?: number;
  age?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  targetWeight?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
  profile?: Partial<FitnessProfile>;
}