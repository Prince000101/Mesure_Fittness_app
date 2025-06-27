import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { 
  WorkoutData, 
  ProgressData, 
  GoalData, 
  AchievementData, 
  NutritionData 
} from '@/types/data';

interface DataContextType {
  // Workouts
  workouts: WorkoutData[];
  addWorkout: (workout: Omit<WorkoutData, 'id' | 'userId'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<WorkoutData>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  
  // Progress
  progressData: ProgressData[];
  addProgress: (progress: Omit<ProgressData, 'id' | 'userId'>) => Promise<void>;
  updateProgress: (id: string, progress: Partial<ProgressData>) => Promise<void>;
  deleteProgress: (id: string) => Promise<void>;
  
  // Goals
  goals: GoalData[];
  addGoal: (goal: Omit<GoalData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<GoalData>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Achievements
  achievements: AchievementData[];
  addAchievement: (achievement: Omit<AchievementData, 'id' | 'userId'>) => Promise<void>;
  markAchievementAsRead: (id: string) => Promise<void>;
  
  // Nutrition
  nutritionData: NutritionData[];
  addNutritionData: (nutrition: Omit<NutritionData, 'id' | 'userId'>) => Promise<void>;
  updateNutritionData: (id: string, nutrition: Partial<NutritionData>) => Promise<void>;
  deleteNutritionData: (id: string) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  
  // Data management
  syncData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data storage - In production, this would be replaced with actual API calls
class MockDataStorage {
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async getWorkouts(userId: string): Promise<WorkoutData[]> {
    const key = `workouts_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : this.getSeedWorkouts(userId);
  }

  async saveWorkouts(userId: string, workouts: WorkoutData[]): Promise<void> {
    const key = `workouts_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(workouts));
  }

  async getProgress(userId: string): Promise<ProgressData[]> {
    const key = `progress_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : this.getSeedProgress(userId);
  }

  async saveProgress(userId: string, progress: ProgressData[]): Promise<void> {
    const key = `progress_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  }

  async getGoals(userId: string): Promise<GoalData[]> {
    const key = `goals_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : this.getSeedGoals(userId);
  }

  async saveGoals(userId: string, goals: GoalData[]): Promise<void> {
    const key = `goals_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(goals));
  }

  async getAchievements(userId: string): Promise<AchievementData[]> {
    const key = `achievements_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : this.getSeedAchievements(userId);
  }

  async saveAchievements(userId: string, achievements: AchievementData[]): Promise<void> {
    const key = `achievements_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(achievements));
  }

  async getNutrition(userId: string): Promise<NutritionData[]> {
    const key = `nutrition_${userId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async saveNutrition(userId: string, nutrition: NutritionData[]): Promise<void> {
    const key = `nutrition_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(nutrition));
  }

  // Seed data for demo purposes
  private getSeedWorkouts(userId: string): WorkoutData[] {
    return [
      {
        id: '1',
        userId,
        name: 'Upper Body Strength',
        type: 'strength',
        duration: 45,
        exercises: [
          {
            id: '1',
            name: 'Bench Press',
            sets: [
              { id: '1', reps: 10, weight: 80, restTime: 90, completed: true },
              { id: '2', reps: 8, weight: 85, restTime: 90, completed: true },
              { id: '3', reps: 6, weight: 90, restTime: 90, completed: true },
            ],
            muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
            equipment: ['Barbell', 'Bench'],
          },
        ],
        caloriesBurned: 280,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completed: true,
      },
      {
        id: '2',
        userId,
        name: 'Morning Cardio',
        type: 'cardio',
        duration: 30,
        exercises: [
          {
            id: '1',
            name: 'Treadmill Running',
            sets: [
              { id: '1', duration: 1800, distance: 5000, completed: true },
            ],
            muscleGroups: ['Legs', 'Core'],
            equipment: ['Treadmill'],
          },
        ],
        caloriesBurned: 350,
        date: new Date(),
        completed: true,
      },
    ];
  }

  private getSeedProgress(userId: string): ProgressData[] {
    const now = new Date();
    return [
      {
        id: '1',
        userId,
        type: 'weight',
        value: 75.2,
        unit: 'kg',
        date: now,
      },
      {
        id: '2',
        userId,
        type: 'bodyFat',
        value: 12.5,
        unit: '%',
        date: now,
      },
      {
        id: '3',
        userId,
        type: 'measurement',
        value: 102,
        unit: 'cm',
        bodyPart: 'chest',
        date: now,
      },
    ];
  }

  private getSeedGoals(userId: string): GoalData[] {
    return [
      {
        id: '1',
        userId,
        title: 'Lose 5kg',
        description: 'Reach target weight of 70kg',
        type: 'weight_loss',
        targetValue: 70,
        currentValue: 75.2,
        unit: 'kg',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        userId,
        title: 'Bench Press 100kg',
        description: 'Achieve 1RM of 100kg on bench press',
        type: 'strength',
        targetValue: 100,
        currentValue: 85,
        unit: 'kg',
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private getSeedAchievements(userId: string): AchievementData[] {
    return [
      {
        id: '1',
        userId,
        title: 'First Workout',
        description: 'Completed your first workout!',
        type: 'workout',
        iconName: 'Trophy',
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isNew: false,
      },
      {
        id: '2',
        userId,
        title: 'Week Warrior',
        description: 'Completed 5 workouts this week',
        type: 'streak',
        iconName: 'Award',
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isNew: true,
      },
    ];
  }
}

const mockStorage = new MockDataStorage();

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setWorkouts([]);
      setProgressData([]);
      setGoals([]);
      setAchievements([]);
      setNutritionData([]);
    }
  }, [isAuthenticated, user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [workoutsData, progressDataData, goalsData, achievementsData, nutritionDataData] = await Promise.all([
        mockStorage.getWorkouts(user.id),
        mockStorage.getProgress(user.id),
        mockStorage.getGoals(user.id),
        mockStorage.getAchievements(user.id),
        mockStorage.getNutrition(user.id),
      ]);

      setWorkouts(workoutsData);
      setProgressData(progressDataData);
      setGoals(goalsData);
      setAchievements(achievementsData);
      setNutritionData(nutritionDataData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Workout methods
  const addWorkout = async (workoutData: Omit<WorkoutData, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newWorkout: WorkoutData = {
      ...workoutData,
      id: Date.now().toString(),
      userId: user.id,
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    await mockStorage.saveWorkouts(user.id, updatedWorkouts);
  };

  const updateWorkout = async (id: string, workoutData: Partial<WorkoutData>) => {
    if (!user) return;
    
    const updatedWorkouts = workouts.map(workout =>
      workout.id === id ? { ...workout, ...workoutData } : workout
    );
    setWorkouts(updatedWorkouts);
    await mockStorage.saveWorkouts(user.id, updatedWorkouts);
  };

  const deleteWorkout = async (id: string) => {
    if (!user) return;
    
    const updatedWorkouts = workouts.filter(workout => workout.id !== id);
    setWorkouts(updatedWorkouts);
    await mockStorage.saveWorkouts(user.id, updatedWorkouts);
  };

  // Progress methods
  const addProgress = async (progress: Omit<ProgressData, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newProgress: ProgressData = {
      ...progress,
      id: Date.now().toString(),
      userId: user.id,
    };

    const updatedProgress = [...progressData, newProgress];
    setProgressData(updatedProgress);
    await mockStorage.saveProgress(user.id, updatedProgress);
  };

  const updateProgress = async (id: string, progress: Partial<ProgressData>) => {
    if (!user) return;
    
    const updatedProgress = progressData.map(item =>
      item.id === id ? { ...item, ...progress } : item
    );
    setProgressData(updatedProgress);
    await mockStorage.saveProgress(user.id, updatedProgress);
  };

  const deleteProgress = async (id: string) => {
    if (!user) return;
    
    const updatedProgress = progressData.filter(item => item.id !== id);
    setProgressData(updatedProgress);
    await mockStorage.saveProgress(user.id, updatedProgress);
  };

  // Goal methods
  const addGoal = async (goalData: Omit<GoalData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    const newGoal: GoalData = {
      ...goalData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    await mockStorage.saveGoals(user.id, updatedGoals);
  };

  const updateGoal = async (id: string, goalData: Partial<GoalData>) => {
    if (!user) return;
    
    const updatedGoals = goals.map(goal =>
      goal.id === id ? { ...goal, ...goalData, updatedAt: new Date() } : goal
    );
    setGoals(updatedGoals);
    await mockStorage.saveGoals(user.id, updatedGoals);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    await mockStorage.saveGoals(user.id, updatedGoals);
  };

  // Achievement methods
  const addAchievement = async (achievementData: Omit<AchievementData, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newAchievement: AchievementData = {
      ...achievementData,
      id: Date.now().toString(),
      userId: user.id,
    };

    const updatedAchievements = [...achievements, newAchievement];
    setAchievements(updatedAchievements);
    await mockStorage.saveAchievements(user.id, updatedAchievements);
  };

  const markAchievementAsRead = async (id: string) => {
    if (!user) return;
    
    const updatedAchievements = achievements.map(achievement =>
      achievement.id === id ? { ...achievement, isNew: false } : achievement
    );
    setAchievements(updatedAchievements);
    await mockStorage.saveAchievements(user.id, updatedAchievements);
  };

  // Nutrition methods
  const addNutritionData = async (nutrition: Omit<NutritionData, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newNutrition: NutritionData = {
      ...nutrition,
      id: Date.now().toString(),
      userId: user.id,
    };

    const updatedNutrition = [...nutritionData, newNutrition];
    setNutritionData(updatedNutrition);
    await mockStorage.saveNutrition(user.id, updatedNutrition);
  };

  const updateNutritionData = async (id: string, nutrition: Partial<NutritionData>) => {
    if (!user) return;
    
    const updatedNutrition = nutritionData.map(item =>
      item.id === id ? { ...item, ...nutrition } : item
    );
    setNutritionData(updatedNutrition);
    await mockStorage.saveNutrition(user.id, updatedNutrition);
  };

  const deleteNutritionData = async (id: string) => {
    if (!user) return;
    
    const updatedNutrition = nutritionData.filter(item => item.id !== id);
    setNutritionData(updatedNutrition);
    await mockStorage.saveNutrition(user.id, updatedNutrition);
  };

  const syncData = async () => {
    // In production, this would sync with remote server
    await loadAllData();
  };

  const exportData = async (): Promise<string> => {
    const data = {
      workouts,
      progressData,
      goals,
      achievements,
      nutritionData,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = async (dataString: string) => {
    try {
      const data = JSON.parse(dataString);
      
      if (data.workouts) setWorkouts(data.workouts);
      if (data.progressData) setProgressData(data.progressData);
      if (data.goals) setGoals(data.goals);
      if (data.achievements) setAchievements(data.achievements);
      if (data.nutritionData) setNutritionData(data.nutritionData);
      
      // Save to storage
      if (user) {
        await Promise.all([
          data.workouts && mockStorage.saveWorkouts(user.id, data.workouts),
          data.progressData && mockStorage.saveProgress(user.id, data.progressData),
          data.goals && mockStorage.saveGoals(user.id, data.goals),
          data.achievements && mockStorage.saveAchievements(user.id, data.achievements),
          data.nutritionData && mockStorage.saveNutrition(user.id, data.nutritionData),
        ]);
      }
    } catch (err) {
      throw new Error('Invalid data format');
    }
  };

  const clearError = () => setError(null);

  return (
    <DataContext.Provider
      value={{
        workouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        progressData,
        addProgress,
        updateProgress,
        deleteProgress,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        achievements,
        addAchievement,
        markAchievementAsRead,
        nutritionData,
        addNutritionData,
        updateNutritionData,
        deleteNutritionData,
        isLoading,
        error,
        clearError,
        syncData,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}