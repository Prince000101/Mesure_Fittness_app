import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Camera, User } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { getUserProfile, saveUserProfile, UserProfile } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    joinDate: '',
    height: '',
    weight: '',
    age: '',
    fitnessLevel: 'Intermediate',
    avatar: undefined,
    preferences: {
      notifications: true,
      privacy: false,
      theme: 'system',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Change Profile Photo', '', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets.length > 0) {
            setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Gallery permission is required to choose a photo.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled && result.assets.length > 0) {
            setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await saveUserProfile(profile);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={isDark ? ['#4A5568', '#2D3748'] : ['#667eea', '#764ba2']}
                style={styles.avatarGradient}
              >
                <User size={40} color="#FFFFFF" />
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap to change photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={profile.name}
              onChangeText={(value) => updateProfile('name', value)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profile.email}
              onChangeText={(value) => updateProfile('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={profile.age}
              onChangeText={(value) => updateProfile('age', value)}
              placeholder="Enter your age"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Measurements</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Height</Text>
            <TextInput
              style={styles.textInput}
              value={profile.height}
              onChangeText={(value) => updateProfile('height', value)}
              placeholder="e.g., 175 cm"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Weight</Text>
            <TextInput
              style={styles.textInput}
              value={profile.weight}
              onChangeText={(value) => updateProfile('weight', value)}
              placeholder="e.g., 75.2 kg"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Level</Text>
          <View style={styles.fitnessLevelContainer}>
            {fitnessLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.fitnessLevelButton,
                  profile.fitnessLevel === level && styles.fitnessLevelButtonActive
                ]}
                onPress={() => updateProfile('fitnessLevel', level)}
              >
                <Text style={[
                  styles.fitnessLevelText,
                  profile.fitnessLevel === level && styles.fitnessLevelTextActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.saveButtonLarge, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isDark ? ['#0A84FF', '#0056CC'] : ['#007AFF', '#0056CC']}
              style={styles.saveButtonGradient}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: theme.text },
  saveButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.5 },
  content: { flex: 1, paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', paddingVertical: 32 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatarGradient: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontFamily: 'Inter-Regular', color: theme.textSecondary },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: theme.text, marginBottom: 16 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: theme.text, marginBottom: 8 },
  textInput: {
    backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontFamily: 'Inter-Regular', color: theme.text, borderWidth: 1, borderColor: theme.border,
  },
  fitnessLevelContainer: { flexDirection: 'row', gap: 12 },
  fitnessLevelButton: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  fitnessLevelButtonActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  fitnessLevelText: { fontSize: 14, fontFamily: 'Inter-Medium', color: theme.text },
  fitnessLevelTextActive: { color: '#FFFFFF' },
  saveButtonLarge: { borderRadius: 12, overflow: 'hidden' },
  saveButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  saveButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
});
