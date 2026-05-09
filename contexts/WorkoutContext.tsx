import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports';
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  targetSets: number;
  targetReps?: number;
  targetWeight?: number;
  targetDuration?: number;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'mixed';
  isTemplate: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSession {
  id: string;
  workout: Workout;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
  totalDuration?: number; // in minutes
  caloriesBurned?: number;
}

export interface PersonalRecord {
  id: string;
  exercise: Exercise;
  type: 'weight' | 'reps' | 'duration' | 'distance';
  value: number;
  unit: string;
  date: Date;
  workoutSessionId?: string;
}

export interface BodyMeasurement {
  id: string;
  type: 'weight' | 'bodyFat' | 'muscleMass' | 'chest' | 'arms' | 'waist' | 'thighs' | 'custom';
  value: number;
  unit: string;
  date: Date;
  notes?: string;
  customName?: string;
}

interface WorkoutContextType {
  // Workouts
  workouts: Workout[];
  workoutSessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  
  // Personal Records
  personalRecords: PersonalRecord[];
  
  // Body Measurements
  bodyMeasurements: BodyMeasurement[];
  
  // Actions
  createWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  
  startWorkoutSession: (workoutId: string) => Promise<void>;
  updateWorkoutSession: (session: Partial<WorkoutSession>) => Promise<void>;
  completeWorkoutSession: () => Promise<void>;
  
  addPersonalRecord: (record: Omit<PersonalRecord, 'id'>) => Promise<void>;
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const exerciseLibrary: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Bench'],
    instructions: [
      'Lie flat on the bench with your feet firmly on the ground',
      'Grip the barbell slightly wider than shoulder-width',
      'Lower the bar to your chest with control',
      'Press the bar back up to starting position'
    ],
    difficulty: 'intermediate',
  },
  {
    id: '2',
    name: 'Deadlift',
    category: 'strength',
    muscleGroups: ['Back', 'Legs', 'Core'],
    equipment: ['Barbell'],
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep your back straight and chest up',
      'Drive through heels to lift the bar'
    ],
    difficulty: 'advanced',
  },
  {
    id: '3',
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['Chest', 'Shoulders', 'Arms', 'Core'],
    equipment: ['Bodyweight'],
    instructions: [
      'Start in plank position with hands under shoulders',
      'Lower your body until chest nearly touches the ground',
      'Push back up to starting position',
      'Keep your body in a straight line throughout'
    ],
    difficulty: 'beginner',
  },
  {
    id: '4',
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['Legs', 'Glutes', 'Core'],
    equipment: ['Bodyweight'],
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Push through heels to return to standing'
    ],
    difficulty: 'beginner',
  },
  {
    id: '5',
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['Legs', 'Core'],
    equipment: ['None'],
    instructions: [
      'Start with a light warm-up walk',
      'Gradually increase pace to running speed',
      'Maintain steady breathing rhythm',
      'Land on mid-foot with slight forward lean'
    ],
    difficulty: 'beginner',
  },
];

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workoutsData, sessionsData, recordsData, measurementsData] = await Promise.all([
        AsyncStorage.getItem('workouts'),
        AsyncStorage.getItem('workoutSessions'),
        AsyncStorage.getItem('personalRecords'),
        AsyncStorage.getItem('bodyMeasurements'),
      ]);

      if (workoutsData) {
        const savedWorkouts = JSON.parse(workoutsData);
        const workoutsWithDates = savedWorkouts.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
        }));
        setWorkouts(workoutsWithDates);
      }

      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        const sessionsWithDates = sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          workout: {
            ...session.workout,
            createdAt: new Date(session.workout.createdAt),
            updatedAt: new Date(session.workout.updatedAt),
          }
        }));
        setWorkoutSessions(sessionsWithDates);
      }

      if (recordsData) {
        const records = JSON.parse(recordsData);
        const recordsWithDates = records.map((record: any) => ({
          ...record,
          date: new Date(record.date)
        }));
        setPersonalRecords(recordsWithDates);
      }

      if (measurementsData) {
        const measurements = JSON.parse(measurementsData);
        const measurementsWithDates = measurements.map((measurement: any) => ({
          ...measurement,
          date: new Date(measurement.date)
        }));
        setBodyMeasurements(measurementsWithDates);
      }

    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkout = async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  const updateWorkout = async (id: string, workoutData: Partial<Workout>) => {
    const updatedWorkouts = workouts.map(workout =>
      workout.id === id ? { ...workout, ...workoutData, updatedAt: new Date() } : workout
    );
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  const deleteWorkout = async (id: string) => {
    const updatedWorkouts = workouts.filter(workout => workout.id !== id);
    setWorkouts(updatedWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
  };

  const startWorkoutSession = async (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const session: WorkoutSession = {
      id: Date.now().toString(),
      workout: { ...workout },
      startTime: new Date(),
      completed: false,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(set => ({ ...set, completed: false }))
      })),
    };

    setCurrentSession(session);
  };

  const updateWorkoutSession = async (sessionData: Partial<WorkoutSession>) => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession, ...sessionData };
    setCurrentSession(updatedSession);
  };

  const completeWorkoutSession = async () => {
    if (!currentSession) return;

    const completedSession: WorkoutSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
      totalDuration: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 60000),
    };

    const updatedSessions = [...workoutSessions, completedSession];
    setWorkoutSessions(updatedSessions);
    await AsyncStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));
    
    setCurrentSession(null);
  };

  const addPersonalRecord = async (recordData: Omit<PersonalRecord, 'id'>) => {
    const newRecord: PersonalRecord = {
      ...recordData,
      id: Date.now().toString(),
    };

    const updatedRecords = [...personalRecords, newRecord];
    setPersonalRecords(updatedRecords);
    await AsyncStorage.setItem('personalRecords', JSON.stringify(updatedRecords));
  };

  const addBodyMeasurement = async (measurementData: Omit<BodyMeasurement, 'id'>) => {
    const newMeasurement: BodyMeasurement = {
      ...measurementData,
      id: Date.now().toString(),
    };

    const updatedMeasurements = [...bodyMeasurements, newMeasurement];
    setBodyMeasurements(updatedMeasurements);
    await AsyncStorage.setItem('bodyMeasurements', JSON.stringify(updatedMeasurements));
  };

  const clearError = () => setError(null);

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        workoutSessions,
        currentSession,
        personalRecords,
        bodyMeasurements,
        createWorkout,
        updateWorkout,
        deleteWorkout,
        startWorkoutSession,
        updateWorkoutSession,
        completeWorkoutSession,
        addPersonalRecord,
        addBodyMeasurement,
        isLoading,
        error,
        clearError,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

export { exerciseLibrary };