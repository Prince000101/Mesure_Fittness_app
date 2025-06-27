import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Flame, 
  Target, 
  Trophy, 
  Calendar, 
  Plus, 
  Play, 
  Clock, 
  Zap, 
  Award,
  TrendingUp,
  Activity,
  Droplets
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useFitness } from '@/contexts/FitnessContext';

export default function DashboardScreen() {
  const { profile, activities, getStreakCount, getTodayActivities } = useFitness();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const streakCount = getStreakCount();
  const todayActivities = getTodayActivities();
  const todayCalories = todayActivities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
  const todaySteps = todayActivities.find(a => a.type === 'steps')?.value || 0;
  const todayWater = todayActivities.find(a => a.type === 'water')?.value || 0;

  const quickStats = [
    { label: 'Streak', value: `${streakCount}`, unit: 'days', icon: Flame, color: '#FF6B35' },
    { label: 'Calories', value: `${todayCalories}`, unit: 'kcal', icon: Zap, color: '#FF9500' },
    { label: 'Steps', value: `${todaySteps}`, unit: 'steps', icon: Activity, color: '#34C759' },
    { label: 'Water', value: `${todayWater}`, unit: 'ml', icon: Droplets, color: '#007AFF' },
  ];

  const quickWorkouts = [
    { name: '7-Min HIIT', duration: '7 min', difficulty: 'High', color: '#FF6B35' },
    { name: 'Morning Yoga', duration: '15 min', difficulty: 'Low', color: '#34C759' },
    { name: 'Core Blast', duration: '10 min', difficulty: 'Medium', color: '#FF9500' },
    { name: 'Cardio Burn', duration: '20 min', difficulty: 'High', color: '#007AFF' },
  ];

  const recentAchievements = [
    { title: 'First Workout', description: 'Completed your first workout!', icon: Trophy, color: '#FFD700' },
    { title: 'Week Warrior', description: '7-day workout streak', icon: Award, color: '#FF6B35' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
            <Text style={styles.userName}>{profile?.firstName || 'User'}</Text>
            <Text style={styles.date}>
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.profileImageContainer}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {profile?.firstName?.[0] || 'U'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <TouchableOpacity>
              <Calendar size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressCard}>
            <LinearGradient
              colors={['#007AFF', '#0056CC']}
              style={styles.progressGradient}
            >
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Daily Goals</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round((todayActivities.length / 5) * 100)}%
                </Text>
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{todayActivities.length}</Text>
                  <Text style={styles.progressLabel}>Activities</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{todayCalories}</Text>
                  <Text style={styles.progressLabel}>Calories</Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>{Math.round(todaySteps / 1000)}K</Text>
                  <Text style={styles.progressLabel}>Steps</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Start Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStartContainer}
          >
            {quickWorkouts.map((workout, index) => (
              <TouchableOpacity key={index} style={styles.quickStartCard}>
                <LinearGradient
                  colors={[workout.color, `${workout.color}CC`]}
                  style={styles.quickStartGradient}
                >
                  <Play size={24} color="#FFFFFF" style={styles.playIcon} />
                  <Text style={styles.quickStartName}>{workout.name}</Text>
                  <Text style={styles.quickStartDuration}>{workout.duration}</Text>
                  <Text style={styles.quickStartDifficulty}>{workout.difficulty} Intensity</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {todayActivities.length > 0 ? (
            <View style={styles.activitiesList}>
              {todayActivities.slice(0, 3).map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityIcon}>
                    <Activity size={20} color="#007AFF" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{activity.type}</Text>
                    <Text style={styles.activityDetails}>
                      {activity.value} {activity.unit} • {activity.duration} min
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
              <Activity size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>No activities today</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your fitness journey!</Text>
            </View>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          
          <View style={styles.achievementsList}>
            {recentAchievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}15` }]}>
                  <achievement.icon size={20} color={achievement.color} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New!</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Plus size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Log Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Target size={24} color="#34C759" />
              <Text style={styles.quickActionText}>Set Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <TrendingUp size={24} color="#FF9500" />
              <Text style={styles.quickActionText}>View Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Clock size={24} color="#FF6B35" />
              <Text style={styles.quickActionText}>Start Timer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  userName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginTop: 2,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  profileImageContainer: {
    marginTop: 8,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  progressCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressGradient: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quickStartContainer: {
    paddingRight: 20,
    gap: 12,
  },
  quickStartCard: {
    width: 140,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickStartGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  playIcon: {
    alignSelf: 'flex-end',
  },
  quickStartName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickStartDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quickStartDifficulty: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  activitiesList: {
    gap: 12,
  },
  activityCard: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
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
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  newBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
    marginTop: 8,
    textAlign: 'center',
  },
});