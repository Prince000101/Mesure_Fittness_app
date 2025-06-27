export interface WorkoutData {
  id: string;
  userId: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'mixed';
  duration: number; // in minutes
  exercises: ExerciseData[];
  caloriesBurned?: number;
  notes?: string;
  date: Date;
  completed: boolean;
}

export interface ExerciseData {
  id: string;
  name: string;
  sets: SetData[];
  muscleGroups: string[];
  equipment: string[];
}

export interface SetData {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  completed: boolean;
}

export interface ProgressData {
  id: string;
  userId: string;
  type: 'weight' | 'bodyFat' | 'muscleMass' | 'measurement';
  value: number;
  unit: string;
  bodyPart?: string; // for measurements
  date: Date;
  notes?: string;
}

export interface GoalData {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'strength' | 'endurance' | 'custom';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementData {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'workout' | 'progress' | 'streak' | 'milestone';
  iconName: string;
  earnedAt: Date;
  isNew: boolean;
}

export interface NutritionData {
  id: string;
  userId: string;
  date: Date;
  meals: MealData[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // in ml
}

export interface MealData {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodData[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}