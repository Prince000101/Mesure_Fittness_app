import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Zap, 
  Activity, 
  Droplets, 
  Moon, 
  Save,
  RotateCcw,
  Target,
  TrendingUp
} from 'lucide-react-native';
import { useState } from 'react';
import { useFitness } from '@/contexts/FitnessContext';

export default function ActivityScreen() {
  const { addActivity, getTodayActivities } = useFitness();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activityData, setActivityData] = useState({
    exercise: { type: '', duration: '', intensity: '', calories: '' },
    steps: '',
    water: '',
    sleep: { hours: '', quality: 'Good' },
  });

  const todayActivities = getTodayActivities();

  const handleSaveActivity = (type: string) => {
    let value = 0;
    let unit = '';
    let duration = 0;
    let caloriesBurned = 0;

    switch (type) {
      case 'exercise':
        if (!activityData.exercise.type || !activityData.exercise.duration) {
          Alert.alert('Error', 'Please fill in exercise type and duration');
          return;
        }
        value = 1;
        unit = 'workout';
        duration = parseInt(activityData.exercise.duration) || 0;
        caloriesBurned = parseInt(activityData.exercise.calories) || 0;
        break;
      case 'steps':
        if (!activityData.steps) {
          Alert.alert('Error', 'Please enter step count');
          return;
        }
        value = parseInt(activityData.steps) || 0;
        unit = 'steps';
        caloriesBurned = Math.round(value * 0.04); // Rough estimate
        break;
      case 'water':
        if (!activityData.water) {
          Alert.alert('Error', 'Please enter water intake');
          return;
        }
        value = parseInt(activityData.water) || 0;
        unit = 'ml';
        break;
      case 'sleep':
        if (!activityData.sleep.hours) {
          Alert.alert('Error', 'Please enter sleep hours');
          return;
        }
        value = parseFloat(activityData.sleep.hours) || 0;
        unit = 'hours';
        duration = value * 60; // Convert to minutes
        break;
    }

    addActivity({
      type,
      value,
      unit,
      duration,
      caloriesBurned,
      date: selectedDate,
      notes: type === 'exercise' ? `${activityData.exercise.type} - ${activityData.exercise.intensity} intensity` : '',
    });

    Alert.alert('Success', 'Activity saved successfully!');
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all activity data for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setActivityData({
              exercise: { type: '', duration: '', intensity: '', calories: '' },
              steps: '',
              water: '',
              sleep: { hours: '', quality: 'Good' },
            });
            Alert.alert('Success', 'All data has been reset');
          }
        }
      ]
    );
  };

  const getTotalCalories = () => {
    return todayActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
  };

  const getTotalSteps = () => {
    const stepsActivity = todayActivities.find(a => a.type === 'steps');
    return stepsActivity?.value || 0;
  };

  const getTotalWater = () => {
    const waterActivity = todayActivities.find(a => a.type === 'water');
    return waterActivity?.value || 0;
  };

  const getSleepHours = () => {
    const sleepActivity = todayActivities.find(a => a.type === 'sleep');
    return sleepActivity?.value || 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Activity</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetAll}>
          <RotateCcw size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <View style={styles.dateCard}>
            <Calendar size={24} color="#007AFF" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.dateSubtext}>Track your daily activities</Text>
            </View>
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Zap size={20} color="#FF9500" />
              <Text style={styles.summaryValue}>{getTotalCalories()}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
            <View style={styles.summaryCard}>
              <Activity size={20} color="#34C759" />
              <Text style={styles.summaryValue}>{getTotalSteps()}</Text>
              <Text style={styles.summaryLabel}>Steps</Text>
            </View>
            <View style={styles.summaryCard}>
              <Droplets size={20} color="#007AFF" />
              <Text style={styles.summaryValue}>{getTotalWater()}</Text>
              <Text style={styles.summaryLabel}>Water (ml)</Text>
            </View>
            <View style={styles.summaryCard}>
              <Moon size={20} color="#5856D6" />
              <Text style={styles.summaryValue}>{getSleepHours()}</Text>
              <Text style={styles.summaryLabel}>Sleep (h)</Text>
            </View>
          </View>
        </View>

        {/* Exercise Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Log</Text>
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Target size={24} color="#FF6B35" />
              </View>
              <Text style={styles.cardTitle}>Workout Session</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exercise Type</Text>
              <TextInput
                style={styles.textInput}
                value={activityData.exercise.type}
                onChangeText={(value) => setActivityData(prev => ({
                  ...prev,
                  exercise: { ...prev.exercise, type: value }
                }))}
                placeholder="e.g., Running, Weight Training, Yoga"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.textInput}
                  value={activityData.exercise.duration}
                  onChangeText={(value) => setActivityData(prev => ({
                    ...prev,
                    exercise: { ...prev.exercise, duration: value }
                  }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.textInput}
                  value={activityData.exercise.calories}
                  onChangeText={(value) => setActivityData(prev => ({
                    ...prev,
                    exercise: { ...prev.exercise, calories: value }
                  }))}
                  placeholder="250"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Intensity</Text>
              <View style={styles.intensityButtons}>
                {['Low', 'Medium', 'High'].map((intensity) => (
                  <TouchableOpacity
                    key={intensity}
                    style={[
                      styles.intensityButton,
                      activityData.exercise.intensity === intensity && styles.intensityButtonActive
                    ]}
                    onPress={() => setActivityData(prev => ({
                      ...prev,
                      exercise: { ...prev.exercise, intensity }
                    }))}
                  >
                    <Text style={[
                      styles.intensityButtonText,
                      activityData.exercise.intensity === intensity && styles.intensityButtonTextActive
                    ]}>
                      {intensity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSaveActivity('exercise')}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps Counter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps Counter</Text>
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Activity size={24} color="#34C759" />
              </View>
              <Text style={styles.cardTitle}>Daily Steps</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Step Count</Text>
              <TextInput
                style={styles.textInput}
                value={activityData.steps}
                onChangeText={(value) => setActivityData(prev => ({ ...prev, steps: value }))}
                placeholder="10000"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSaveActivity('steps')}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Intake</Text>
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Droplets size={24} color="#007AFF" />
              </View>
              <Text style={styles.cardTitle}>Hydration Tracking</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Water Intake (ml)</Text>
              <TextInput
                style={styles.textInput}
                value={activityData.water}
                onChangeText={(value) => setActivityData(prev => ({ ...prev, water: value }))}
                placeholder="2000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.quickWaterButtons}>
              {[250, 500, 750, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickButton}
                  onPress={() => setActivityData(prev => ({ 
                    ...prev, 
                    water: (parseInt(prev.water) || 0 + amount).toString()
                  }))}
                >
                  <Text style={styles.quickButtonText}>+{amount}ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSaveActivity('water')}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Water Intake</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Tracking</Text>
          <View style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Moon size={24} color="#5856D6" />
              </View>
              <Text style={styles.cardTitle}>Sleep Quality</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sleep Hours</Text>
              <TextInput
                style={styles.textInput}
                value={activityData.sleep.hours}
                onChangeText={(value) => setActivityData(prev => ({
                  ...prev,
                  sleep: { ...prev.sleep, hours: value }
                }))}
                placeholder="8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sleep Quality</Text>
              <View style={styles.qualityButtons}>
                {['Poor', 'Fair', 'Good', 'Excellent'].map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityButton,
                      activityData.sleep.quality === quality && styles.qualityButtonActive
                    ]}
                    onPress={() => setActivityData(prev => ({
                      ...prev,
                      sleep: { ...prev.sleep, quality }
                    }))}
                  >
                    <Text style={[
                      styles.qualityButtonText,
                      activityData.sleep.quality === quality && styles.qualityButtonTextActive
                    ]}>
                      {quality}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => handleSaveActivity('sleep')}
            >
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Sleep Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {todayActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {todayActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Activity size={16} color="#007AFF" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{activity.type}</Text>
                    <Text style={styles.activityDetails}>
                      {activity.value} {activity.unit}
                      {activity.caloriesBurned ? ` • ${activity.caloriesBurned} cal` : ''}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {new Date(activity.date).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <TrendingUp size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No activities logged today</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your activities above!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dateInfo: {
    marginLeft: 16,
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  dateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  intensityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  intensityButtonTextActive: {
    color: '#FFFFFF',
  },
  quickWaterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#5856D6',
    borderColor: '#5856D6',
  },
  qualityButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  qualityButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  activityDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  activityTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});