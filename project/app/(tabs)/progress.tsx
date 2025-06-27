import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  TrendingUp, 
  Award, 
  Share, 
  Download, 
  Scale, 
  Ruler, 
  Activity, 
  Target,
  Trophy,
  Zap,
  BarChart3
} from 'lucide-react-native';
import { useState } from 'react';
import { useFitness } from '@/contexts/FitnessContext';

const { width: screenWidth } = Dimensions.get('window');

export default function ProgressScreen() {
  const { profile, activities, getStreakCount } = useFitness();
  const [selectedPeriod, setSelectedPeriod] = useState('Month');

  const periods = ['Week', 'Month', '3 Months', 'Year'];

  const streakCount = getStreakCount();
  const totalActivities = activities.length;
  const totalCalories = activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);

  const progressData = {
    currentWeight: profile?.weight || 0,
    goalWeight: profile?.weight ? profile.weight - 5 : 0,
    weightChange: '+2.3 kg',
    bmi: profile?.height && profile?.weight 
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : '0',
  };

  const achievements = [
    { title: 'First Workout', description: 'Completed your first workout!', date: '2 days ago', icon: Trophy, color: '#FFD700', earned: true },
    { title: 'Week Warrior', description: '7-day workout streak', date: '1 week ago', icon: Award, color: '#FF6B35', earned: true },
    { title: 'Calorie Crusher', description: 'Burned 1000+ calories', date: '2 weeks ago', icon: Zap, color: '#FF9500', earned: true },
    { title: 'Consistency King', description: '30-day streak', date: '1 month ago', icon: Target, color: '#34C759', earned: false },
  ];

  const personalRecords = [
    { exercise: 'Running', value: '5.2 km', date: '2 days ago', improvement: '+0.5 km', category: 'Cardio' },
    { exercise: 'Push-ups', value: '25 reps', date: '1 week ago', improvement: '+5 reps', category: 'Strength' },
    { exercise: 'Plank', value: '2:30 min', date: '1 week ago', improvement: '+30s', category: 'Core' },
    { exercise: 'Squats', value: '50 reps', date: '2 weeks ago', improvement: '+10 reps', category: 'Strength' },
  ];

  const monthlyReport = {
    workoutsCompleted: totalActivities,
    totalHours: Math.round(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60 * 10) / 10,
    caloriesBurned: totalCalories,
    avgHeartRate: 142,
    strengthGains: '+12%',
    bodyFatLoss: '-1.8%',
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: '#007AFF' };
    if (bmi < 25) return { status: 'Normal', color: '#34C759' };
    if (bmi < 30) return { status: 'Overweight', color: '#FF9500' };
    return { status: 'Obese', color: '#FF3B30' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Download size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['#007AFF', '#0056CC']}
              style={styles.overviewGradient}
            >
              <Scale size={24} color="#FFFFFF" />
              <Text style={styles.overviewLabel}>Current Weight</Text>
              <Text style={styles.overviewValue}>{progressData.currentWeight} kg</Text>
              <Text style={styles.overviewChange}>{progressData.weightChange} this month</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['#34C759', '#28A745']}
              style={styles.overviewGradient}
            >
              <Activity size={24} color="#FFFFFF" />
              <Text style={styles.overviewLabel}>BMI</Text>
              <Text style={styles.overviewValue}>{progressData.bmi}</Text>
              <Text style={styles.overviewChange}>
                {getBMIStatus(Number(progressData.bmi)).status}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Trophy size={20} color="#FFD700" />
              </View>
              <Text style={styles.statValue}>{streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Activity size={20} color="#007AFF" />
              </View>
              <Text style={styles.statValue}>{totalActivities}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Zap size={20} color="#FF9500" />
              </View>
              <Text style={styles.statValue}>{totalCalories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Target size={20} color="#34C759" />
              </View>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Goal Progress</Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Chart</Text>
            <TouchableOpacity style={styles.calendarButton}>
              <Calendar size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Period Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.periodSelector}
            contentContainerStyle={styles.periodContent}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chart Placeholder */}
          <View style={styles.chartContainer}>
            <BarChart3 size={48} color="#007AFF" />
            <Text style={styles.chartPlaceholder}>Progress Chart</Text>
            <Text style={styles.chartSubtext}>
              Visual representation of your {selectedPeriod.toLowerCase()} progress
            </Text>
          </View>
        </View>

        {/* Monthly Report */}
        <View style={styles.reportSection}>
          <Text style={styles.sectionTitle}>Monthly Report</Text>
          <View style={styles.reportCard}>
            <LinearGradient
              colors={['#FF6B35', '#F7931E']}
              style={styles.reportGradient}
            >
              <Text style={styles.reportTitle}>This Month Summary</Text>
              <View style={styles.reportStats}>
                <View style={styles.reportItem}>
                  <Text style={styles.reportValue}>{monthlyReport.workoutsCompleted}</Text>
                  <Text style={styles.reportLabel}>Workouts</Text>
                </View>
                <View style={styles.reportItem}>
                  <Text style={styles.reportValue}>{monthlyReport.totalHours}h</Text>
                  <Text style={styles.reportLabel}>Total Time</Text>
                </View>
                <View style={styles.reportItem}>
                  <Text style={styles.reportValue}>{monthlyReport.caloriesBurned}</Text>
                  <Text style={styles.reportLabel}>Calories</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.recordsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recordsList}>
            {personalRecords.slice(0, 3).map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>{record.exercise}</Text>
                  <Text style={styles.recordCategory}>{record.category}</Text>
                  <Text style={styles.recordDetails}>
                    {record.date} • {record.improvement} improvement
                  </Text>
                </View>
                <View style={styles.recordValue}>
                  <Text style={styles.recordWeight}>{record.value}</Text>
                  <View style={styles.improvementBadge}>
                    <Text style={styles.improvementText}>{record.improvement}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Body Measurements */}
        <View style={styles.measurementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Measurement</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.measurementsList}>
            {[
              { part: 'Weight', current: `${profile?.weight || 0} kg`, change: '+2.3 kg', target: `${(profile?.weight || 0) - 5} kg` },
              { part: 'Height', current: `${profile?.height || 0} cm`, change: '0 cm', target: `${profile?.height || 0} cm` },
            ].map((measurement, index) => (
              <View key={index} style={styles.measurementCard}>
                <View style={styles.measurementInfo}>
                  <Text style={styles.measurementPart}>{measurement.part}</Text>
                  <Text style={styles.measurementTarget}>Target: {measurement.target}</Text>
                </View>
                <View style={styles.measurementValues}>
                  <Text style={styles.measurementCurrent}>{measurement.current}</Text>
                  <Text style={[
                    styles.measurementChange,
                    { color: measurement.change.startsWith('+') ? '#34C759' : '#FF3B30' }
                  ]}>
                    {measurement.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={[
                  styles.achievementIcon, 
                  { backgroundColor: `${achievement.color}15` },
                  !achievement.earned && styles.achievementIconDisabled
                ]}>
                  <achievement.icon 
                    size={24} 
                    color={achievement.earned ? achievement.color : '#8E8E93'} 
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.earned && styles.achievementTextDisabled
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={[
                    styles.achievementDescription,
                    !achievement.earned && styles.achievementTextDisabled
                  ]}>
                    {achievement.description}
                  </Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
                <View style={[
                  styles.achievementBadge,
                  { backgroundColor: achievement.earned ? achievement.color : '#8E8E93' }
                ]}>
                  <Text style={styles.achievementBadgeText}>
                    {achievement.earned ? '✓' : '○'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          
          {profile?.fitnessGoals && profile.fitnessGoals.length > 0 ? (
            <View style={styles.goalsList}>
              {profile.fitnessGoals.slice(0, 3).map((goal, index) => (
                <View key={index} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal}</Text>
                    <Text style={styles.goalProgress}>
                      {Math.floor(Math.random() * 40) + 60}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[
                        styles.progressBarFill,
                        { width: `${Math.floor(Math.random() * 40) + 60}%` }
                      ]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyGoals}>
              <Target size={48} color="#8E8E93" />
              <Text style={styles.emptyGoalsText}>No fitness goals set</Text>
              <Text style={styles.emptyGoalsSubtext}>Set your goals in the profile section</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  overviewContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overviewGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  overviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 24,
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
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  calendarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodContent: {
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartPlaceholder: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  reportSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  reportCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  reportGradient: {
    padding: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  reportItem: {
    alignItems: 'center',
  },
  reportValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reportLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  recordsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  recordCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  recordValue: {
    alignItems: 'flex-end',
  },
  recordWeight: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  improvementBadge: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  improvementText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#34C759',
  },
  measurementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  measurementsList: {
    gap: 12,
  },
  measurementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementPart: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  measurementTarget: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  measurementValues: {
    alignItems: 'flex-end',
  },
  measurementCurrent: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  measurementChange: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconDisabled: {
    backgroundColor: '#F2F2F7 !important',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 2,
  },
  achievementTextDisabled: {
    opacity: 0.5,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  goalsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  goalProgress: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  emptyGoals: {
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
  emptyGoalsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyGoalsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
});