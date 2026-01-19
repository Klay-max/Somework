/**
 * ScoreCore 组件 - 核心计分板
 * 
 * 特点：
 * - 环形进度条显示得分和正确率
 * - 横向对比进度条（全国/本省/本市）
 * - 使用 react-native-svg 绘制
 * - 霓虹光晕效果
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { ScoreData } from '@/lib/types';
import { ProgressBar } from '../ui/ProgressBar';
import { Card } from '../ui/Card';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreCoreProps {
  data: ScoreData;
}

export function ScoreCore({ data }: ScoreCoreProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(data.accuracy / 100, { duration: 1500 });
  }, [data.accuracy]);

  // 环形进度条参数 - 增大尺寸以适配 Web 显示
  const size = 360;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Card>
      <View style={styles.container}>
        {/* 环形进度条 */}
        <View style={styles.chartContainer}>
          <View style={[styles.chartWrapper, { width: size, height: size }]}>
            <Svg width={size} height={size}>
              {/* 背景圆环 */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#333"
                strokeWidth={strokeWidth}
                fill="none"
              />
              
              {/* 进度圆环 */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#00ffff"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>

            {/* 中心文本 */}
            <View style={styles.centerText}>
              <Text style={styles.scoreText}>
                {data.score}
              </Text>
              <Text style={styles.scoreLabel}>本次得分</Text>
              <Text style={styles.accuracyText}>
                {data.accuracy}%
              </Text>
              <Text style={styles.accuracyLabel}>正确率</Text>
            </View>
          </View>
        </View>

        {/* 横向对比数据 */}
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>数据对比</Text>

          {/* 全国平均 */}
          <ProgressBar
            value={data.national}
            color="gray"
            showLabel
            label="全国平均"
          />

          {/* 本省平均 */}
          <ProgressBar
            value={data.province}
            color="gray"
            showLabel
            label="本省平均"
          />

          {/* 本市平均 */}
          <ProgressBar
            value={data.city}
            color="gray"
            showLabel
            label="本市平均"
          />

          {/* 你的得分 */}
          <ProgressBar
            value={data.score}
            color="cyan"
            showLabel
            label="你的得分"
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    color: '#00ffff',
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#888888',
    fontSize: 16,
    marginTop: 4,
  },
  accuracyText: {
    color: '#00ffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 12,
  },
  accuracyLabel: {
    color: '#666666',
    fontSize: 14,
  },
  comparisonContainer: {
    width: '100%',
  },
  comparisonTitle: {
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
