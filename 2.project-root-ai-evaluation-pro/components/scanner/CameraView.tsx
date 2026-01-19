/**
 * CameraView 组件 - 移动端相机
 * 
 * 特点：
 * - 仅在移动端使用
 * - 使用 expo-camera 的 CameraView
 * - 请求相机权限
 * - 全屏显示相机预览
 * - 提供拍照按钮
 */

import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';

interface CameraViewProps {
  onCapture: (uri: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const cameraRef = useRef<ExpoCameraView>(null);

  // 只在移动端渲染
  if (Platform.OS === 'web') {
    return null;
  }

  // 权限未加载
  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-gray-400">加载中...</Text>
      </View>
    );
  }

  // 权限被拒绝
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-8">
        <View className="items-center space-y-4">
          <View className="w-20 h-20 border-2 border-red-500 rounded-full items-center justify-center">
            <Text className="text-red-500 text-4xl">!</Text>
          </View>

          <Text className="text-red-400 text-xl font-bold text-center">
            需要相机权限
          </Text>

          <Text className="text-gray-400 text-sm text-center mt-2">
            安辅导需要访问您的相机以进行扫描功能
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            className="mt-6 bg-cyan-500/20 border-2 border-cyan-500 px-8 py-4 rounded-lg"
          >
            <Text className="text-cyan-400 font-bold">授予权限</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current || !isReady) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch (error) {
      Alert.alert('错误', '拍照失败，请重试');
      console.error('Camera error:', error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ExpoCameraView
        ref={cameraRef}
        className="flex-1"
        facing="back"
        onCameraReady={() => setIsReady(true)}
      />

      {/* 拍照按钮 */}
      <View className="absolute bottom-0 left-0 right-0 pb-12 items-center">
        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={!isReady}
          className={`
            w-20 h-20 rounded-full border-4 items-center justify-center
            ${isReady ? 'border-cyan-400 bg-cyan-500/20' : 'border-gray-600 bg-gray-800/20'}
          `}
          activeOpacity={0.7}
        >
          <View className={`w-16 h-16 rounded-full ${isReady ? 'bg-cyan-400' : 'bg-gray-600'}`} />
        </TouchableOpacity>

        <Text className="text-gray-400 text-sm mt-4">
          {isReady ? '点击拍照' : '相机准备中...'}
        </Text>
      </View>
    </View>
  );
}
