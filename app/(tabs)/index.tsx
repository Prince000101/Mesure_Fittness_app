import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, TrendingUp, Scale, Ruler, Activity, Dumbbell, Quote } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { workoutSessions, personalRecords, bodyMeasurements } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Get main lift PRs for display
  const getMainLiftPRs = () => {
    const mainLifts = ['Bench Press', 'Deadlift', 'Squat', 'Pull-ups'];
    return mainLifts.map(liftName => {
      const liftRecords = personalRecords.filter(pr => 
        pr.exercise.name === liftName && pr.type === 'weight'
      );
      
      if (liftRecords.length > 0) {
        const bestRecord = liftRecords.reduce((best, current) => 
          current.value > best.value ? current : best
        );
        
        return {
          exercise: liftName,
          value: bestRecord.value,
          unit: bestRecord.unit,
          date: bestRecord.date.toLocaleDateString(),
          improvement: '+5kg' // This would be calculated from previous records
        };
      }
      return null;
    }).filter(Boolean).slice(0, 4);
  };

  const mainLiftPRs = getMainLiftPRs();

  // Get current body measurements
  const getCurrentBodyStats = () => {
    const latestWeight = bodyMeasurements
      .filter(m => m.type === 'weight')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const latestBodyFat = bodyMeasurements
      .filter(m => m.type === 'bodyFat')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const latestMuscle = bodyMeasurements
      .filter(m => m.type === 'muscleMass')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      weight: latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : '75.2 kg',
      bodyFat: latestBodyFat ? `${latestBodyFat.value}${latestBodyFat.unit}` : '12.5%',
      muscle: latestMuscle ? `${latestMuscle.value} ${latestMuscle.unit}` : '62.7 kg',
    };
  };

  const currentBodyStats = getCurrentBodyStats();

  const measurements = [
    { part: 'Chest', current: '102 cm', change: '+1.5 cm' },
    { part: 'Arms', current: '38 cm', change: '+0.8 cm' },
    { part: 'Waist', current: '81 cm', change: '-2.1 cm' },
    { part: 'Thighs', current: '58 cm', change: '+1.2 cm' },
  ];

  const motivationalQuote = {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown"
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
            <Text style={styles.userName}>Fitness Enthusiast</Text>
            <Text style={styles.date}>
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Overview</Text>
          </View>
          
          <View style={styles.overviewContainer}>
            <View style={styles.overviewCard}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                style={styles.overviewGradient}
              >
                <Text style={styles.overviewLabel}>Current Weight</Text>
                <Text style={styles.overviewValue}>{currentBodyStats.weight}</Text>
                <Text style={styles.overviewChange}>+2.3 kg this month</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.overviewCard}>
              <LinearGradient
                colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']}
                style={styles.overviewGradient}
              >
                <Text style={styles.overviewLabel}>Body Fat</Text>
                <Text style={styles.overviewValue}>{currentBodyStats.bodyFat}</Text>
                <Text style={styles.overviewChange}>-1.2% this month</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        {mainLiftPRs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Records</Text>
              <TouchableOpacity onPress={() => router.push('/personal-records')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.recordsList}>
              {mainLiftPRs.map((record, index) => (
                <View key={index} style={styles.recordCard}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordExercise}>{record.exercise}</Text>
                    <Text style={styles.recordDetails}>
                      {record.date} • New record!
                    </Text>
                  </View>
                  <View style={styles.recordValue}>
                    <Text style={styles.recordWeight}>{record.value} {record.unit}</Text>
                    <View style={styles.improvementBadge}>
                      <TrendingUp size={12} color={theme.secondary} />
                      <Text style={styles.improvementText}>{record.improvement}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Body Measurements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/body-measurements')}
            >
              <Text style={styles.addButtonText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Current Body Stats Grid */}
          <View style={styles.bodyStatsGrid}>
            <View style={styles.bodyStatCard}>
              <View style={styles.bodyStatIcon}>
                <Scale size={20} color={theme.primary} />
              </View>
              <Text style={styles.bodyStatLabel}>Weight</Text>
              <Text style={styles.bodyStatValue}>{currentBodyStats.weight}</Text>
            </View>
            
            <View style={styles.bodyStatCard}>
              <View style={styles.bodyStatIcon}>
                <Activity size={20} color={theme.secondary} />
              </View>
              <Text style={styles.bodyStatLabel}>Body Fat</Text>
              <Text style={styles.bodyStatValue}>{currentBodyStats.bodyFat}</Text>
            </View>
            
            <View style={styles.bodyStatCard}>
              <View style={styles.bodyStatIcon}>
                <Dumbbell size={20} color='#FF6B35' />
              </View>
              <Text style={styles.bodyStatLabel}>Muscle</Text>
              <Text style={styles.bodyStatValue}>{currentBodyStats.muscle}</Text>
            </View>
          </View>

          {/* Detailed Measurements */}
          <View style={styles.measurementsList}>
            {measurements.map((measurement, index) => (
              <View key={index} style={styles.measurementCard}>
                <Text style={styles.measurementPart}>{measurement.part}</Text>
                <View style={styles.measurementValues}>
                  <Text style={styles.measurementCurrent}>{measurement.current}</Text>
                  <Text style={[
                    styles.measurementChange,
                    { color: measurement.change.startsWith('+') ? theme.secondary : theme.error }
                  ]}>
                    {measurement.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    </SafeAreaView>
  );
}

// Helper functions
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
  },
  overviewContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewChange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  recordsList: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  recordValue: {
    alignItems: 'flex-end',
  },
  recordWeight: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 6,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.15)' : '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  improvementText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: theme.secondary,
  },
  addButton: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
  },
  bodyStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bodyStatCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bodyStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bodyStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  bodyStatValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  measurementsList: {
    gap: 12,
  },
  measurementCard: {
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
  measurementPart: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  measurementValues: {
    alignItems: 'flex-end',
  },
  measurementCurrent: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 2,
  },
  measurementChange: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: theme.text,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
});