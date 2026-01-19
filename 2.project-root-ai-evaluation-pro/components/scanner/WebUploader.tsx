/**
 * WebUploader 组件 - Web 端文件上传
 * 
 * 特点：
 * - 仅在 Web 端使用
 * - 支持拖拽上传
 * - 支持点击选择文件
 * - 科幻风格的上传区域
 */

import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useState, useRef } from 'react';

interface WebUploaderProps {
  onUpload: (file: File) => void;
}

export function WebUploader({ onUpload }: WebUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 只在 Web 端渲染
  if (Platform.OS !== 'web') {
    return null;
  }

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  return (
    <View className="flex-1 items-center justify-center p-8">
      <TouchableOpacity
        onPress={handleClick}
        activeOpacity={0.8}
        className="w-full max-w-md"
      >
        <View
          // @ts-ignore - Web specific props
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12
            ${isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-cyan-500/50 bg-cyan-500/5'}
            transition-all duration-300
          `}
        >
          <View className="items-center space-y-4">
            {/* 上传图标 */}
            <View className="w-20 h-20 border-2 border-cyan-400 rounded-full items-center justify-center">
              <Text className="text-cyan-400 text-4xl">↑</Text>
            </View>

            {/* 文案 */}
            <View className="items-center">
              <Text className="text-cyan-400 text-xl font-bold tracking-wider">
                数据传输口
              </Text>
              <Text className="text-cyan-400/60 text-sm mt-2 tracking-widest">
                DATA TRANSFER PORT
              </Text>
            </View>

            {/* 提示文本 */}
            <View className="items-center mt-4">
              <Text className="text-gray-400 text-sm">
                拖拽图片文件至此区域
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                或点击选择文件
              </Text>
            </View>

            {/* 支持格式 */}
            <Text className="text-gray-600 text-xs mt-2">
              支持格式: JPG, PNG, GIF
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef as any}
        type="file"
        accept="image/*"
        onChange={handleInputChange as any}
        style={{ display: 'none' }}
      />
    </View>
  );
}
