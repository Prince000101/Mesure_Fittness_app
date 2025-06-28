import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Repeat, Save } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkoutExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  weight?: number;
}

interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  schedule: {
    type: 'specific_dates' | 'weekdays' | 'daily' | 'custom';
    dates?: string[];
    weekdays?: number[];
    interval?: number;
  };
  isActive: boolean;
}

const STORAGE_KEY = 'workout_routines';

export default function CreateWorkoutRoutineScreen() {
  const { theme, isDark } = useTheme();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [scheduleType, setScheduleType] = useState<'specific_dates' | 'weekdays' | 'daily' | 'custom'>('weekdays');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const weekdays = [
    { id: 0, name: 'Sun', fullName: 'Sunday' },
    { id: 1, name: 'Mon', fullName: 'Monday' },
    { id: 2, name: 'Tue', fullName: 'Tuesday' },
    { id: 3, name: 'Wed', fullName: 'Wednesday' },
    { id: 4, name: 'Thu', fullName: 'Thursday' },
    { id: 5, name: 'Fri', fullName: 'Friday' },
    { id: 6, name: 'Sat', fullName: 'Saturday' },
  ];

  const exerciseTemplates = [
    'Push-ups',
    'Squats',
    'Plank',
    'Burpees',
    'Jumping Jacks',
    'Lunges',
    'Mountain Climbers',
    'Sit-ups',
    'Pull-ups',
    'Deadlifts',
    'Bench Press',
    'Running',
    'Cycling',
    'Swimming',
  ];

  const addExercise = (exerciseName?: string) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exerciseName || '',
      sets: 3,
      reps: 10,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof WorkoutExercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const toggleWeekday = (dayId: number) => {
    setSelectedWeekdays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    if (scheduleType === 'weekdays' && selectedWeekdays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    setIsSaving(true);

    try {
      const routine: WorkoutRoutine = {
        id: Date.now().toString(),
        name: routineName,
        exercises,
        schedule: {
          type: scheduleType,
          weekdays: scheduleType === 'weekdays' ? selectedWeekdays : undefined,
          dates: scheduleType === 'specific_dates' ? selectedDates : undefined,
        },
        isActive,
      };

      // Load existing routines
      const existingRoutinesData = await AsyncStorage.getItem(STORAGE_KEY);
      const existingRoutines: WorkoutRoutine[] = existingRoutinesData 
        ? JSON.parse(existingRoutinesData) 
        : [];

      // Add new routine
      const updatedRoutines = [...existingRoutines, routine];
      
      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRoutines));
      
      Alert.alert(
        'Success',
        'Workout routine created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to save routine:', error);
      Alert.alert('Error', 'Failed to save workout routine. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Routine</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={saveRoutine}
          disabled={isSaving}
        >
          <Save size={20} color={isSaving ? theme.textSecondary : theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Routine Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Routine Name</Text>
          <TextInput
            style={styles.textInput}
            value={routineName}
            onChangeText={setRoutineName}
            placeholder="Enter routine name..."
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        {/* Schedule Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleTypes}>
            {[
              { key: 'weekdays', label: 'Weekdays', icon: Repeat },
              { key: 'daily', label: 'Daily', icon: Calendar },
              { key: 'specific_dates', label: 'Specific Dates', icon: Calendar },
              { key: 'custom', label: 'Custom', icon: Clock },
            ].map((type) => {
              const Icon = type.icon;
              const isSelected = scheduleType === type.key;
              
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.scheduleTypeButton,
                    isSelected && styles.scheduleTypeButtonActive
                  ]}
                  onPress={() => setScheduleType(type.key as any)}
                >
                  <Icon 
                    size={20} 
                    color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.scheduleTypeText,
                    isSelected && styles.scheduleTypeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Weekday Selection */}
          {scheduleType === 'weekdays' && (
            <View style={styles.weekdaySelection}>
              <Text style={styles.subsectionTitle}>Select Days</Text>
              <View style={styles.weekdayGrid}>
                {weekdays.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.weekdayButton,
                      selectedWeekdays.includes(day.id) && styles.weekdayButtonActive
                    ]}
                    onPress={() => toggleWeekday(day.id)}
                  >
                    <Text style={[
                      styles.weekdayButtonText,
                      selectedWeekdays.includes(day.id) && styles.weekdayButtonTextActive
                    ]}>
                      {day.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Daily Schedule Info */}
          {scheduleType === 'daily' && (
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleInfoText}>
                This routine will be scheduled every day
              </Text>
            </View>
          )}

          {/* Specific Dates */}
          {scheduleType === 'specific_dates' && (
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleInfoText}>
                Select specific dates for this routine (coming soon)
              </Text>
            </View>
          )}

          {/* Custom Schedule */}
          {scheduleType === 'custom' && (
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleInfoText}>
                Custom scheduling options (coming soon)
              </Text>
            </View>
          )}
        </View>

        {/* Exercises */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => addExercise()}
            >
              <Plus size={20} color={theme.primary} />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* Exercise Templates */}
          <View style={styles.exerciseTemplates}>
            <Text style={styles.subsectionTitle}>Quick Add</Text>
            <View style={styles.templateGrid}>
              {exerciseTemplates.map((template) => (
                <TouchableOpacity
                  key={template}
                  style={styles.templateButton}
                  onPress={() => addExercise(template)}
                >
                  <Text style={styles.templateButtonText}>{template}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exercisesList}>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                  <TextInput
                    style={styles.exerciseNameInput}
                    value={exercise.name}
                    onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                    placeholder="Exercise name..."
                    placeholderTextColor={theme.textSecondary}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeExercise(exercise.id)}
                  >
                    <Trash2 size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.exerciseDetails}>
                  <View style={styles.exerciseDetailItem}>
                    <Text style={styles.exerciseDetailLabel}>Sets</Text>
                    <TextInput
                      style={styles.exerciseDetailInput}
                      value={exercise.sets?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'sets', parseInt(value) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  <View style={styles.exerciseDetailItem}>
                    <Text style={styles.exerciseDetailLabel}>Reps</Text>
                    <TextInput
                      style={styles.exerciseDetailInput}
                      value={exercise.reps?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'reps', parseInt(value) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>

                  <View style={styles.exerciseDetailItem}>
                    <Text style={styles.exerciseDetailLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.exerciseDetailInput}
                      value={exercise.weight?.toString() || ''}
                      onChangeText={(value) => updateExercise(exercise.id, 'weight', parseFloat(value) || 0)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>
              </View>
            ))}

            {exercises.length === 0 && (
              <View style={styles.emptyExercises}>
                <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
                <Text style={styles.emptyExercisesSubtext}>
                  Add exercises using the button above or quick add templates
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Routine Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Active Routine</Text>
              <Text style={styles.settingDescription}>
                Enable this routine to appear in your calendar
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.saveButtonLarge, isSaving && styles.saveButtonDisabled]} 
            onPress={saveRoutine}
            disabled={isSaving}
          >
            <LinearGradient
              colors={isSaving 
                ? [theme.textSecondary, theme.textSecondary]
                : isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']
              }
              style={styles.saveButtonGradient}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Routine'}
              </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scheduleTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  scheduleTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  scheduleTypeButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  scheduleTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },
  scheduleTypeTextActive: {
    color: '#FFFFFF',
  },
  weekdaySelection: {
    marginTop: 16,
  },
  weekdayGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  weekdayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  weekdayButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  weekdayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },
  weekdayButtonTextActive: {
    color: '#FFFFFF',
  },
  scheduleInfo: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.1)' : '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  scheduleInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.primary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
  },
  exerciseTemplates: {
    marginBottom: 20,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  templateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  exerciseNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.primary,
    width: 24,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    paddingVertical: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255, 59, 48, 0.15)' : '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseDetailItem: {
    flex: 1,
  },
  exerciseDetailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  exerciseDetailInput: {
    backgroundColor: theme.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    textAlign: 'center',
  },
  emptyExercises: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  emptyExercisesText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  saveButtonLarge: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});