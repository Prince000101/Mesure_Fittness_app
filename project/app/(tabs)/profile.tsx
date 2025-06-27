import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Camera, 
  Save, 
  Edit3, 
  Mail, 
  Phone, 
  Calendar,
  Ruler,
  Weight,
  Target,
  MapPin
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useFitness } from '@/contexts/FitnessContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { profile, updateProfile } = useFitness();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    fitnessGoals: '',
    location: '',
    profileImage: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        age: profile.age?.toString() || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        fitnessGoals: profile.fitnessGoals?.join(', ') || '',
        location: profile.location || '',
        profileImage: profile.profileImage || '',
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (formData.height && (isNaN(Number(formData.height)) || Number(formData.height) < 50 || Number(formData.height) > 300)) {
      newErrors.height = 'Please enter a valid height (50-300 cm)';
    }

    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) < 20 || Number(formData.weight) > 500)) {
      newErrors.weight = 'Please enter a valid weight (20-500 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const updatedProfile = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      age: formData.age ? Number(formData.age) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      fitnessGoals: formData.fitnessGoals ? formData.fitnessGoals.split(',').map(goal => goal.trim()) : [],
      location: formData.location,
      profileImage: formData.profileImage,
    };

    updateProfile(updatedProfile);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const bmi = formData.height && formData.weight 
    ? (Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)).toFixed(1)
    : null;

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: 'Underweight', color: '#007AFF' };
    if (bmi < 25) return { status: 'Normal', color: '#34C759' };
    if (bmi < 30) return { status: 'Overweight', color: '#FF9500' };
    return { status: 'Obese', color: '#FF3B30' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          {isEditing ? <Save size={20} color="#007AFF" /> : <Edit3 size={20} color="#007AFF" />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.profileGradient}
            >
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={isEditing ? handleImagePicker : undefined}
                disabled={!isEditing}
              >
                {formData.profileImage ? (
                  <Image source={{ uri: formData.profileImage }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color="#FFFFFF" />
                  </View>
                )}
                {isEditing && (
                  <View style={styles.cameraButton}>
                    <Camera size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={styles.profileName}>
                {formData.firstName} {formData.lastName}
              </Text>
              <Text style={styles.profileEmail}>{formData.email}</Text>
              
              {bmi && (
                <View style={styles.bmiContainer}>
                  <Text style={styles.bmiLabel}>BMI</Text>
                  <Text style={styles.bmiValue}>{bmi}</Text>
                  <Text style={[styles.bmiStatus, { color: getBMIStatus(Number(bmi)).color }]}>
                    {getBMIStatus(Number(bmi)).status}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                <User size={20} color="#8E8E93" />
                <TextInput
                  style={styles.textInput}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Enter first name"
                  editable={isEditing}
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Last Name *</Text>
              <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                <User size={20} color="#8E8E93" />
                <TextInput
                  style={styles.textInput}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Enter last name"
                  editable={isEditing}
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Mail size={20} color="#8E8E93" />
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter email address"
                keyboardType="email-address"
                editable={isEditing}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#8E8E93" />
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#8E8E93" />
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Enter your location"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Physical Information */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Physical Information</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Age</Text>
              <View style={[styles.inputContainer, errors.age && styles.inputError]}>
                <Calendar size={20} color="#8E8E93" />
                <TextInput
                  style={styles.textInput}
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholder="Age"
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Height (cm)</Text>
              <View style={[styles.inputContainer, errors.height && styles.inputError]}>
                <Ruler size={20} color="#8E8E93" />
                <TextInput
                  style={styles.textInput}
                  value={formData.height}
                  onChangeText={(value) => handleInputChange('height', value)}
                  placeholder="Height"
                  keyboardType="numeric"
                  editable={isEditing}
                />
              </View>
              {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <View style={[styles.inputContainer, errors.weight && styles.inputError]}>
              <Weight size={20} color="#8E8E93" />
              <TextInput
                style={styles.textInput}
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                placeholder="Enter your weight"
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
            {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
          </View>
        </View>

        {/* Fitness Goals */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Goals (comma separated)</Text>
            <View style={styles.inputContainer}>
              <Target size={20} color="#8E8E93" />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.fitnessGoals}
                onChangeText={(value) => handleInputChange('fitnessGoals', value)}
                placeholder="e.g., Lose weight, Build muscle, Improve endurance"
                multiline
                numberOfLines={3}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#007AFF', '#0056CC']}
                style={styles.saveGradient}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setIsEditing(false);
                setErrors({});
                // Reset form data to original profile data
                if (profile) {
                  setFormData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    age: profile.age?.toString() || '',
                    height: profile.height?.toString() || '',
                    weight: profile.weight?.toString() || '',
                    fitnessGoals: profile.fitnessGoals?.join(', ') || '',
                    location: profile.location || '',
                    profileImage: profile.profileImage || '',
                  });
                }
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
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
  editButton: {
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
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  bmiContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  bmiLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bmiValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  bmiStatus: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8E8E93',
  },
});