import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Clock, Dumbbell, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router, useLocalSearchParams } from 'expo-router';

export default function WorkoutDetailsScreen() {
  const { theme, isDark } = useTheme();
  const { workouts, startWorkoutSession } = useWorkout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = workouts.find(w => w.id === id);

  const styles = createStyles(theme, isDark);

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  const handleStartWorkout = async () => {
    await startWorkoutSession(workout.id);
    router.push('/workout-session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.name}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={16} color={theme.textSecondary} />
            <Text style={styles.infoText}>{workout.duration || 0} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Dumbbell size={16} color={theme.textSecondary} />
            <Text style={styles.infoText}>{workout.exercises.length} exercises</Text>
          </View>
          <View style={styles.infoItem}>
            <BarChart3 size={16} color={theme.textSecondary} />
            <Text style={styles.infoText}>{workout.difficulty}</Text>
          </View>
        </View>
        {workout.exercises.map((ex, i) => (
          <View key={ex.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseIndex}>{i + 1}</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
              <Text style={styles.exerciseSets}>{ex.targetSets} sets</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Play size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: theme.text },
  headerSpacer: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', gap: 16, marginVertical: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 14, fontFamily: 'Inter-Regular', color: theme.textSecondary },
  exerciseCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface,
    borderRadius: 16, padding: 20, marginBottom: 12, gap: 16,
  },
  exerciseIndex: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: theme.primary,
    textAlign: 'center', lineHeight: 32, color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 14,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: theme.text },
  exerciseSets: { fontSize: 13, fontFamily: 'Inter-Regular', color: theme.textSecondary, marginTop: 2 },
  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 16, gap: 8, marginVertical: 24,
  },
  startButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
});
