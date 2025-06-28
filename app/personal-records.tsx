import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Trophy, TrendingUp, Calendar, Save, X, Quote } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PersonalRecordsScreen() {
  const { theme, isDark } = useTheme();
  const { personalRecords, addPersonalRecord } = useWorkout();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    exerciseName: '',
    type: 'weight' as 'weight' | 'reps' | 'duration' | 'distance',
    value: '',
    unit: 'kg',
  });

  const recordTypes = [
    { key: 'weight', label: 'Weight', unit: 'kg' },
    { key: 'reps', label: 'Reps', unit: 'reps' },
    { key: 'duration', label: 'Duration', unit: 'seconds' },
    { key: 'distance', label: 'Distance', unit: 'meters' },
  ];

  const exerciseTemplates = [
    'Bench Press',
    'Deadlift',
    'Squat',
    'Pull-ups',
    'Push-ups',
    'Overhead Press',
    'Barbell Row',
    'Dumbbell Press',
    'Leg Press',
    'Bicep Curls',
    'Running',
    'Cycling',
    'Swimming',
    'Plank',
  ];

  const handleAddRecord = async () => {
    if (!newRecord.exerciseName.trim() || !newRecord.value.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const exercise = {
        id: Date.now().toString(),
        name: newRecord.exerciseName,
        category: 'strength' as const,
        muscleGroups: ['General'],
        equipment: ['Various'],
        instructions: [],
        difficulty: 'intermediate' as const,
      };

      await addPersonalRecord({
        exercise,
        type: newRecord.type,
        value: parseFloat(newRecord.value),
        unit: newRecord.unit,
        date: new Date(),
      });

      setShowAddModal(false);
      setNewRecord({
        exerciseName: '',
        type: 'weight',
        value: '',
        unit: 'kg',
      });

      Alert.alert('Success', 'Personal record added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add personal record');
    }
  };

  const getRecordsByExercise = () => {
    const grouped = personalRecords.reduce((acc, record) => {
      const exerciseName = record.exercise.name;
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push(record);
      return acc;
    }, {} as Record<string, typeof personalRecords>);

    // Sort records within each exercise by value (descending)
    Object.keys(grouped).forEach(exerciseName => {
      grouped[exerciseName].sort((a, b) => b.value - a.value);
    });

    return grouped;
  };

  const recordsByExercise = getRecordsByExercise();

  const motivationalQuote = {
    text: "Champions aren't made in the gyms. Champions are made from something deep inside them - a desire, a dream, a vision.",
    author: "Muhammad Ali"
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Records</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#FFD700', '#FFA500'] : ['#FFD700', '#FFA500']}
              style={styles.statGradient}
            >
              <Trophy size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{personalRecords.length}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']}
              style={styles.statGradient}
            >
              <TrendingUp size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{Object.keys(recordsByExercise).length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Records</Text>
          
          {Object.keys(recordsByExercise).length > 0 ? (
            <View style={styles.recordsList}>
              {Object.entries(recordsByExercise).map(([exerciseName, records]) => (
                <View key={exerciseName} style={styles.exerciseGroup}>
                  <Text style={styles.exerciseName}>{exerciseName}</Text>
                  
                  {records.map((record, index) => (
                    <View key={record.id} style={[
                      styles.recordCard,
                      index === 0 && styles.bestRecordCard
                    ]}>
                      <View style={styles.recordInfo}>
                        <View style={styles.recordHeader}>
                          <Text style={styles.recordType}>
                            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                          </Text>
                          {index === 0 && (
                            <View style={styles.bestBadge}>
                              <Trophy size={12} color="#FFD700" />
                              <Text style={styles.bestBadgeText}>Best</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.recordDate}>
                          {record.date.toLocaleDateString()}
                        </Text>
                      </View>
                      
                      <View style={styles.recordValue}>
                        <Text style={styles.recordNumber}>
                          {record.value} {record.unit}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={64} color={theme.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Records Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start tracking your personal records to see your progress!
              </Text>
              <TouchableOpacity 
                style={styles.addFirstRecordButton}
                onPress={() => setShowAddModal(true)}
              >
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                  style={styles.addFirstRecordGradient}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.addFirstRecordText}>Add Your First Record</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Motivational Quote */}
        <View style={styles.section}>
          <View style={styles.quoteCard}>
            <View style={styles.quoteIcon}>
              <Quote size={24} color={theme.primary} />
            </View>
            <Text style={styles.quoteText}>"{motivationalQuote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {motivationalQuote.author}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Record Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Personal Record</Text>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={handleAddRecord}
            >
              <Save size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Exercise Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Exercise Name</Text>
              <TextInput
                style={styles.textInput}
                value={newRecord.exerciseName}
                onChangeText={(value) => setNewRecord(prev => ({ ...prev, exerciseName: value }))}
                placeholder="Enter exercise name..."
                placeholderTextColor={theme.textSecondary}
              />
              
              {/* Exercise Templates */}
              <View style={styles.templatesContainer}>
                <Text style={styles.templatesLabel}>Quick Select:</Text>
                <View style={styles.templatesGrid}>
                  {exerciseTemplates.map((template) => (
                    <TouchableOpacity
                      key={template}
                      style={styles.templateButton}
                      onPress={() => setNewRecord(prev => ({ ...prev, exerciseName: template }))}
                    >
                      <Text style={styles.templateButtonText}>{template}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Record Type */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Record Type</Text>
              <View style={styles.typeButtons}>
                {recordTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      newRecord.type === type.key && styles.typeButtonActive
                    ]}
                    onPress={() => setNewRecord(prev => ({ 
                      ...prev, 
                      type: type.key as any,
                      unit: type.unit 
                    }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newRecord.type === type.key && styles.typeButtonTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Value */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Value ({newRecord.unit})</Text>
              <TextInput
                style={styles.textInput}
                value={newRecord.value}
                onChangeText={(value) => setNewRecord(prev => ({ ...prev, value }))}
                placeholder={`Enter ${newRecord.type} value...`}
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleAddRecord}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                style={styles.saveButtonGradient}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Record</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 16,
  },
  recordsList: {
    gap: 20,
  },
  exerciseGroup: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 12,
  },
  recordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.background,
    marginBottom: 8,
  },
  bestRecordCard: {
    backgroundColor: isDark ? 'rgba(255, 215, 0, 0.1)' : '#FFFBF0',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 215, 0, 0.3)' : '#FFD700',
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(255, 215, 0, 0.2)' : '#FFD70020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFD700',
  },
  recordDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  recordValue: {
    alignItems: 'flex-end',
  },
  recordNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
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
  emptyStateTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstRecordButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFirstRecordGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  addFirstRecordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quoteCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteIcon: {
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 8,
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
  templatesContainer: {
    marginTop: 12,
  },
  templatesLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  templateButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 20,
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