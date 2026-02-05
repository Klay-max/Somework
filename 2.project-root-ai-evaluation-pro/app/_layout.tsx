// 全局布局组件 - 配置深色主题和导航
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import { Alert, Platform } from 'react-native';
import { ThemeProvider } from '../lib/ThemeContext';

export default function RootLayout() {
  // 检查应用更新
  useEffect(() => {
    async function checkForUpdates() {
      // 只在生产环境和非开发模式下检查更新
      if (__DEV__ || !Updates.isEnabled) {
        console.log('OTA 更新已禁用:', {
          isDev: __DEV__,
          isEnabled: Updates.isEnabled,
        });
        return;
      }

      try {
        console.log('自动检查更新...');
        const update = await Updates.checkForUpdateAsync();
        
        console.log('更新检查结果:', {
          isAvailable: update.isAvailable,
          manifest: update.manifest,
        });
        
        if (update.isAvailable) {
          console.log('发现新版本，开始下载...');
          
          // 后台下载更新
          const result = await Updates.fetchUpdateAsync();
          console.log('更新下载完成:', result);
          
          // 提示用户重启应用
          Alert.alert(
            '发现新版本',
            '应用将重启以应用更新',
            [
              {
                text: '稍后',
                style: 'cancel',
              },
              {
                text: '立即更新',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        } else {
          console.log('当前已是最新版本');
        }
      } catch (error) {
        // 静默失败，不影响用户体验
        console.log('检查更新失败:', error);
      }
    }

    // 延迟 3 秒后检查更新，避免影响启动速度
    const timer = setTimeout(checkForUpdates, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      {/* 状态栏设置为深色（适配浅色背景） */}
      <StatusBar style="dark" />
      
      {/* Stack 导航器配置 */}
      <Stack
        screenOptions={{
          // 隐藏默认的导航栏 Header
          headerShown: false,
          // 全局应用浅灰色背景 (#F5F7FA)
          contentStyle: { backgroundColor: '#F5F7FA' },
        }}
      />
    </ThemeProvider>
  );
}
