/**
 * ProgressBar 组件 - 横向进度条
 * 
 * 特点：
 * - 支持自定义颜色
 * - 支持百分比显示
 * - 赛博朋克风格
 */

import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'cyan' | 'green' | 'gray';
  showLabel?: boolean;
  label?: string;
  height?: number;
}

export function ProgressBar({ 
  value, 
  color = 'cyan', 
  showLabel = false,
  label,
  height = 8,
}: ProgressBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value, { duration: 800 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const colorClasses = {
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    gray: 'bg-gray-500',
  };

  return (
    <View className="w-full">
      {showLabel && (
        <View className="flex-row justify-between mb-2">
          {label && <Text className="text-gray-400 text-sm">{label}</Text>}
          <Text className="text-gray-400 text-sm">{Math.round(value)}%</Text>
        </View>
      )}
      
      <View 
        className="w-full bg-gray-800 rounded-full overflow-hidden"
        style={{ height }}
      >
        <Animated.View
          className={`h-full rounded-full ${colorClasses[color]}`}
          style={animatedStyle}
        />
      </View>
    </View>
  );
}
