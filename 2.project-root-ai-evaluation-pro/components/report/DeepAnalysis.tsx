/**
 * DeepAnalysis 组件 - 深度归因分析
 * 
 * 特点：
 * - 表层病灶（Tag 标签样式）
 * - 深层病根（红色警告框样式）
 * - AI 点评（打字机效果）
 */

import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import type { AnalysisData } from '@/lib/types';
import { Card } from '../ui/Card';

interface DeepAnalysisProps {
  data: AnalysisData;
}

export function DeepAnalysis({ data }: DeepAnalysisProps) {
  const [displayedComment, setDisplayedComment] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // 打字机效果
  useEffect(() => {
    let index = 0;
    setDisplayedComment('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < data.aiComment.length) {
        setDisplayedComment(data.aiComment.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 50); // 每 50ms 显示一个字符

    return () => clearInterval(interval);
  }, [data.aiComment]);

  return (
    <Card>
      <Text className="text-gray-400 text-sm font-bold mb-4">深度归因分析</Text>

      {/* 表层病灶 */}
      <View className="mb-6">
        <Text className="text-gray-500 text-xs mb-2">表层病灶</Text>
        <View className="flex-row flex-wrap gap-2">
          {data.surface.map((item, index) => (
            <View
              key={index}
              className="bg-yellow-500/20 border border-yellow-500/50 px-3 py-1 rounded-full"
            >
              <Text className="text-yellow-400 text-xs">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 深层病根 */}
      <View className="mb-6">
        <Text className="text-gray-500 text-xs mb-2">深层病根</Text>
        <View className="space-y-2">
          {data.root.map((item, index) => (
            <View
              key={index}
              className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded"
            >
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-400 text-sm flex-1">{item}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* AI 点评 */}
      <View className="bg-cyan-500/5 border border-cyan-500/30 p-4 rounded-lg">
        <View className="flex-row items-center mb-2">
          <View className="w-2 h-2 bg-cyan-400 rounded-full mr-2" />
          <Text className="text-cyan-400 text-xs font-bold">AI 诊断点评</Text>
        </View>
        
        <Text className="text-gray-300 text-sm leading-6">
          {displayedComment}
          {isTyping && (
            <Text className="text-cyan-400">▊</Text>
          )}
        </Text>
      </View>
    </Card>
  );
}
