import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Scale, Ruler, Activity, Calendar, Save, X, Quote } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function BodyMeasurementsScreen() {
  const { theme, isDark } = useTheme();
  const { bodyMeasurements, addBodyMeasurement } = useWorkout();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    type: 'weight' as 'weight' | 'bodyFat' | 'muscleMass' | 'chest' | 'arms' | 'waist' | 'thighs' | 'custom',
    value: '',
    unit: 'kg',
    customName: '',
    notes: '',
  });

  const measurementTypes = [
    { key: 'weight', label: 'Weight', unit: 'kg', icon: Scale },
    { key: 'bodyFat', label: 'Body Fat', unit: '%', icon: Activity },
    { key: 'muscleMass', label: 'Muscle Mass', unit: 'kg', icon: Activity },
    { key: 'chest', label: 'Chest', unit: 'cm', icon: Ruler },
    { key: 'arms', label: 'Arms', unit: 'cm', icon: Ruler },
    { key: 'waist', label: 'Waist', unit: 'cm', icon: Ruler },
    { key: 'thighs', label: 'Thighs', unit: 'cm', icon: Ruler },
    { key: 'custom', label: 'Custom', unit: 'cm', icon: Ruler },
  ];

  const handleAddMeasurement = async () => {
    if (!newMeasurement.value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    if (newMeasurement.type === 'custom' && !newMeasurement.customName.trim()) {
      Alert.alert('Error', 'Please enter a name for custom measurement');
      return;
    }

    try {
      await addBodyMeasurement({
        type: newMeasurement.type,
        value: parseFloat(newMeasurement.value),
        unit: newMeasurement.unit,
        date: new Date(),
        notes: newMeasurement.notes || undefined,
        customName: newMeasurement.type === 'custom' ? newMeasurement.customName : undefined,
      });

      setShowAddModal(false);
      setNewMeasurement({
        type: 'weight',
        value: '',
        unit: 'kg',
        customName: '',
        notes: '',
      });

      Alert.alert('Success', 'Measurement added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add measurement');
    }
  };

  const getMeasurementsByType = () => {
    const grouped = bodyMeasurements.reduce((acc, measurement) => {
      const key = measurement.type === 'custom' 
        ? `custom_${measurement.customName}` 
        : measurement.type;
      
      if (!acc[key]) {
        acc[key] = {
          type: measurement.type,
          name: measurement.type === 'custom' ? measurement.customName! : measurement.type,
          measurements: [],
          unit: measurement.unit,
        };
      }
      acc[key].measurements.push(measurement);
      return acc;
    }, {} as Record<string, {
      type: string;
      name: string;
      measurements: typeof bodyMeasurements;
      unit: string;
    }>);

    // Sort measurements within each type by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key].measurements.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return grouped;
  };

  const measurementsByType = getMeasurementsByType();

  const getLatestMeasurement = (type: string) => {
    const measurements = bodyMeasurements.filter(m => m.type === type);
    if (measurements.length === 0) return null;
    return measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const calculateChange = (measurements: typeof bodyMeasurements) => {
    if (measurements.length < 2) return null;
    const latest = measurements[0];
    const previous = measurements[1];
    const change = latest.value - previous.value;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      unit: latest.unit,
    };
  };

  const motivationalQuote = {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn"
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Body Measurements</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
              style={styles.statGradient}
            >
              <Scale size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>
                {getLatestMeasurement('weight')?.value || '75.2'} kg
              </Text>
              <Text style={styles.statLabel}>Current Weight</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']}
              style={styles.statGradient}
            >
              <Activity size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>
                {getLatestMeasurement('bodyFat')?.value || '12.5'}%
              </Text>
              <Text style={styles.statLabel}>Body Fat</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#FF6B35', '#F7931E'] : ['#FF6B35', '#F7931E']}
              style={styles.statGradient}
            >
              <Ruler size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{Object.keys(measurementsByType).length}</Text>
              <Text style={styles.statLabel}>Tracked</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Measurements List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Measurements</Text>
          
          {Object.keys(measurementsByType).length > 0 ? (
            <View style={styles.measurementsList}>
              {Object.entries(measurementsByType).map(([key, group]) => {
                const change = calculateChange(group.measurements);
                const latest = group.measurements[0];
                
                return (
                  <View key={key} style={styles.measurementGroup}>
                    <View style={styles.measurementHeader}>
                      <Text style={styles.measurementName}>
                        {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
                      </Text>
                      <View style={styles.measurementCurrent}>
                        <Text style={styles.measurementValue}>
                          {latest.value} {latest.unit}
                        </Text>
                        {change && (
                          <Text style={[
                            styles.measurementChange,
                            { color: change.isPositive ? theme.secondary : theme.error }
                          ]}>
                            {change.isPositive ? '+' : '-'}{change.value} {change.unit}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.measurementHistory}>
                      <Text style={styles.historyTitle}>Recent History</Text>
                      {group.measurements.slice(0, 5).map((measurement, index) => (
                        <View key={measurement.id} style={styles.historyItem}>
                          <Text style={styles.historyDate}>
                            {measurement.date.toLocaleDateString()}
                          </Text>
                          <Text style={styles.historyValue}>
                            {measurement.value} {measurement.unit}
                          </Text>
                        </View>
                      ))}
                      
                      {group.measurements.length > 5 && (
                        <Text style={styles.moreHistory}>
                          +{group.measurements.length - 5} more entries
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Scale size={64} color={theme.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Measurements Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start tracking your body measurements to monitor your progress!
              </Text>
              <TouchableOpacity 
                style={styles.addFirstMeasurementButton}
                onPress={() => setShowAddModal(true)}
              >
                <LinearGradient
                  colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                  style={styles.addFirstMeasurementGradient}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.addFirstMeasurementText}>Add Your First Measurement</Text>
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

      {/* Add Measurement Modal */}
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
            <Text style={styles.modalTitle}>Add Measurement</Text>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={handleAddMeasurement}
            >
              <Save size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Measurement Type */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Measurement Type</Text>
              <View style={styles.typeGrid}>
                {measurementTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = newMeasurement.type === type.key;
                  
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeButton,
                        isSelected && styles.typeButtonActive
                      ]}
                      onPress={() => setNewMeasurement(prev => ({ 
                        ...prev, 
                        type: type.key as any,
                        unit: type.unit 
                      }))}
                    >
                      <Icon 
                        size={20} 
                        color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        isSelected && styles.typeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Name (if custom type selected) */}
            {newMeasurement.type === 'custom' && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Custom Measurement Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newMeasurement.customName}
                  onChangeText={(value) => setNewMeasurement(prev => ({ ...prev, customName: value }))}
                  placeholder="e.g., Neck, Forearms, Calves..."
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            {/* Value */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Value ({newMeasurement.unit})</Text>
              <TextInput
                style={styles.textInput}
                value={newMeasurement.value}
                onChangeText={(value) => setNewMeasurement(prev => ({ ...prev, value }))}
                placeholder={`Enter value in ${newMeasurement.unit}...`}
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={newMeasurement.notes}
                onChangeText={(value) => setNewMeasurement(prev => ({ ...prev, notes: value }))}
                placeholder="Add any notes about this measurement..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleAddMeasurement}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                style={styles.saveButtonGradient}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Measurement</Text>
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
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
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
  measurementsList: {
    gap: 16,
  },
  measurementGroup: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  measurementName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  measurementCurrent: {
    alignItems: 'flex-end',
  },
  measurementValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 4,
  },
  measurementChange: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  measurementHistory: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  historyValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  moreHistory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    textAlign: 'center',
    marginTop: 8,
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
  addFirstMeasurementButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFirstMeasurementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  addFirstMeasurementText: {
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
    minWidth: '45%',
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