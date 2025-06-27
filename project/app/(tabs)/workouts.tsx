import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Clock, Dumbbell, Target, Filter } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function WorkoutsScreen() {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'Sports'];
  
  const workoutTemplates = [
    {
      id: 1,
      name: 'Upper Body Strength',
      category: 'Strength',
      duration: '45 min',
      exercises: 8,
      difficulty: 'Intermediate',
      lastPerformed: '2 days ago',
      isCustom: false,
    },
    {
      id: 2,
      name: 'HIIT Cardio Blast',
      category: 'Cardio',
      duration: '25 min',
      exercises: 6,
      difficulty: 'Advanced',
      lastPerformed: 'Never',
      isCustom: false,
    },
    {
      id: 3,
      name: 'Lower Body Power',
      category: 'Strength',
      duration: '40 min',
      exercises: 7,
      difficulty: 'Intermediate',
      lastPerformed: '4 days ago',
      isCustom: true,
    },
    {
      id: 4,
      name: 'Core & Flexibility',
      category: 'Flexibility',
      duration: '30 min',
      exercises: 12,
      difficulty: 'Beginner',
      lastPerformed: '1 week ago',
      isCustom: false,
    },
  ];

  const filteredWorkouts = workoutTemplates.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return theme.secondary;
      case 'Intermediate': return theme.accent;
      case 'Advanced': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create New Workout */}
      <View style={styles.createSection}>
        <TouchableOpacity style={styles.createButton}>
          <View style={styles.createButtonContent}>
            <View style={styles.createIcon}>
              <Plus size={24} color={theme.primary} />
            </View>
            <View style={styles.createText}>
              <Text style={styles.createTitle}>Create New Workout</Text>
              <Text style={styles.createSubtitle}>Build your own custom routine</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Workout Templates */}
      <ScrollView style={styles.workoutsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Workout Templates</Text>
        
        <View style={styles.workoutsList}>
          {filteredWorkouts.map((workout) => (
            <TouchableOpacity key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutTitleContainer}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  {workout.isCustom && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                  )}
                </View>
                <View style={styles.workoutActions}>
                  <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.workoutDetails}>
                <View style={styles.workoutStat}>
                  <Clock size={16} color={theme.textSecondary} />
                  <Text style={styles.workoutStatText}>{workout.duration}</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Dumbbell size={16} color={theme.textSecondary} />
                  <Text style={styles.workoutStatText}>{workout.exercises} exercises</Text>
                </View>
                <View style={styles.workoutStat}>
                  <Target size={16} color={getDifficultyColor(workout.difficulty)} />
                  <Text style={[styles.workoutStatText, { color: getDifficultyColor(workout.difficulty) }]}>
                    {workout.difficulty}
                  </Text>
                </View>
              </View>

              <View style={styles.workoutFooter}>
                <Text style={styles.lastPerformed}>Last performed: {workout.lastPerformed}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  createSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    flex: 1,
  },
  createTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 2,
  },
  createSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  workoutsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 16,
  },
  workoutsList: {
    gap: 12,
    paddingBottom: 20,
  },
  workoutCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  customBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: isDark ? 'rgba(255, 159, 10, 0.15)' : '#FF950015',
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.accent,
    textTransform: 'uppercase',
  },
  workoutActions: {
    marginLeft: 12,
  },
  startButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  workoutFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  lastPerformed: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
});