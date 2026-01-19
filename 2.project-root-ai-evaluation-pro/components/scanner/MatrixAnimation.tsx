/**
 * MatrixAnimation 组件 - 矩阵代码流动画
 * 
 * 特点：
 * - 持续 3 秒钟
 * - 使用 react-native-reanimated 实现
 * - 模拟黑客帝国风格的代码流
 */

import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';

// 矩阵字符集（数字 + 日文片假名）
const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

interface MatrixColumnProps {
  delay: number;
}

function MatrixColumn({ delay }: MatrixColumnProps) {
  const translateY = useSharedValue(-100);
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    // 生成随机字符
    const randomChars = Array.from({ length: 20 }, () => 
      MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
    );
    setChars(randomChars);

    // 延迟后开始动画
    setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(100, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: `${translateY.value}%` }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      {chars.map((char, index) => (
        <Text
          key={index}
          className="text-cyan-400 text-xs font-mono"
          style={{ opacity: 1 - index * 0.05 }}
        >
          {char}
        </Text>
      ))}
    </Animated.View>
  );
}

interface MatrixAnimationProps {
  onComplete?: () => void;
}

export function MatrixAnimation({ onComplete }: MatrixAnimationProps) {
  useEffect(() => {
    // 3 秒后触发完成回调
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View className="absolute inset-0 bg-black/80 flex-row overflow-hidden">
      {/* 生成多列矩阵代码流 */}
      {Array.from({ length: 15 }, (_, index) => (
        <MatrixColumn key={index} delay={index * 100} />
      ))}
    </View>
  );
}
