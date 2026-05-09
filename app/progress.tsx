import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProgressScreen() {
  const { theme, isDark } = useTheme();
  const { workoutSessions, personalRecords, bodyMeasurements } = useWorkout();

  const completedSessions = workoutSessions.filter(s => s.completed);
  const totalWorkouts = completedSessions.length;

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']} style={styles.statGradient}>
              <BarChart3 size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts Done</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']} style={styles.statGradient}>
              <Trophy size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{personalRecords.length}</Text>
              <Text style={styles.statLabel}>Records Set</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.statGradient}>
              <Activity size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{bodyMeasurements.length}</Text>
              <Text style={styles.statLabel}>Measurements</Text>
            </LinearGradient>
          </View>
        </View>
        {totalWorkouts === 0 && (
          <View style={styles.emptyState}>
            <TrendingUp size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>No Progress Yet</Text>
            <Text style={styles.emptySubtitle}>Complete workouts to see your progress here</Text>
          </View>
        )}
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
  statsGrid: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  statCard: { flex: 1, height: 120, borderRadius: 16, overflow: 'hidden' },
  statGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statValue: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#FFFFFF', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12, fontFamily: 'Inter-Medium', color: '#FFFFFF', opacity: 0.9, textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: theme.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: theme.textSecondary, textAlign: 'center' },
});
