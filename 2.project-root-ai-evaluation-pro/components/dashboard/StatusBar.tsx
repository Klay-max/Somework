/**
 * StatusBar 组件 - 仪表盘顶部状态栏
 * 
 * 显示 "SYSTEM ONLINE" 文本和绿色呼吸灯
 */

import { View, Text } from 'react-native';
import { StatusIndicator } from '../ui/StatusIndicator';

export function DashboardStatusBar() {
  return (
    <View className="flex-row items-center justify-center py-4">
      <StatusIndicator status="success" size={16} animated={true} />
      <Text className="text-green-400 text-lg font-bold ml-3 tracking-wider">
        SYSTEM ONLINE
      </Text>
    </View>
  );
}
