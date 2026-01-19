/**
 * KnowledgeMatrix 组件 - 知识点矩阵
 * 
 * 特点：
 * - 显示知识点列表
 * - 名称、难度星级、掌握状态
 * - 绿色/红色状态指示灯
 * - 支持展开/折叠详情
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import type { KnowledgePoint } from '@/lib/types';
import { Card } from '../ui/Card';
import { StatusIndicator } from '../ui/StatusIndicator';

interface KnowledgeMatrixProps {
  data: KnowledgePoint[];
}

function KnowledgeItem({ item }: { item: KnowledgePoint }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.7}
      className="border-b border-gray-800 py-3"
    >
      <View className="flex-row items-center justify-between">
        {/* 左侧：状态指示灯 + 名称 */}
        <View className="flex-row items-center flex-1">
          <StatusIndicator
            status={item.mastered ? 'success' : 'error'}
            size={10}
            animated={!item.mastered}
          />
          <Text className="text-gray-300 text-sm ml-3 flex-1">
            {item.name}
          </Text>
        </View>

        {/* 右侧：难度星级 */}
        <View className="flex-row items-center ml-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Text
              key={index}
              className={`text-xs ${
                index < item.difficulty ? 'text-yellow-400' : 'text-gray-700'
              }`}
            >
              ★
            </Text>
          ))}
        </View>
      </View>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <View className="mt-3 pl-6 pr-2">
          <View className="bg-gray-900/50 p-3 rounded border-l-2 border-cyan-500/50">
            <Text className="text-gray-400 text-xs leading-5">
              {item.detail}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function KnowledgeMatrix({ data }: KnowledgeMatrixProps) {
  // 统计掌握情况
  const masteredCount = data.filter(item => item.mastered).length;
  const totalCount = data.length;
  const masteredPercentage = Math.round((masteredCount / totalCount) * 100);

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-400 text-sm font-bold">知识点矩阵</Text>
        <Text className="text-cyan-400 text-xs">
          {masteredCount}/{totalCount} ({masteredPercentage}%)
        </Text>
      </View>

      {/* 图例 */}
      <View className="flex-row items-center gap-4 mb-4 pb-4 border-b border-gray-800">
        <View className="flex-row items-center">
          <StatusIndicator status="success" size={8} animated={false} />
          <Text className="text-gray-500 text-xs ml-2">已掌握</Text>
        </View>
        <View className="flex-row items-center">
          <StatusIndicator status="error" size={8} animated={true} />
          <Text className="text-gray-500 text-xs ml-2">未掌握</Text>
        </View>
      </View>

      {/* 知识点列表 */}
      <View>
        {data.map((item) => (
          <KnowledgeItem key={item.id} item={item} />
        ))}
      </View>

      {/* 提示 */}
      <Text className="text-gray-600 text-xs mt-4 text-center">
        点击知识点查看详细说明
      </Text>
    </Card>
  );
}
