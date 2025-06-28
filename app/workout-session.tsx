import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Play, Pause, SkipForward, Check, Timer, Dumbbell } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout, WorkoutSet } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function WorkoutSessionScreen() {
  const { theme, isDark } = useTheme();
  const { currentSession, updateWorkoutSession, completeWorkoutSession } = useWorkout();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    if (!currentSession) {
      router.back();
      return;
    }

    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  useEffect(() => {
    let restTimer: NodeJS.Timeout;
    
    if (isResting && restTimeLeft > 0) {
      restTimer = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(restTimer);
  }, [isResting, restTimeLeft]);

  if (!currentSession) {
    return null;
  }

  const currentExercise = currentSession.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const totalSets = currentExercise?.sets.length || 0;
  const completedSets = currentExercise?.sets.filter(set => set.completed).length || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = async () => {
    if (!currentSet || !currentExercise) return;

    const updatedExercises = currentSession.exercises.map((exercise, exIndex) => {
      if (exIndex === currentExerciseIndex) {
        return {
          ...exercise,
          sets: exercise.sets.map((set, setIndex) => {
            if (setIndex === currentSetIndex) {
              return { ...set, completed: true };
            }
            return set;
          })
        };
      }
      return exercise;
    });

    await updateWorkoutSession({ exercises: updatedExercises });

    // Start rest timer if there's a rest time and more sets
    if (currentSet.restTime && currentSetIndex < totalSets - 1) {
      setRestTimeLeft(currentSet.restTime);
      setIsResting(true);
    }

    // Move to next set or exercise
    if (currentSetIndex < totalSets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    } else if (currentExerciseIndex < currentSession.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Finish', 
          onPress: async () => {
            await completeWorkoutSession();
            router.back();
          }
        }
      ]
    );
  };

  const handleExitWorkout = () => {
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const isWorkoutComplete = currentExerciseIndex >= currentSession.exercises.length;

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitWorkout}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.workoutName}>{currentSession.workout.name}</Text>
          <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
        </View>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${((currentExerciseIndex + (currentSetIndex / totalSets)) / currentSession.exercises.length) * 100}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {currentSession.exercises.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isWorkoutComplete ? (
          <View style={styles.completionContainer}>
            <LinearGradient
              colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']}
              style={styles.completionGradient}
            >
              <Check size={64} color="#FFFFFF" />
              <Text style={styles.completionTitle}>Workout Complete!</Text>
              <Text style={styles.completionSubtitle}>Great job finishing your workout</Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            {/* Current Exercise */}
            {currentExercise && (
              <View style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <Dumbbell size={24} color={theme.primary} />
                  <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>
                </View>
                
                <Text style={styles.muscleGroups}>
                  {currentExercise.exercise.muscleGroups.join(', ')}
                </Text>

                {/* Current Set */}
                {currentSet && (
                  <View style={styles.currentSetContainer}>
                    <Text style={styles.setTitle}>
                      Set {currentSetIndex + 1} of {totalSets}
                    </Text>
                    
                    <View style={styles.setDetails}>
                      {currentSet.reps && (
                        <View style={styles.setDetail}>
                          <Text style={styles.setDetailLabel}>Reps</Text>
                          <Text style={styles.setDetailValue}>{currentSet.reps}</Text>
                        </View>
                      )}
                      {currentSet.weight && (
                        <View style={styles.setDetail}>
                          <Text style={styles.setDetailLabel}>Weight</Text>
                          <Text style={styles.setDetailValue}>{currentSet.weight} kg</Text>
                        </View>
                      )}
                      {currentSet.duration && (
                        <View style={styles.setDetail}>
                          <Text style={styles.setDetailLabel}>Duration</Text>
                          <Text style={styles.setDetailValue}>{currentSet.duration}s</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.completeSetButton, currentSet.completed && styles.completedSetButton]}
                      onPress={handleCompleteSet}
                      disabled={currentSet.completed}
                    >
                      <LinearGradient
                        colors={currentSet.completed 
                          ? [theme.secondary, theme.secondary] 
                          : isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']
                        }
                        style={styles.completeSetGradient}
                      >
                        {currentSet.completed ? (
                          <>
                            <Check size={20} color="#FFFFFF" />
                            <Text style={styles.completeSetText}>Completed</Text>
                          </>
                        ) : (
                          <>
                            <Play size={20} color="#FFFFFF" />
                            <Text style={styles.completeSetText}>Complete Set</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Rest Timer */}
                {isResting && (
                  <View style={styles.restContainer}>
                    <LinearGradient
                      colors={['#FF6B35', '#F7931E']}
                      style={styles.restGradient}
                    >
                      <Timer size={32} color="#FFFFFF" />
                      <Text style={styles.restTitle}>Rest Time</Text>
                      <Text style={styles.restTime}>{formatTime(restTimeLeft)}</Text>
                      <TouchableOpacity style={styles.skipRestButton} onPress={handleSkipRest}>
                        <SkipForward size={20} color="#FFFFFF" />
                        <Text style={styles.skipRestText}>Skip Rest</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                )}

                {/* All Sets */}
                <View style={styles.allSetsContainer}>
                  <Text style={styles.allSetsTitle}>All Sets</Text>
                  {currentExercise.sets.map((set, index) => (
                    <View key={set.id} style={[
                      styles.setRow,
                      index === currentSetIndex && styles.currentSetRow,
                      set.completed && styles.completedSetRow
                    ]}>
                      <Text style={styles.setNumber}>{index + 1}</Text>
                      <Text style={styles.setInfo}>
                        {set.reps && `${set.reps} reps`}
                        {set.weight && ` × ${set.weight}kg`}
                        {set.duration && `${set.duration}s`}
                      </Text>
                      {set.completed && <Check size={16} color={theme.secondary} />}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  sessionTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginTop: 2,
  },
  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.primary,
    borderRadius: 8,
  },
  finishButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  muscleGroups: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 24,
  },
  currentSetContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  setDetail: {
    alignItems: 'center',
  },
  setDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  setDetailValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  completeSetButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  completedSetButton: {
    opacity: 0.7,
  },
  completeSetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeSetText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  restContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  restGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  restTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  restTime: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skipRestText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  allSetsContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  allSetsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  currentSetRow: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
  },
  completedSetRow: {
    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.15)' : '#F0FFF4',
  },
  setNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    width: 24,
  },
  setInfo: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginLeft: 12,
  },
  completionContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 40,
  },
  completionGradient: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  completionTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});