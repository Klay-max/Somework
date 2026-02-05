/**
 * 主题上下文
 * 
 * 功能：
 * - 管理深色/浅色模式
 * - 持久化主题设置
 * - 提供主题切换功能
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vision_core_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // 加载保存的主题设置
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      let savedTheme: string | null;
      
      if (Platform.OS === 'web') {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      } else {
        savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      }
      
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('加载主题设置失败:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      }
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
