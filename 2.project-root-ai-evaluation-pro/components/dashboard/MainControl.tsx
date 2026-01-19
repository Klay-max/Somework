/**
 * MainControl 组件 - 主控按钮
 * 
 * 大型发光按钮，用于启动视觉诊断
 */

import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface MainControlProps {
  onPress: () => void;
}

export function MainControl({ onPress }: MainControlProps) {
  return (
    <View className="items-center justify-center py-12">
      <Button
        onPress={onPress}
        className="w-80 py-8"
      >
        <View className="items-center">
          <Text className="text-cyan-400 text-2xl font-bold tracking-wider">
            启动视觉诊断
          </Text>
          <Text className="text-cyan-400/60 text-sm mt-2 tracking-widest">
            INITIATE SCAN
          </Text>
        </View>
      </Button>
    </View>
  );
}
