/**
 * AbilityRadar 组件 - 五维能力雷达图
 * 
 * 特点：
 * - 五个维度：听力、语法、阅读、完形、逻辑
 * - 透明背景，深灰色网格线
 * - 半透明青色填充，高亮青色边框
 * - 使用 react-native-svg 绘制
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { AbilityData } from '@/lib/types';
import { Card } from '../ui/Card';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface AbilityRadarProps {
  data: AbilityData;
}

export function AbilityRadar({ data }: AbilityRadarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, []);

  // 雷达图参数 - 增大尺寸以适配 Web 显示
  const size = 480;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const levels = 5; // 5 个等级线

  // 五个维度 - 添加默认值保护
  const dimensions = [
    { key: 'listening', label: '听力', value: data.listening || 0 },
    { key: 'grammar', label: '语法', value: data.grammar || 0 },
    { key: 'reading', label: '阅读', value: data.reading || 0 },
    { key: 'cloze', label: '完形', value: data.cloze || 0 },
    { key: 'logic', label: '逻辑', value: data.logic || 0 },
  ];

  // 计算每个维度的坐标
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // 生成数据多边形的点
  const dataPoints = dimensions
    .map((dim, index) => {
      const point = getPoint(index, dim.value);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const animatedProps = useAnimatedProps(() => ({
    opacity: progress.value * 0.3,
  }));

  return (
    <Card>
      <Text style={styles.title}>能力维度分析</Text>
      
      <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* 绘制网格线（5个等级） */}
          {Array.from({ length: levels }).map((_, level) => {
            const radius = (maxRadius / levels) * (level + 1);
            const points = dimensions
              .map((_, index) => {
                const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
                return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
              })
              .join(' ');

            return (
              <Polygon
                key={level}
                points={points}
                fill="none"
                stroke="#333"
                strokeWidth="1"
              />
            );
          })}

          {/* 绘制轴线 */}
          {dimensions.map((_, index) => {
            const point = getPoint(index, 100);
            return (
              <Line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#333"
                strokeWidth="1"
              />
            );
          })}

          {/* 绘制数据区域（填充） */}
          <AnimatedPolygon
            points={dataPoints}
            fill="#00ffff"
            animatedProps={animatedProps}
          />

          {/* 绘制数据边框 */}
          <Polygon
            points={dataPoints}
            fill="none"
            stroke="#00ffff"
            strokeWidth="3"
          />

          {/* 绘制数据点 */}
          {dimensions.map((dim, index) => {
            const point = getPoint(index, dim.value);
            return (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#00ffff"
              />
            );
          })}
        </Svg>

        {/* 维度标签 */}
        <View style={styles.labelsContainer}>
          {dimensions.map((dim) => (
            <View key={dim.key} style={styles.labelItem}>
              <Text style={styles.labelText}>{dim.label}</Text>
              <Text style={styles.labelValue}>{dim.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#888888',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  container: {
    alignItems: 'center',
  },
  labelsContainer: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  labelItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  labelText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelValue: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
  },
});
