import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Dimensions, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Scale, Target, ChevronRight, ChevronLeft, Check, Activity } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useWorkout } from '@/contexts/WorkoutContext';
import { saveUserProfile, UserProfile } from '@/utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_KEY = 'onboarding_complete';

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Dumbbell },
  { id: 'profile', title: 'Your Info', icon: Activity },
  { id: 'measurements', title: 'Measurements', icon: Scale },
  { id: 'plan', title: 'Your Plan', icon: Target },
];

const exerciseLibrary = [
  { id: 'bench', name: 'Bench Press' },
  { id: 'deadlift', name: 'Deadlift' },
  { id: 'squat', name: 'Squat' },
  { id: 'pullups', name: 'Pull-ups' },
  { id: 'ohp', name: 'Overhead Press' },
  { id: 'rows', name: 'Barbell Row' },
];

export default function OnboardingScreen() {
  const { theme, isDark } = { theme: { background: '#F2F2F7', surface: '#FFFFFF', text: '#1C1C1E', textSecondary: '#8E8E93', primary: '#007AFF', secondary: '#34C759', border: '#E5E5EA' }, isDark: false };
  const { addPersonalRecord, addBodyMeasurement, createWorkout } = useWorkout();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [profile, setProfile] = useState({
    name: '', age: '', height: '', fitnessLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
  });
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [prs, setPrs] = useState<Record<string, string>>({});

  const totalSteps = steps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentStep + 1), animated: true });
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentStep - 1), animated: true });
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true;
      case 1: return profile.name.trim().length > 0;
      case 2: return weight.trim().length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleFinish = async () => {
    try {
      const userProfile: UserProfile = {
        name: profile.name,
        email: '',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        height: profile.height ? `${profile.height} cm` : '',
        weight: weight ? `${weight} kg` : '',
        age: profile.age ? `${profile.age} years` : '',
        fitnessLevel: profile.fitnessLevel,
        preferences: { notifications: true, privacy: false, theme: 'system' },
      };
      await saveUserProfile(userProfile);

      if (weight) {
        await addBodyMeasurement({
          type: 'weight', value: parseFloat(weight), unit: 'kg', date: new Date(),
        });
      }
      if (bodyFat) {
        await addBodyMeasurement({
          type: 'bodyFat', value: parseFloat(bodyFat), unit: '%', date: new Date(),
        });
      }

      for (const [name, value] of Object.entries(prs)) {
        if (value) {
          const exercise = {
            id: name,
            name: exerciseLibrary.find(e => e.id === name)?.name || name,
            category: 'strength' as const,
            muscleGroups: ['General'],
            equipment: [],
            instructions: [],
            difficulty: 'intermediate' as const,
          };
          await addPersonalRecord({
            exercise, type: 'weight' as const, value: parseFloat(value), unit: 'kg', date: new Date(),
          });
        }
      }

      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong saving your data.');
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {steps.map((step, i) => (
          <View key={step.id} style={[styles.progressDot, i <= currentStep && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Step 1: Welcome */}
        <View style={styles.stepContainer}>
          <View style={styles.welcomeContent}>
            <LinearGradient colors={['#007AFF', '#0056CC']} style={styles.welcomeIcon}>
              <Dumbbell size={48} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.welcomeTitle}>Welcome to Measure Fitness</Text>
            <Text style={styles.welcomeSubtitle}>Your personal fitness companion</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Check size={20} color="#34C759" />
                <Text style={styles.featureText}>Track body measurements & stats</Text>
              </View>
              <View style={styles.featureItem}>
                <Check size={20} color="#34C759" />
                <Text style={styles.featureText}>Log workouts and set personal records</Text>
              </View>
              <View style={styles.featureItem}>
                <Check size={20} color="#34C759" />
                <Text style={styles.featureText}>Schedule routines with a calendar</Text>
              </View>
              <View style={styles.featureItem}>
                <Check size={20} color="#34C759" />
                <Text style={styles.featureText}>100% offline — your data stays on your device</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Step 2: Profile */}
        <View style={styles.stepContainer}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Tell us about yourself</Text>
            <Text style={styles.formSubtitle}>This helps personalize your experience</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(v) => setProfile(p => ({ ...p, name: v }))}
                placeholder="Enter your name"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={profile.age}
                  onChangeText={(v) => setProfile(p => ({ ...p, age: v }))}
                  placeholder="Age"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={profile.height}
                  onChangeText={(v) => setProfile(p => ({ ...p, height: v }))}
                  placeholder="e.g. 175"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fitness Level</Text>
              <View style={styles.levelRow}>
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelButton, profile.fitnessLevel === level && styles.levelButtonActive]}
                    onPress={() => setProfile(p => ({ ...p, fitnessLevel: level }))}
                  >
                    <Text style={[styles.levelText, profile.fitnessLevel === level && styles.levelTextActive]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Step 3: Measurements */}
        <View style={styles.stepContainer}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Your Body Measurements</Text>
            <Text style={styles.formSubtitle}>Add your current stats to start tracking progress</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 75"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Body Fat % (optional)</Text>
              <TextInput
                style={styles.input}
                value={bodyFat}
                onChangeText={setBodyFat}
                placeholder="e.g. 15"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Step 4: Plan + PRs */}
        <View style={styles.stepContainer}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Your Max Lifts</Text>
            <Text style={styles.formSubtitle}>Enter your current max for key lifts (optional)</Text>

            {exerciseLibrary.map((ex) => (
              <View key={ex.id} style={styles.prRow}>
                <Text style={styles.prLabel}>{ex.name}</Text>
                <TextInput
                  style={[styles.input, styles.prInput]}
                  value={prs[ex.id] || ''}
                  onChangeText={(v) => setPrs(p => ({ ...p, [ex.id]: v }))}
                  placeholder="kg"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                />
              </View>
            ))}

            <Text style={styles.skipHint}>You can always add more exercises and records later.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.navButton} onPress={handleBack}>
            <ChevronLeft size={24} color="#007AFF" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        ) : <View style={styles.navButton} />}

        <View style={styles.stepIndicator}>
          <Text style={styles.stepIndicatorText}>{currentStep + 1} of {totalSteps}</Text>
        </View>

        {currentStep < totalSteps - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonRight, !canProceed() && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={[styles.navButtonText, styles.navButtonTextRight, !canProceed() && styles.navButtonTextDisabled]}>
              Next
            </Text>
            <ChevronRight size={24} color={canProceed() ? '#FFFFFF' : '#8E8E93'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navButton, styles.finishButton]} onPress={handleFinish}>
            <Check size={20} color="#FFFFFF" />
            <Text style={[styles.navButtonText, styles.navButtonTextRight]}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  progressContainer: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16,
  },
  progressDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5E5EA',
  },
  progressDotActive: {
    width: 24, backgroundColor: '#007AFF', borderRadius: 4,
  },
  scrollView: { flex: 1 },
  stepContainer: { width: SCREEN_WIDTH, paddingHorizontal: 24 },
  welcomeContent: { alignItems: 'center', paddingTop: 40 },
  welcomeIcon: {
    width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  welcomeTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: '#1C1C1E', textAlign: 'center', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 40 },
  featureList: { alignSelf: 'stretch', gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureText: { fontSize: 16, color: '#1C1C1E', flex: 1 },
  formContent: { paddingTop: 20 },
  formTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1C1C1E', marginBottom: 4 },
  formSubtitle: { fontSize: 15, color: '#8E8E93', marginBottom: 28 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#1C1C1E', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: '#1C1C1E', borderWidth: 1, borderColor: '#E5E5EA',
  },
  inputRow: { flexDirection: 'row', gap: 12 },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelButton: {
    flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center',
  },
  levelButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  levelText: { fontSize: 14, fontFamily: 'Inter-Medium', color: '#1C1C1E' },
  levelTextActive: { color: '#FFFFFF' },
  prRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
  },
  prLabel: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  prInput: { width: 100, textAlign: 'center' },
  skipHint: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginTop: 16 },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E5E5EA',
  },
  navButton: { width: 100, flexDirection: 'row', alignItems: 'center' },
  navButtonRight: {
    justifyContent: 'center', backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12,
  },
  navButtonDisabled: { backgroundColor: '#E5E5EA' },
  navButtonText: { fontSize: 16, color: '#007AFF', fontFamily: 'Inter-Medium' },
  navButtonTextRight: { color: '#FFFFFF' },
  navButtonTextDisabled: { color: '#8E8E93' },
  stepIndicator: { alignItems: 'center' },
  stepIndicatorText: { fontSize: 14, color: '#8E8E93', fontFamily: 'Inter-Medium' },
  finishButton: {
    justifyContent: 'center', backgroundColor: '#34C759', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
  },
});
