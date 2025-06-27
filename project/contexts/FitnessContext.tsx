import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  location?: string;
  profileImage?: string;
}

interface Activity {
  id: string;
  type: string;
  value: number;
  unit: string;
  duration?: number;
  caloriesBurned?: number;
  date: Date;
  notes?: string;
}

interface FitnessContextType {
  profile: UserProfile | null;
  activities: Activity[];
  updateProfile: (profile: UserProfile) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  getStreakCount: () => number;
  getTodayActivities: () => Activity[];
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('fitness_profile');
      const activitiesData = await AsyncStorage.getItem('fitness_activities');
      
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
      
      if (activitiesData) {
        const parsedActivities = JSON.parse(activitiesData);
        // Convert date strings back to Date objects
        const activitiesWithDates = parsedActivities.map((activity: any) => ({
          ...activity,
          date: new Date(activity.date)
        }));
        setActivities(activitiesWithDates);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    try {
      const updatedProfile = { ...profile, ...newProfile };
      setProfile(updatedProfile);
      await AsyncStorage.setItem('fitness_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id'>) => {
    try {
      const newActivity: Activity = {
        ...activityData,
        id: Date.now().toString(),
      };
      
      const updatedActivities = [...activities, newActivity];
      setActivities(updatedActivities);
      await AsyncStorage.setItem('fitness_activities', JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const getStreakCount = () => {
    if (activities.length === 0) return 0;
    
    const today = new Date();
    const sortedActivities = activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateString = currentDate.toDateString();
      const hasActivity = sortedActivities.some(activity => 
        new Date(activity.date).toDateString() === dateString
      );
      
      if (hasActivity) {
        streak++;
      } else if (streak > 0) {
        break; // Streak is broken
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const getTodayActivities = () => {
    const today = new Date().toDateString();
    return activities.filter(activity => 
      new Date(activity.date).toDateString() === today
    );
  };

  return (
    <FitnessContext.Provider
      value={{
        profile,
        activities,
        updateProfile,
        addActivity,
        getStreakCount,
        getTodayActivities,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}