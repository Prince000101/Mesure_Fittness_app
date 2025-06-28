import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard as Edit3, Target, Award, Share2, Camera, Trophy, TrendingUp, Dumbbell, Calendar, Activity, Zap, Heart, Scale, Ruler, Clock, ChartBar as BarChart3, Sun, Moon, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { router } from 'expo-router';
import { getUserProfile, saveUserProfile, UserProfile } from '@/utils/storage';

export default function ProfileScreen() {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const { personalRecords, workoutSessions, bodyMeasurements } = useWorkout();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
        setNotificationsEnabled(profile.preferences.notifications);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const updatePreferences = async (key: string, value: boolean) => {
    if (!userProfile) return;
    
    try {
      const updatedProfile = {
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          [key]: value,
        },
      };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  // Calculate comprehensive user stats from real data
  const calculateUserStats = () => {
    const completedWorkouts = workoutSessions.filter(s => s.completed);
    const totalWorkouts = completedWorkouts.length;
    const totalPRs = personalRecords.length;
    
    return {
      workouts: totalWorkouts,
      prs: totalPRs,
    };
  };

  const userStats = calculateUserStats();

  // Get main lift PRs (Bench Press, Deadlift, Squat)
  const getMainLiftPRs = () => {
    const mainLifts = ['Bench Press', 'Deadlift', 'Squat'];
    const prs: Array<{
      exercise: string;
      value: number;
      unit: string;
      date: string;
      improvement?: string;
    }> = [];

    mainLifts.forEach(liftName => {
      const liftRecords = personalRecords.filter(pr => 
        pr.exercise.name === liftName && pr.type === 'weight'
      );
      
      if (liftRecords.length > 0) {
        // Get the highest weight for this exercise
        const bestRecord = liftRecords.reduce((best, current) => 
          current.value > best.value ? current : best
        );
        
        prs.push({
          exercise: liftName,
          value: bestRecord.value,
          unit: bestRecord.unit,
          date: bestRecord.date.toLocaleDateString(),
          improvement: liftRecords.length > 1 ? '+5kg' : undefined
        });
      }
    });

    return prs;
  };

  const mainLiftPRs = getMainLiftPRs();

  // Get current body measurements
  const getCurrentBodyStats = () => {
    const latestWeight = bodyMeasurements
      .filter(m => m.type === 'weight')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const latestBodyFat = bodyMeasurements
      .filter(m => m.type === 'bodyFat')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const latestMuscle = bodyMeasurements
      .filter(m => m.type === 'muscleMass')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    return {
      weight: latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : userProfile?.weight || '75.2 kg',
      bodyFat: latestBodyFat ? `${latestBodyFat.value}${latestBodyFat.unit}` : '12.5%',
      muscle: latestMuscle ? `${latestMuscle.value} ${latestMuscle.unit}` : '62.7 kg',
    };
  };

  const currentBodyStats = getCurrentBodyStats();

  // Calculate BMI if height and weight are available
  const calculateBMI = () => {
    if (!userProfile?.height || !userProfile?.weight) return null;
    
    const heightInM = parseFloat(userProfile.height.replace(/[^\d.]/g, '')) / 100;
    const weightInKg = parseFloat(userProfile.weight.replace(/[^\d.]/g, ''));
    
    if (heightInM && weightInKg) {
      const bmi = weightInKg / (heightInM * heightInM);
      return {
        value: bmi.toFixed(1),
        category: bmi < 18.5 ? 'Underweight' : 
                 bmi < 25 ? 'Normal' : 
                 bmi < 30 ? 'Overweight' : 'Obese'
      };
    }
    return null;
  };

  const bmiData = calculateBMI();

  const menuItems = [
    {
      section: 'Account',
      items: [
        { 
          icon: Edit3, 
          label: 'Edit Profile', 
          hasArrow: true,
          onPress: () => router.push('/edit-profile')
        },
        { 
          icon: Target, 
          label: 'Fitness Goals', 
          hasArrow: true, 
          badge: '3 Active',
          onPress: () => router.push('/fitness-goals')
        },
        { 
          icon: Award, 
          label: 'Achievements', 
          hasArrow: true, 
          badge: `${personalRecords.length} Earned`,
          onPress: () => router.push('/achievements')
        },
        { 
          icon: BarChart3, 
          label: 'Workout History', 
          hasArrow: true, 
          badge: `${userStats.workouts} Sessions`,
          onPress: () => router.push('/progress')
        },
      ]
    },
    {
      section: 'Health & Fitness',
      items: [
        { 
          icon: Scale, 
          label: 'Body Measurements', 
          hasArrow: true,
          badge: `${bodyMeasurements.length} Records`,
          onPress: () => router.push('/body-measurements')
        },
        { 
          icon: Heart, 
          label: 'Health Metrics', 
          hasArrow: true,
          onPress: () => Alert.alert('Coming Soon', 'Health metrics tracking will be available in a future update.')
        },
        { 
          icon: Activity, 
          label: 'Workout Analytics', 
          hasArrow: true,
          onPress: () => router.push('/progress')
        },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          hasSwitch: true, 
          value: notificationsEnabled, 
          onToggle: (value: boolean) => {
            setNotificationsEnabled(value);
            updatePreferences('notifications', value);
          }
        },
      ]
    },
    {
      section: 'Support',
      items: [
        { 
          icon: Share2, 
          label: 'Share App', 
          hasArrow: true,
          onPress: () => handleShareApp()
        },
        { 
          icon: HelpCircle, 
          label: 'Help & Support', 
          hasArrow: true,
          onPress: () => Alert.alert('Help & Support', 'Contact us at support@measurefitness.com for assistance.')
        },
      ]
    }
  ];

  const handleShareApp = () => {
    Alert.alert(
      'Share Measure Fitness',
      'Share this amazing fitness app with your friends!',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear auth tokens and redirect to login
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          }
        }
      ]
    );
  };

  const styles = createStyles(theme, isDark);

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={32} color={theme.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Edit3 size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Simplified Profile Card */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={isDark ? ['#667eea', '#764ba2'] : ['#667eea', '#764ba2']}
              style={styles.profileGradient}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                    style={styles.avatarImage}
                  />
                  <TouchableOpacity style={styles.cameraButton}>
                    <Camera size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{userProfile.name}</Text>
                  <Text style={styles.profileLevel}>{userProfile.fitnessLevel} Level</Text>
                  <Text style={styles.joinDate}>Member since {userProfile.joinDate}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Theme Toggle */}
        <View style={styles.section}>
          <View style={styles.themeContainer}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.themeToggleContainer}>
              {[
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'system', label: 'System', icon: Smartphone },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = themeMode === mode.key;
                
                return (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.themeButton,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surface,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => setThemeMode(mode.key as any)}
                  >
                    <Icon 
                      size={20} 
                      color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                    />
                    <Text style={[
                      styles.themeText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                    ]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Enhanced Body Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Information</Text>
          <View style={styles.bodyInfoGrid}>
            <View style={styles.bodyInfoCard}>
              <View style={styles.bodyInfoIcon}>
                <Ruler size={20} color={theme.primary} />
              </View>
              <Text style={styles.bodyInfoLabel}>Height</Text>
              <Text style={styles.bodyInfoValue}>{userProfile.height}</Text>
            </View>
            
            <View style={styles.bodyInfoCard}>
              <View style={styles.bodyInfoIcon}>
                <Scale size={20} color={theme.secondary} />
              </View>
              <Text style={styles.bodyInfoLabel}>Weight</Text>
              <Text style={styles.bodyInfoValue}>{currentBodyStats.weight}</Text>
            </View>
            
            <View style={styles.bodyInfoCard}>
              <View style={styles.bodyInfoIcon}>
                <Activity size={20} color='#FF6B35' />
              </View>
              <Text style={styles.bodyInfoLabel}>Body Fat</Text>
              <Text style={styles.bodyInfoValue}>{currentBodyStats.bodyFat}</Text>
            </View>
            
            <View style={styles.bodyInfoCard}>
              <View style={styles.bodyInfoIcon}>
                <Dumbbell size={20} color='#9C27B0' />
              </View>
              <Text style={styles.bodyInfoLabel}>Muscle</Text>
              <Text style={styles.bodyInfoValue}>{currentBodyStats.muscle}</Text>
            </View>
          </View>

          {/* BMI Card */}
          {bmiData && (
            <View style={styles.bmiCard}>
              <View style={styles.bmiHeader}>
                <Text style={styles.bmiTitle}>Body Mass Index</Text>
                <View style={[
                  styles.bmiCategoryBadge,
                  { backgroundColor: bmiData.category === 'Normal' ? theme.secondary : theme.warning }
                ]}>
                  <Text style={styles.bmiCategoryText}>{bmiData.category}</Text>
                </View>
              </View>
              <Text style={styles.bmiValue}>{bmiData.value}</Text>
              <Text style={styles.bmiSubtext}>BMI</Text>
            </View>
          )}
        </View>

        {/* Enhanced Personal Records */}
        {mainLiftPRs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Records</Text>
              <TouchableOpacity onPress={() => router.push('/progress')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.personalRecordsGrid}>
              {mainLiftPRs.map((pr, index) => (
                <View key={index} style={styles.prCard}>
                  <View style={styles.prHeader}>
                    <View style={styles.prIcon}>
                      <Trophy size={18} color={theme.secondary} />
                    </View>
                    <Text style={styles.prExercise}>{pr.exercise}</Text>
                  </View>
                  <Text style={styles.prWeight}>{pr.value} {pr.unit}</Text>
                  <Text style={styles.prDate}>{pr.date}</Text>
                  {pr.improvement && (
                    <View style={styles.improvementBadge}>
                      <TrendingUp size={12} color={theme.secondary} />
                      <Text style={styles.improvementText}>{pr.improvement}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.menuItem,
                    index === section.items.length - 1 && styles.menuItemLast
                  ]}
                  onPress={item.onPress}
                  disabled={item.hasSwitch}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <item.icon size={20} color={theme.primary} />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuItemText}>{item.label}</Text>
                      {item.badge && (
                        <Text style={styles.menuBadge}>{item.badge}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.hasSwitch && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor="#FFFFFF"
                      />
                    )}
                    {item.hasArrow && (
                      <ChevronRight size={16} color={theme.textTertiary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={theme.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Measure Fitness v1.2.0</Text>
          <Text style={styles.buildText}>Build 2024.03.15</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
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
  editButton: {
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
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.4 : 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  profileGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
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
    color: theme.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
  },
  themeContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  bodyInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  bodyInfoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bodyInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bodyInfoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 4,
  },
  bodyInfoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: theme.text,
  },
  bmiCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  bmiCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bmiValue: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    textAlign: 'center',
  },
  bmiSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  personalRecordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${theme.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  prExercise: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    flex: 1,
  },
  prWeight: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.text,
    marginBottom: 4,
  },
  prDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: isDark ? 'rgba(48, 209, 88, 0.15)' : '#34C75915',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  improvementText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: theme.secondary,
  },
  menuContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
  },
  menuBadge: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginTop: 2,
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.error,
  },
  versionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  buildText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textTertiary,
    marginTop: 2,
  },
});