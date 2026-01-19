/**
 * UpgradePath 组件 - 提分路径规划
 * 
 * 特点：
 * - 时间轴样式展示学习路径
 * - 多个阶段（基础修复、强化训练、冲刺提升）
 * - 显示学习内容、视频链接、预计完成时间
 * - 支持点击展开详情
 */

import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useState } from 'react';
import type { PathStage } from '@/lib/types';
import { Card } from '../ui/Card';

interface UpgradePathProps {
  data: PathStage[];
}

function PathStageItem({ 
  item, 
  index, 
  isLast 
}: { 
  item: PathStage; 
  index: number; 
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVideoClick = (url: string) => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View className="flex-row">
      {/* 时间轴线 */}
      <View className="items-center mr-4">
        {/* 节点 */}
        <View className="w-8 h-8 rounded-full border-2 border-cyan-500 bg-cyan-500/20 items-center justify-center">
          <Text className="text-cyan-400 text-xs font-bold">{index + 1}</Text>
        </View>
        
        {/* 连接线 */}
        {!isLast && (
          <View className="w-0.5 flex-1 bg-cyan-500/30 my-1" />
        )}
      </View>

      {/* 内容区 */}
      <View className="flex-1 pb-6">
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
          className="bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4"
        >
          {/* 标题和时长 */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-cyan-400 text-base font-bold">
              {item.title}
            </Text>
            <View className="bg-cyan-500/20 px-2 py-1 rounded">
              <Text className="text-cyan-400 text-xs">{item.duration}</Text>
            </View>
          </View>

          {/* 展开的详细内容 */}
          {isExpanded && (
            <View className="mt-3 space-y-3">
              {/* 学习内容 */}
              <View>
                <Text className="text-gray-500 text-xs mb-2">学习内容</Text>
                {item.content.map((content, idx) => (
                  <View key={idx} className="flex-row items-start mb-1">
                    <Text className="text-cyan-400 text-xs mr-2">•</Text>
                    <Text className="text-gray-300 text-xs flex-1">
                      {content}
                    </Text>
                  </View>
                ))}
              </View>

              {/* 视频课程 */}
              {item.videoLinks.length > 0 && (
                <View>
                  <Text className="text-gray-500 text-xs mb-2">视频课程</Text>
                  {item.videoLinks.map((link, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleVideoClick(link)}
                      className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 rounded mb-2"
                    >
                      <Text className="text-cyan-400 text-xs">
                        📹 课程 {idx + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 展开提示 */}
          {!isExpanded && (
            <Text className="text-gray-600 text-xs mt-2">
              点击查看详情 ▼
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function UpgradePath({ data }: UpgradePathProps) {
  return (
    <Card>
      <Text className="text-gray-400 text-sm font-bold mb-4">提分路径规划</Text>

      {/* 路径阶段列表 */}
      <View>
        {data.map((stage, index) => (
          <PathStageItem
            key={stage.id}
            item={stage}
            index={index}
            isLast={index === data.length - 1}
          />
        ))}
      </View>

      {/* 底部提示 */}
      <View className="mt-4 bg-cyan-500/5 border border-cyan-500/30 p-3 rounded">
        <Text className="text-cyan-400 text-xs text-center">
          按照路径规划循序渐进，预计 {data.reduce((sum, stage) => {
            const weeks = parseInt(stage.duration);
            return sum + (isNaN(weeks) ? 0 : weeks);
          }, 0)} 周完成全部学习
        </Text>
      </View>
    </Card>
  );
}
