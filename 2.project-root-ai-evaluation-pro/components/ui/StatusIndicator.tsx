/**
 * StatusIndicator 组件 - 状态指示灯
 * 
 * 特点：
 * - 绿色：正常状态（实心圆点）
 * - 红色：错误/未掌握状态（呼吸灯动画）
 * - 使用 react-native-reanimated 实现动画
 */

import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning';
  size?: number;
  animated?: boolean;
}

export function StatusIndicator({ 
  status, 
  size = 12, 
  animated = true 
}: StatusIndicatorProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // 只有错误状态才显示呼吸灯动画
    if (status === 'error' && animated) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, // 无限循环
        false
      );
    } else {
      opacity.value = 1;
    }
  }, [status, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const statusColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
        className={statusColors[status]}
      />
    </View>
  );
}
