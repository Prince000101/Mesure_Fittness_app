import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { exerciseLibrary, Exercise } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';

export default function ExerciseLibraryScreen() {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exerciseLibrary.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMuscles}>{exercise.muscleGroups.join(', ')}</Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{exercise.difficulty}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{exercise.category}</Text>
              </View>
            </View>
          </View>
        ))}
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
  exerciseCard: {
    backgroundColor: theme.surface, borderRadius: 16, padding: 20, marginVertical: 8,
    shadowColor: theme.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2, elevation: 2,
  },
  exerciseName: { fontSize: 18, fontFamily: 'Inter-Bold', color: theme.text, marginBottom: 4 },
  exerciseMuscles: { fontSize: 14, fontFamily: 'Inter-Regular', color: theme.textSecondary, marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  badgeText: { fontSize: 12, fontFamily: 'Inter-Medium', color: theme.primary, textTransform: 'capitalize' },
});
