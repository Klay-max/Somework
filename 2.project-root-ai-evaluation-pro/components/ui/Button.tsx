/**
 * Button 组件 - 带发光效果的赛博朋克按钮
 * 
 * 特点：
 * - 霓虹光晕效果
 * - 青色主题
 * - 支持按压反馈
 */

import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-cyan-500/20 border-cyan-500',
    secondary: 'bg-green-500/20 border-green-500',
  };

  return (
    <TouchableOpacity
      className={`
        px-6 py-4 rounded-lg border-2
        ${variantStyles[variant]}
        ${className}
      `}
      style={variant === 'primary' ? styles.glowCyan : styles.glowGreen}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={`text-center font-bold text-lg ${
          variant === 'primary' ? 'text-cyan-400' : 'text-green-400'
        }`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glowCyan: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glowGreen: {
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});
