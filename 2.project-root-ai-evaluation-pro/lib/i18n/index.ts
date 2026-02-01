/**
 * 国际化配置
 * 
 * 支持语言：
 * - 中文（简体）zh-CN
 * - 英文 en-US
 * 
 * 简化版实现，不依赖 i18n-js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import zh from './locales/zh-CN.json';
import en from './locales/en-US.json';

// 翻译资源
const translations: Record<string, any> = {
  'zh-CN': zh,
  'zh': zh,
  'en-US': en,
  'en': en,
};

// 当前语言
let currentLocale = 'zh-CN';

// 存储键
const LANGUAGE_KEY = '@anfudao:language';

/**
 * 获取系统语言
 */
function getSystemLocale(): string {
  try {
    // 尝试获取系统语言
    const locale = Platform.OS === 'web' 
      ? (navigator.language || 'zh-CN')
      : 'zh-CN';
    
    // 标准化语言代码
    if (locale.startsWith('zh')) return 'zh-CN';
    if (locale.startsWith('en')) return 'en-US';
    return 'zh-CN';
  } catch (error) {
    return 'zh-CN';
  }
}

/**
 * 获取当前语言
 */
export function getCurrentLanguage(): string {
  return currentLocale;
}

/**
 * 设置语言
 */
export async function setLanguage(locale: string): Promise<void> {
  currentLocale = locale;
  await AsyncStorage.setItem(LANGUAGE_KEY, locale);
  console.log(`[i18n] 语言已切换为: ${locale}`);
}

/**
 * 加载保存的语言设置
 */
export async function loadSavedLanguage(): Promise<void> {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      currentLocale = savedLanguage;
      console.log(`[i18n] 加载保存的语言: ${savedLanguage}`);
    } else {
      currentLocale = getSystemLocale();
      console.log(`[i18n] 使用系统语言: ${currentLocale}`);
    }
  } catch (error) {
    console.error('[i18n] 加载语言设置失败:', error);
    currentLocale = 'zh-CN';
  }
}

/**
 * 翻译函数
 */
export function t(key: string, options?: any): string {
  try {
    const keys = key.split('.');
    let value: any = translations[currentLocale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // 返回 key 作为后备
      }
    }
    
    if (typeof value === 'string') {
      // 简单的变量替换
      if (options) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return options[varName] || match;
        });
      }
      return value;
    }
    
    return key;
  } catch (error) {
    console.error('[i18n] 翻译失败:', key, error);
    return key;
  }
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLanguages() {
  return [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'en-US', name: 'English', nativeName: 'English' },
  ];
}

// 初始化
loadSavedLanguage().catch(console.error);
