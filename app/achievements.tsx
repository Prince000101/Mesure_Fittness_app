import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Award, TrendingUp, Target, Zap, Calendar } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { getAchievements, markAchievementAsRead, Achievement } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function AchievementsScreen() {
  const { theme, isDark } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const userAchievements = await getAchievements();
      setAchievements(userAchievements);
      
      // Mark new achievements as read
      const newAchievements = userAchievements.filter(a => a.isNew);
      for (const achievement of newAchievements) {
        await markAchievementAsRead(achievement.id);
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'workout', label: 'Workouts', icon: Target },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'streak', label: 'Streaks', icon: Zap },
    { id: 'milestone', label: 'Milestones', icon: Award },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy;
      case 'Award': return Award;
      case 'TrendingUp': return TrendingUp;
      case 'Target': return Target;
      case 'Zap': return Zap;
      default: return Trophy;
    }
  };

  const getAchievementColor = (category: string) => {
    switch (category) {
      case 'workout': return '#0A84FF';
      case 'progress': return '#30D158';
      case 'streak': return '#FF6B35';
      case 'milestone': return '#FFD700';
      default: return theme.primary;
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const earnedCount = achievements.length;
  const totalPossible = 25; // This would be the total number of possible achievements

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <View style={styles.overviewContainer}>
          <LinearGradient
            colors={isDark ? ['#FFD700', '#FFA500'] : ['#FFD700', '#FFA500']}
            style={styles.overviewGradient}
          >
            <Trophy size={32} color="#FFFFFF" />
            <Text style={styles.overviewTitle}>Your Progress</Text>
            <Text style={styles.overviewStats}>
              {earnedCount} of {totalPossible} achievements earned
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[
                  styles.progressBarFill,
                  { width: `${(earnedCount / totalPossible) * 100}%` }
                ]} />
              </View>
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round((earnedCount / totalPossible) * 100)}% Complete
            </Text>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <IconComponent 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.iconName);
            const achievementColor = getAchievementColor(achievement.category);
            
            return (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementHeader}>
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: `${achievementColor}15` }
                  ]}>
                    <IconComponent size={24} color={achievementColor} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    <View style={styles.achievementMeta}>
                      <Calendar size={12} color={theme.textSecondary} />
                      <Text style={styles.achievementDate}>
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {achievement.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New!</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.categoryBadge}>
                  <Text style={[
                    styles.categoryBadgeText,
                    { color: achievementColor }
                  ]}>
                    {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Trophy size={64} color={theme.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Achievements Yet</Text>
            <Text style={styles.emptyStateDescription}>
              {selectedCategory === 'all' 
                ? 'Start working out to earn your first achievement!'
                : `No ${selectedCategory} achievements earned yet. Keep going!`
              }
            </Text>
          </View>
        )}

        {/* Upcoming Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>
          <Text style={styles.sectionDescription}>
            More achievements will be unlocked as you continue your fitness journey!
          </Text>
          
          <View style={styles.upcomingList}>
            {[
              { title: 'Marathon Runner', description: 'Complete a 42km run', category: 'milestone' },
              { title: 'Consistency Master', description: '30-day workout streak', category: 'streak' },
              { title: 'Strength Beast', description: 'Deadlift 2x your body weight', category: 'progress' },
            ].map((upcoming, index) => (
              <View key={index} style={[styles.achievementCard, styles.upcomingCard]}>
                <View style={styles.achievementHeader}>
                  <View style={[
                    styles.achievementIcon,
                    styles.upcomingIcon
                  ]}>
                    <Trophy size={24} color={theme.textSecondary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, styles.upcomingTitle]}>
                      {upcoming.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {upcoming.description}
                    </Text>
                  </View>
                  <View style={styles.lockedBadge}>
                    <Text style={styles.lockedBadgeText}>🔒</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overviewGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  overviewTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  overviewStats: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  achievementsList: {
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  upcomingCard: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingIcon: {
    backgroundColor: `${theme.textSecondary}15`,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 4,
  },
  upcomingTitle: {
    opacity: 0.7,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  newBadge: {
    backgroundColor: theme.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 16,
  },
  upcomingList: {
    gap: 12,
  },
  lockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadgeText: {
    fontSize: 16,
  },
});