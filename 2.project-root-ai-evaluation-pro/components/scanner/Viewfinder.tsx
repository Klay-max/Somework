/**
 * Viewfinder 组件 - 扫描取景框
 * 
 * 特点：
 * - 仅显示四个角的青色边框（不是完整矩形）
 * - 居中显示，合适尺寸
 * - 不阻挡用户交互（pointerEvents="none"）
 */

import { View } from 'react-native';

interface ViewfinderProps {
  size?: number;
  cornerSize?: number;
  borderWidth?: number;
}

export function Viewfinder({ 
  size = 256, 
  cornerSize = 32, 
  borderWidth = 2 
}: ViewfinderProps) {
  return (
    <View 
      className="absolute inset-0 items-center justify-center"
      pointerEvents="none"
    >
      <View 
        style={{ width: size, height: size }}
        className="relative"
      >
        {/* 左上角 */}
        <View 
          style={{ 
            width: cornerSize, 
            height: cornerSize,
            borderTopWidth: borderWidth,
            borderLeftWidth: borderWidth,
          }}
          className="absolute top-0 left-0 border-cyan-400"
        />

        {/* 右上角 */}
        <View 
          style={{ 
            width: cornerSize, 
            height: cornerSize,
            borderTopWidth: borderWidth,
            borderRightWidth: borderWidth,
          }}
          className="absolute top-0 right-0 border-cyan-400"
        />

        {/* 左下角 */}
        <View 
          style={{ 
            width: cornerSize, 
            height: cornerSize,
            borderBottomWidth: borderWidth,
            borderLeftWidth: borderWidth,
          }}
          className="absolute bottom-0 left-0 border-cyan-400"
        />

        {/* 右下角 */}
        <View 
          style={{ 
            width: cornerSize, 
            height: cornerSize,
            borderBottomWidth: borderWidth,
            borderRightWidth: borderWidth,
          }}
          className="absolute bottom-0 right-0 border-cyan-400"
        />
      </View>
    </View>
  );
}
