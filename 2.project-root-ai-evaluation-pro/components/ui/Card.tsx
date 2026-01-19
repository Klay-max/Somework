/**
 * Card 组件 - 赛博朋克风格卡片
 * 
 * 特点：
 * - 深灰色背景 (#111)
 * - 极细的青色边框
 * - 支持自定义样式
 */

import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`bg-[#111111] border border-cyan-500/30 rounded-lg p-4 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
