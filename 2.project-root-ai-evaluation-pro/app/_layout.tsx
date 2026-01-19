// 全局布局组件 - 配置深色主题和导航
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* 状态栏设置为浅色（适配深色背景） */}
      <StatusBar style="light" />
      
      {/* Stack 导航器配置 */}
      <Stack
        screenOptions={{
          // 隐藏默认的导航栏 Header
          headerShown: false,
          // 全局应用纯黑色背景 (#000000)
          contentStyle: { backgroundColor: '#000000' },
        }}
      />
    </>
  );
}
