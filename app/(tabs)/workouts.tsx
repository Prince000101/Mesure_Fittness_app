import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, CircleCheck as CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyWorkout {
  id: string;
  name: string;
  completed: boolean;
  date: string;
}

interface WorkoutDay {
  date: Date;
  hasWorkout: boolean;
  completedCount: number;
  totalCount: number;
  workouts: DailyWorkout[];
}

interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: Array<{
    id: string;
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
    weight?: number;
  }>;
  schedule: {
    type: 'specific_dates' | 'weekdays' | 'daily' | 'custom';
    dates?: string[];
    weekdays?: number[];
    interval?: number;
  };
  isActive: boolean;
}

interface WorkoutCompletion {
  date: string;
  routineId: string;
  exerciseId: string;
  completed: boolean;
}

const STORAGE_KEYS = {
  WORKOUT_ROUTINES: 'workout_routines',
  WORKOUT_COMPLETIONS: 'workout_completions',
};

export default function WorkoutsScreen() {
  const { theme, isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState<DailyWorkout[]>([]);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateCalendarData();
    loadWorkoutsForDate(selectedDate);
  }, [currentDate, routines, completions, selectedDate]);

  const loadData = async () => {
    try {
      const [routinesData, completionsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_ROUTINES),
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_COMPLETIONS),
      ]);

      if (routinesData) {
        setRoutines(JSON.parse(routinesData));
      } else {
        // Load sample routines if none exist
        const sampleRoutines: WorkoutRoutine[] = [
          {
            id: '1',
            name: 'Morning Strength',
            exercises: [
              { id: '1', name: 'Push-ups', sets: 3, reps: 15 },
              { id: '2', name: 'Squats', sets: 3, reps: 20 },
              { id: '3', name: 'Plank', duration: 60 },
            ],
            schedule: {
              type: 'weekdays',
              weekdays: [1, 3, 5], // Mon, Wed, Fri
            },
            isActive: true,
          },
          {
            id: '2',
            name: 'Cardio Session',
            exercises: [
              { id: '4', name: 'Running', duration: 1800 },
              { id: '5', name: 'Jumping Jacks', sets: 3, reps: 30 },
            ],
            schedule: {
              type: 'weekdays',
              weekdays: [2, 4], // Tue, Thu
            },
            isActive: true,
          },
        ];
        setRoutines(sampleRoutines);
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_ROUTINES, JSON.stringify(sampleRoutines));
      }

      if (completionsData) {
        setCompletions(JSON.parse(completionsData));
      }
    } catch (error) {
      console.error('Failed to load workout data:', error);
    }
  };

  const saveCompletions = async (newCompletions: WorkoutCompletion[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_COMPLETIONS, JSON.stringify(newCompletions));
      setCompletions(newCompletions);
    } catch (error) {
      console.error('Failed to save completions:', error);
    }
  };

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: WorkoutDay[] = [];
    const current = new Date(startDate);

    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const workouts = getWorkoutsForDate(current);
      const completedCount = getCompletedWorkoutsCount(current);
      
      days.push({
        date: new Date(current),
        hasWorkout: workouts.length > 0,
        completedCount,
        totalCount: workouts.length,
        workouts
      });
      
      current.setDate(current.getDate() + 1);
    }

    setWorkoutDays(days);
  };

  const getWorkoutsForDate = (date: Date): DailyWorkout[] => {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    const workouts: DailyWorkout[] = [];

    routines.forEach(routine => {
      if (!routine.isActive) return;

      let shouldInclude = false;

      if (routine.schedule.type === 'weekdays' && routine.schedule.weekdays) {
        shouldInclude = routine.schedule.weekdays.includes(dayOfWeek);
      } else if (routine.schedule.type === 'daily') {
        shouldInclude = true;
      } else if (routine.schedule.type === 'specific_dates' && routine.schedule.dates) {
        shouldInclude = routine.schedule.dates.includes(dateStr);
      }

      if (shouldInclude) {
        routine.exercises.forEach(exercise => {
          const completion = completions.find(c => 
            c.date === dateStr && 
            c.routineId === routine.id && 
            c.exerciseId === exercise.id
          );

          workouts.push({
            id: `${routine.id}-${exercise.id}`,
            name: `${routine.name}: ${exercise.name}`,
            completed: completion?.completed || false,
            date: dateStr
          });
        });
      }
    });

    return workouts;
  };

  const getCompletedWorkoutsCount = (date: Date): number => {
    const workouts = getWorkoutsForDate(date);
    return workouts.filter(w => w.completed).length;
  };

  const loadWorkoutsForDate = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    setTodayWorkouts(workouts);
  };

  const toggleWorkoutCompletion = async (workoutId: string) => {
    const [routineId, exerciseId] = workoutId.split('-');
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const existingCompletion = completions.find(c => 
      c.date === dateStr && 
      c.routineId === routineId && 
      c.exerciseId === exerciseId
    );

    let newCompletions: WorkoutCompletion[];

    if (existingCompletion) {
      // Toggle existing completion
      newCompletions = completions.map(c => 
        c.date === dateStr && c.routineId === routineId && c.exerciseId === exerciseId
          ? { ...c, completed: !c.completed }
          : c
      );
    } else {
      // Create new completion
      newCompletions = [...completions, {
        date: dateStr,
        routineId,
        exerciseId,
        completed: true
      }];
    }

    await saveCompletions(newCompletions);
    
    // Update today's workouts
    setTodayWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, completed: !workout.completed }
          : workout
      )
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const getCompletionIntensity = (day: WorkoutDay): number => {
    if (!day.hasWorkout || day.totalCount === 0) return 0;
    return day.completedCount / day.totalCount;
  };

  const getDayBackgroundColor = (day: WorkoutDay) => {
    const isToday = day.date.toDateString() === new Date().toDateString();
    const isSelected = day.date.toDateString() === selectedDate.toDateString();
    
    if (isSelected) return theme.primary;
    if (isToday) return isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF';
    
    if (day.hasWorkout && day.completedCount > 0) {
      const intensity = getCompletionIntensity(day);
      const baseColor = isDark ? '48, 209, 88' : '52, 199, 89';
      return `rgba(${baseColor}, ${0.2 + (intensity * 0.6)})`;
    }
    
    return 'transparent';
  };

  const getDayTextColor = (day: WorkoutDay) => {
    const isSelected = day.date.toDateString() === selectedDate.toDateString();
    if (isSelected) return '#FFFFFF';
    
    if (day.hasWorkout && day.completedCount > 0) {
      const intensity = getCompletionIntensity(day);
      if (intensity > 0.7) return '#FFFFFF';
    }
    
    return theme.text;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Calendar</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <Text style={styles.monthYear}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayName}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {workoutDays.map((day, index) => {
              const isCurrentMonth = day.date.getMonth() === currentDate.getMonth();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    { backgroundColor: getDayBackgroundColor(day) },
                    !isCurrentMonth && styles.otherMonthDay
                  ]}
                  onPress={() => selectDate(day.date)}
                >
                  <Text style={[
                    styles.dayNumber,
                    { color: getDayTextColor(day) },
                    !isCurrentMonth && styles.otherMonthText
                  ]}>
                    {day.date.getDate()}
                  </Text>
                  
                  {/* Progress indicator for partial completion */}
                  {day.hasWorkout && day.completedCount > 0 && day.completedCount < day.totalCount && (
                    <View style={styles.progressIndicator}>
                      <View style={[
                        styles.progressBar,
                        { width: `${(day.completedCount / day.totalCount) * 100}%` }
                      ]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: `rgba(52, 199, 89, 0.3)` }]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: `rgba(52, 199, 89, 0.8)` }]} />
              <Text style={styles.legendText}>Complete</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: theme.textTertiary }]} />
              <Text style={styles.legendText}>Rest Day</Text>
            </View>
          </View>
        </View>

        {/* Daily Workout Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Today's Workouts" 
              : `Workouts for ${selectedDate.toLocaleDateString()}`
            }
          </Text>
          
          {todayWorkouts.length > 0 ? (
            <View style={styles.workoutsList}>
              {todayWorkouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutItem,
                    workout.completed && styles.completedWorkoutItem
                  ]}
                  onPress={() => toggleWorkoutCompletion(workout.id)}
                >
                  <View style={styles.workoutItemLeft}>
                    {workout.completed ? (
                      <CheckCircle size={24} color={theme.secondary} />
                    ) : (
                      <Circle size={24} color={theme.textSecondary} />
                    )}
                    <Text style={[
                      styles.workoutItemText,
                      workout.completed && styles.completedWorkoutText
                    ]}>
                      {workout.name}
                    </Text>
                  </View>
                  
                  {workout.completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={theme.textSecondary} />
              <Text style={styles.emptyStateText}>No workouts scheduled</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedDate.toDateString() === new Date().toDateString() 
                  ? "Enjoy your rest day!" 
                  : "This is a rest day"
                }
              </Text>
            </View>
          )}
        </View>

        {/* Workout Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {workoutDays.filter(d => d.completedCount === d.totalCount && d.totalCount > 0 && d.date.getMonth() === currentDate.getMonth()).length}
              </Text>
              <Text style={styles.statLabel}>Perfect Days</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {workoutDays.filter(d => d.completedCount > 0 && d.date.getMonth() === currentDate.getMonth()).length}
              </Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(() => {
                  const monthDays = workoutDays.filter(d => d.hasWorkout && d.date.getMonth() === currentDate.getMonth());
                  const totalWorkouts = monthDays.reduce((sum, d) => sum + d.totalCount, 0);
                  const completedWorkouts = monthDays.reduce((sum, d) => sum + d.completedCount, 0);
                  return Math.round((completedWorkouts / totalWorkouts) * 100) || 0;
                })()}%
              </Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </View>

        {/* Create Workout Routine Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create-workout-routine')}
          >
            <LinearGradient
              colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
              style={styles.createButtonGradient}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Workout Routine</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  calendarContainer: {
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  otherMonthText: {
    opacity: 0.5,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 16,
  },
  workoutsList: {
    gap: 12,
  },
  workoutItem: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedWorkoutItem: {
    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.1)' : '#F0FFF4',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(48, 209, 88, 0.3)' : '#34C759',
  },
  workoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  workoutItemText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  completedWorkoutText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  emptyState: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});