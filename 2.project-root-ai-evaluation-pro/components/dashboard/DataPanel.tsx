/**
 * DataPanel 组件 - 数据展示面板
 * 
 * 显示模拟统计数据
 */

import { View, Text } from 'react-native';
import { Card } from '../ui/Card';

export function DataPanel() {
  return (
    <View className="px-4">
      <Card>
        <View className="space-y-4">
          {/* 近期准确率 */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-base">近期准确率</Text>
            <Text className="text-cyan-400 text-2xl font-bold">89%</Text>
          </View>

          {/* 分隔线 */}
          <View className="h-px bg-cyan-500/20" />

          {/* 扫描次数 */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-base">扫描次数</Text>
            <Text className="text-green-400 text-2xl font-bold">24</Text>
          </View>

          {/* 分隔线 */}
          <View className="h-px bg-cyan-500/20" />

          {/* 系统状态 */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-base">系统状态</Text>
            <Text className="text-green-400 text-base font-mono">READY</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
