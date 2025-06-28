import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface WorkoutTimerProps {
  duration?: number; // in seconds
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  type?: 'rest' | 'exercise' | 'workout';
}

export default function WorkoutTimer({
  duration = 60,
  onComplete,
  onPause,
  onResume,
  onReset,
  onSkip,
  autoStart = false,
  type = 'rest'
}: WorkoutTimerProps) {
  const { theme, isDark } = useTheme();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (duration - timeLeft) / duration;
  };

  const handlePlayPause = () => {
    if (isRunning) {
      setIsRunning(false);
      onPause?.();
    } else {
      setIsRunning(true);
      onResume?.();
    }
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsCompleted(false);
    onReset?.();
  };

  const handleSkip = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsCompleted(true);
    onSkip?.();
  };

  const getTimerColor = () => {
    switch (type) {
      case 'rest':
        return ['#34C759', '#28A745'];
      case 'exercise':
        return ['#FF6B35', '#F7931E'];
      case 'workout':
        return ['#007AFF', '#0056CC'];
      default:
        return ['#007AFF', '#0056CC'];
    }
  };

  const getTimerLabel = () => {
    switch (type) {
      case 'rest':
        return 'Rest Time';
      case 'exercise':
        return 'Exercise Time';
      case 'workout':
        return 'Workout Time';
      default:
        return 'Timer';
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.timerCard}>
        <LinearGradient
          colors={getTimerColor()}
          style={styles.timerGradient}
        >
          <Text style={styles.timerLabel}>{getTimerLabel()}</Text>
          
          {/* Circular Progress */}
          <View style={styles.circularTimer}>
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    transform: [{ rotate: `${getProgress() * 360}deg` }]
                  }
                ]}
              />
            </View>
            <View style={styles.innerCircle}>
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
              {isCompleted && (
                <Text style={styles.completedText}>Complete!</Text>
              )}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
            >
              <RotateCcw size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton]}
              onPress={handlePlayPause}
            >
              {isRunning ? (
                <Pause size={24} color="#007AFF" />
              ) : (
                <Play size={24} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSkip}
            >
              <SkipForward size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Time Options */}
      <View style={styles.quickOptions}>
        <Text style={styles.quickOptionsLabel}>Quick Options</Text>
        <View style={styles.quickButtons}>
          {[30, 60, 90, 120].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.quickButton,
                duration === seconds && styles.quickButtonActive
              ]}
              onPress={() => {
                setTimeLeft(seconds);
                setIsRunning(false);
                setIsCompleted(false);
              }}
            >
              <Text style={[
                styles.quickButtonText,
                duration === seconds && styles.quickButtonTextActive
              ]}>
                {seconds}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    padding: 20,
  },
  timerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  timerGradient: {
    padding: 32,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 24,
    opacity: 0.9,
  },
  circularTimer: {
    position: 'relative',
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    position: 'absolute',
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 8,
    borderColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    top: -8,
    left: -8,
  },
  innerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 20,
    left: 20,
  },
  timeText: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  completedText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
  },
  quickOptions: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickOptionsLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: theme.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  quickButtonTextActive: {
    color: '#FFFFFF',
  },
});