import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  email: string;
  joinDate: string;
  height: string;
  weight: string;
  age: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  avatar?: string;
  preferences: {
    notifications: boolean;
    privacy: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt: string;
  category: 'workout' | 'progress' | 'streak' | 'milestone';
  isNew: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  FITNESS_GOALS: 'fitness_goals',
  ACHIEVEMENTS: 'achievements',
  APP_SETTINGS: 'app_settings',
} as const;

// User Profile Storage
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw new Error('Failed to save user profile');
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (profileData) {
      return JSON.parse(profileData);
    }
    
    // Return default profile if none exists
    const defaultProfile: UserProfile = {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      joinDate: 'January 2024',
      height: '175 cm',
      weight: '75.2 kg',
      age: '28 years',
      fitnessLevel: 'Intermediate',
      preferences: {
        notifications: true,
        privacy: false,
        theme: 'system',
      },
    };
    
    await saveUserProfile(defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Fitness Goals Storage
export const saveFitnessGoals = async (goals: FitnessGoal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FITNESS_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving fitness goals:', error);
    throw new Error('Failed to save fitness goals');
  }
};

export const getFitnessGoals = async (): Promise<FitnessGoal[]> => {
  try {
    const goalsData = await AsyncStorage.getItem(STORAGE_KEYS.FITNESS_GOALS);
    if (goalsData) {
      return JSON.parse(goalsData);
    }
    
    // Return default goals if none exist
    const defaultGoals: FitnessGoal[] = [
      {
        id: '1',
        title: 'Lose 5kg',
        description: 'Reach target weight of 70kg',
        targetValue: 70,
        currentValue: 75.2,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Bench Press 100kg',
        description: 'Achieve 1RM of 100kg on bench press',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Run 5K under 25min',
        description: 'Complete a 5K run in under 25 minutes',
        targetValue: 25,
        currentValue: 28.5,
        unit: 'min',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    await saveFitnessGoals(defaultGoals);
    return defaultGoals;
  } catch (error) {
    console.error('Error getting fitness goals:', error);
    return [];
  }
};

export const addFitnessGoal = async (goal: Omit<FitnessGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const existingGoals = await getFitnessGoals();
    const newGoal: FitnessGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await saveFitnessGoals([...existingGoals, newGoal]);
  } catch (error) {
    console.error('Error adding fitness goal:', error);
    throw new Error('Failed to add fitness goal');
  }
};

export const updateFitnessGoal = async (id: string, updates: Partial<FitnessGoal>): Promise<void> => {
  try {
    const existingGoals = await getFitnessGoals();
    const updatedGoals = existingGoals.map(goal =>
      goal.id === id 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    );
    
    await saveFitnessGoals(updatedGoals);
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    throw new Error('Failed to update fitness goal');
  }
};

// Achievements Storage
export const saveAchievements = async (achievements: Achievement[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
    throw new Error('Failed to save achievements');
  }
};

export const getAchievements = async (): Promise<Achievement[]> => {
  try {
    const achievementsData = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (achievementsData) {
      return JSON.parse(achievementsData);
    }
    
    // Return default achievements if none exist
    const defaultAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Workout',
        description: 'Completed your first workout session',
        iconName: 'Trophy',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'workout',
        isNew: false,
      },
      {
        id: '2',
        title: 'Week Warrior',
        description: 'Completed 5 workouts this week',
        iconName: 'Award',
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'streak',
        isNew: true,
      },
      {
        id: '3',
        title: 'Personal Record',
        description: 'Set your first personal record',
        iconName: 'TrendingUp',
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'progress',
        isNew: false,
      },
    ];
    
    await saveAchievements(defaultAchievements);
    return defaultAchievements;
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

export const addAchievement = async (achievement: Omit<Achievement, 'id'>): Promise<void> => {
  try {
    const existingAchievements = await getAchievements();
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
    };
    
    await saveAchievements([...existingAchievements, newAchievement]);
  } catch (error) {
    console.error('Error adding achievement:', error);
    throw new Error('Failed to add achievement');
  }
};

export const markAchievementAsRead = async (id: string): Promise<void> => {
  try {
    const existingAchievements = await getAchievements();
    const updatedAchievements = existingAchievements.map(achievement =>
      achievement.id === id 
        ? { ...achievement, isNew: false }
        : achievement
    );
    
    await saveAchievements(updatedAchievements);
  } catch (error) {
    console.error('Error marking achievement as read:', error);
    throw new Error('Failed to mark achievement as read');
  }
};

// Clear all data (for logout or reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.FITNESS_GOALS,
      STORAGE_KEYS.ACHIEVEMENTS,
      STORAGE_KEYS.APP_SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error('Failed to clear data');
  }
};

// Export data for backup
export const exportAllData = async (): Promise<string> => {
  try {
    const [profile, goals, achievements] = await Promise.all([
      getUserProfile(),
      getFitnessGoals(),
      getAchievements(),
    ]);
    
    const exportData = {
      profile,
      goals,
      achievements,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      appName: 'Measure Fitness',
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};