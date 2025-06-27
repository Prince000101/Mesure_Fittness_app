import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onHide: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const { theme, isDark } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0);
      opacity.value = withTiming(1);

      const timer = setTimeout(() => {
        translateY.value = withTiming(-100);
        opacity.value = withTiming(0, undefined, () => {
          runOnJS(onHide)();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: theme.success,
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: AlertCircle,
          backgroundColor: theme.error,
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          backgroundColor: theme.warning,
          iconColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: Info,
          backgroundColor: theme.primary,
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  const styles = createStyles(theme, isDark, config.backgroundColor);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={config.iconColor} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: any, isDark: boolean, backgroundColor: string) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 20,
      right: 20,
      zIndex: 1000,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    iconContainer: {
      marginRight: 12,
    },
    message: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: '#FFFFFF',
      lineHeight: 20,
    },
  });