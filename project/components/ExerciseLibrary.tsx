import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Play, Bookmark } from 'lucide-react-native';
import { useState } from 'react';
import { Exercise } from '@/types/workout';

interface ExerciseLibraryProps {
  onExerciseSelect?: (exercise: Exercise) => void;
}

export default function ExerciseLibrary({ onExerciseSelect }: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'Sports'];
  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Full Body'];

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Bench Press',
      category: 'strength',
      muscleGroups: ['Chest', 'Shoulders', 'Arms'],
      equipment: ['Barbell', 'Bench'],
      instructions: [
        'Lie flat on the bench with your feet firmly on the ground',
        'Grip the barbell slightly wider than shoulder-width',
        'Lower the bar to your chest with control',
        'Press the bar back up to starting position'
      ],
      difficulty: 'intermediate',
    },
    {
      id: '2',
      name: 'Deadlift',
      category: 'strength',
      muscleGroups: ['Back', 'Legs', 'Core'],
      equipment: ['Barbell'],
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Bend at hips and knees to grip the bar',
        'Keep your back straight and chest up',
        'Drive through heels to lift the bar'
      ],
      difficulty: 'advanced',
    },
    {
      id: '3',
      name: 'Push-ups',
      category: 'strength',
      muscleGroups: ['Chest', 'Shoulders', 'Arms', 'Core'],
      equipment: ['Bodyweight'],
      instructions: [
        'Start in plank position with hands under shoulders',
        'Lower your body until chest nearly touches the ground',
        'Push back up to starting position',
        'Keep your body in a straight line throughout'
      ],
      difficulty: 'beginner',
    },
    {
      id: '4',
      name: 'Running',
      category: 'cardio',
      muscleGroups: ['Legs', 'Core'],
      equipment: ['None'],
      instructions: [
        'Start with a light warm-up walk',
        'Gradually increase pace to running speed',
        'Maintain steady breathing rhythm',
        'Land on mid-foot with slight forward lean'
      ],
      difficulty: 'beginner',
    },
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(group => 
                           group.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'All' || 
                           exercise.category === selectedCategory.toLowerCase();
    const matchesMuscleGroup = selectedMuscleGroup === 'All' ||
                              exercise.muscleGroups.includes(selectedMuscleGroup);
    
    return matchesSearch && matchesCategory && matchesMuscleGroup;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#34C759';
      case 'intermediate': return '#FF9500';
      case 'advanced': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
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

      {/* Muscle Group Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {muscleGroups.map((group) => (
          <TouchableOpacity
            key={group}
            style={[
              styles.filterChip,
              selectedMuscleGroup === group && styles.filterChipActive
            ]}
            onPress={() => setSelectedMuscleGroup(group)}
          >
            <Text style={[
              styles.filterText,
              selectedMuscleGroup === group && styles.filterTextActive
            ]}>
              {group}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise List */}
      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        {filteredExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => onExerciseSelect?.(exercise)}
          >
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMuscles}>
                  {exercise.muscleGroups.join(', ')}
                </Text>
                <Text style={styles.exerciseEquipment}>
                  Equipment: {exercise.equipment.join(', ')}
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: `${getDifficultyColor(exercise.difficulty)}15` }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(exercise.difficulty) }
                  ]}>
                    {exercise.difficulty}
                  </Text>
                </View>
                <TouchableOpacity style={styles.actionButton}>
                  <Bookmark size={16} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.exerciseInstructions}>
              <Text style={styles.instructionsTitle}>Instructions:</Text>
              {exercise.instructions.slice(0, 2).map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  {index + 1}. {instruction}
                </Text>
              ))}
              {exercise.instructions.length > 2 && (
                <Text style={styles.moreInstructions}>
                  +{exercise.instructions.length - 2} more steps
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
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
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  exerciseMuscles: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  exerciseActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInstructions: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 4,
    lineHeight: 18,
  },
  moreInstructions: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
    marginTop: 4,
  },
});