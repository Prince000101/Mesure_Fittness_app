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
  exerciseId: string;
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
  workoutId: string;
  workout: Workout;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
  totalDuration?: number; // in minutes
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
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
  customName?: string; // for custom measurements
}

export interface ProgressPhoto {
  id: string;
  imageUri: string;
  date: Date;
  category: 'front' | 'side' | 'back' | 'custom';
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  height?: number; // in cm
  weight?: number; // in kg
  age?: number;
  fitnessGoals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredUnits: 'metric' | 'imperial';
  createdAt: Date;
  updatedAt: Date;
}