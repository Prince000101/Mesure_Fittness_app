import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Target, Calendar, TrendingUp, CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { getFitnessGoals, updateFitnessGoal, FitnessGoal } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function FitnessGoalsScreen() {
  const { theme, isDark } = useTheme();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const fitnessGoals = await getFitnessGoals();
      setGoals(fitnessGoals);
    } catch (error) {
      Alert.alert('Error', 'Failed to load fitness goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateFitnessGoal(goalId, { isCompleted: true });
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, isCompleted: true } : goal
      ));
      Alert.alert('Congratulations!', 'Goal completed successfully! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const getProgressPercentage = (goal: FitnessGoal): number => {
    if (goal.isCompleted) return 100;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getTimeRemaining = (targetDate: string): string => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 7) return `${diffDays} days left`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const activeGoals = goals.filter(goal => !goal.isCompleted);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fitness Goals</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
              style={styles.statGradient}
            >
              <Target size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{activeGoals.length}</Text>
              <Text style={styles.statLabel}>Active Goals</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={isDark ? ['#30D158', '#28A745'] : ['#34C759', '#28A745']}
              style={styles.statGradient}
            >
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{completedGoals.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <View style={styles.goalsList}>
              {activeGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleContainer}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalProgress}>
                        {Math.round(getProgressPercentage(goal))}%
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleCompleteGoal(goal.id)}
                    >
                      <CheckCircle size={16} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                  
                  <View style={styles.goalMetrics}>
                    <View style={styles.goalMetric}>
                      <Text style={styles.goalMetricLabel}>Current</Text>
                      <Text style={styles.goalMetricValue}>
                        {goal.currentValue} {goal.unit}
                      </Text>
                    </View>
                    <View style={styles.goalMetric}>
                      <Text style={styles.goalMetricLabel}>Target</Text>
                      <Text style={styles.goalMetricValue}>
                        {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                    <View style={styles.goalMetric}>
                      <Text style={styles.goalMetricLabel}>Time Left</Text>
                      <Text style={styles.goalMetricValue}>
                        {getTimeRemaining(goal.targetDate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View style={[
                        styles.progressBarFill,
                        { width: `${getProgressPercentage(goal)}%` }
                      ]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Goals</Text>
            <View style={styles.goalsList}>
              {completedGoals.map((goal) => (
                <View key={goal.id} style={[styles.goalCard, styles.completedGoalCard]}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalTitleContainer}>
                      <Text style={[styles.goalTitle, styles.completedGoalTitle]}>
                        {goal.title}
                      </Text>
                      <View style={styles.completedBadge}>
                        <CheckCircle size={16} color={theme.secondary} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.goalDescription, styles.completedGoalDescription]}>
                    {goal.description}
                  </Text>
                  
                  <View style={styles.goalMetrics}>
                    <View style={styles.goalMetric}>
                      <Text style={styles.goalMetricLabel}>Achieved</Text>
                      <Text style={styles.goalMetricValue}>
                        {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                    <View style={styles.goalMetric}>
                      <Text style={styles.goalMetricLabel}>Completed</Text>
                      <Text style={styles.goalMetricValue}>
                        {new Date(goal.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {goals.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Target size={64} color={theme.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Goals Set</Text>
            <Text style={styles.emptyStateDescription}>
              Set your first fitness goal to start tracking your progress
            </Text>
            <TouchableOpacity style={styles.createGoalButton}>
              <LinearGradient
                colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
                style={styles.createGoalGradient}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.createGoalText}>Create Your First Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Goal Button */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.addGoalButton}>
              <Plus size={20} color={theme.primary} />
              <Text style={styles.addGoalText}>Add New Goal</Text>
            </TouchableOpacity>
          </View>
        )}
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
  goalsList: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  completedGoalCard: {
    opacity: 0.8,
    borderWidth: 1,
    borderColor: theme.secondary,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    flex: 1,
  },
  completedGoalTitle: {
    textDecorationLine: 'line-through',
  },
  goalProgress: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.primary,
    marginLeft: 12,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  goalDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 16,
  },
  completedGoalDescription: {
    opacity: 0.7,
  },
  goalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalMetric: {
    alignItems: 'center',
  },
  goalMetricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  goalMetricValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.15)' : '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.secondary,
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
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  createGoalButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  createGoalText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: theme.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  addGoalText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
  },
});