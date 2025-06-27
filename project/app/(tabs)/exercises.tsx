import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Play, Bookmark, Clock, Target, Zap } from 'lucide-react-native';
import { useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  calories: string;
  description: string;
  imageUrl: string;
  instructions: string[];
}

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'Sports', 'Yoga'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'Strength',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      duration: '10-15 min',
      calories: '50-100',
      description: 'A classic bodyweight exercise that targets multiple muscle groups.',
      imageUrl: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Start in a plank position with hands slightly wider than shoulders',
        'Lower your body until chest nearly touches the ground',
        'Push back up to starting position',
        'Keep your body in a straight line throughout'
      ]
    },
    {
      id: '2',
      name: 'Running',
      category: 'Cardio',
      muscleGroups: ['Legs', 'Core', 'Glutes'],
      equipment: ['None'],
      difficulty: 'Beginner',
      duration: '20-60 min',
      calories: '200-600',
      description: 'Excellent cardiovascular exercise for building endurance.',
      imageUrl: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Start with a 5-minute warm-up walk',
        'Begin running at a comfortable pace',
        'Maintain steady breathing rhythm',
        'Cool down with a 5-minute walk'
      ]
    },
    {
      id: '3',
      name: 'Deadlifts',
      category: 'Strength',
      muscleGroups: ['Back', 'Legs', 'Glutes', 'Core'],
      equipment: ['Barbell', 'Weights'],
      difficulty: 'Advanced',
      duration: '15-20 min',
      calories: '100-200',
      description: 'Compound movement that works multiple muscle groups.',
      imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Bend at hips and knees to grip the bar',
        'Keep back straight and chest up',
        'Drive through heels to lift the bar'
      ]
    },
    {
      id: '4',
      name: 'Yoga Flow',
      category: 'Flexibility',
      muscleGroups: ['Full Body'],
      equipment: ['Yoga Mat'],
      difficulty: 'Intermediate',
      duration: '30-60 min',
      calories: '150-300',
      description: 'Flowing sequence of yoga poses for flexibility and mindfulness.',
      imageUrl: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Start in mountain pose',
        'Flow through sun salutations',
        'Hold each pose for 5-8 breaths',
        'End in savasana for relaxation'
      ]
    },
    {
      id: '5',
      name: 'Squats',
      category: 'Strength',
      muscleGroups: ['Legs', 'Glutes', 'Core'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      duration: '10-15 min',
      calories: '50-100',
      description: 'Fundamental lower body exercise for building strength.',
      imageUrl: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower body as if sitting back into a chair',
        'Keep knees behind toes',
        'Return to standing position'
      ]
    },
    {
      id: '6',
      name: 'Cycling',
      category: 'Cardio',
      muscleGroups: ['Legs', 'Core'],
      equipment: ['Bicycle'],
      difficulty: 'Intermediate',
      duration: '30-90 min',
      calories: '300-800',
      description: 'Low-impact cardio exercise great for endurance.',
      imageUrl: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
      instructions: [
        'Adjust bike seat to proper height',
        'Start with gentle warm-up pace',
        'Maintain steady cadence',
        'Cool down with easy pedaling'
      ]
    }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(group => 
                           group.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'All' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#34C759';
      case 'Intermediate': return '#FF9500';
      case 'Advanced': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterText,
                  selectedCategory === category && styles.filterTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterTitle}>Difficulty</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  selectedDifficulty === difficulty && styles.filterChipActive
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text style={[
                  styles.filterText,
                  selectedDifficulty === difficulty && styles.filterTextActive
                ]}>
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercise List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>
            {filteredExercises.length} Exercise{filteredExercises.length !== 1 ? 's' : ''} Found
          </Text>
          
          <View style={styles.exercisesList}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity key={exercise.id} style={styles.exerciseCard}>
                <Image source={{ uri: exercise.imageUrl }} style={styles.exerciseImage} />
                
                <View style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <TouchableOpacity style={styles.bookmarkButton}>
                      <Bookmark size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  
                  <View style={styles.exerciseDetails}>
                    <View style={styles.detailItem}>
                      <Clock size={14} color="#8E8E93" />
                      <Text style={styles.detailText}>{exercise.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Zap size={14} color="#8E8E93" />
                      <Text style={styles.detailText}>{exercise.calories} cal</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Target size={14} color={getDifficultyColor(exercise.difficulty)} />
                      <Text style={[styles.detailText, { color: getDifficultyColor(exercise.difficulty) }]}>
                        {exercise.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.muscleGroups}>
                    {exercise.muscleGroups.slice(0, 3).map((muscle, index) => (
                      <View key={index} style={styles.muscleTag}>
                        <Text style={styles.muscleText}>{muscle}</Text>
                      </View>
                    ))}
                    {exercise.muscleGroups.length > 3 && (
                      <View style={styles.muscleTag}>
                        <Text style={styles.muscleText}>+{exercise.muscleGroups.length - 3}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity style={styles.startButton}>
                      <Play size={16} color="#FFFFFF" />
                      <Text style={styles.startButtonText}>Start Exercise</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Start Section */}
        <View style={styles.quickStartSection}>
          <Text style={styles.sectionTitle}>Quick Start Workouts</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickStartContainer}
          >
            {[
              { name: '7-Min HIIT', duration: '7 min', color: '#FF6B35' },
              { name: 'Morning Stretch', duration: '10 min', color: '#34C759' },
              { name: 'Core Blast', duration: '15 min', color: '#FF9500' },
              { name: 'Full Body', duration: '30 min', color: '#007AFF' },
            ].map((workout, index) => (
              <TouchableOpacity key={index} style={styles.quickStartCard}>
                <View style={[styles.quickStartIcon, { backgroundColor: workout.color }]}>
                  <Play size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickStartName}>{workout.name}</Text>
                <Text style={styles.quickStartDuration}>{workout.duration}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  filterButton: {
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
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
  },
  filtersSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1C1C1E',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  exercisesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  exercisesList: {
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F2F2F7',
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1C1C1E',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  muscleTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickStartContainer: {
    paddingRight: 20,
    gap: 16,
  },
  quickStartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickStartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStartName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickStartDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
});