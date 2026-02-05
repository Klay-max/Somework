/**
 * 设置页面
 * 
 * 功能：
 * - 语言切换
 * - 缓存管理
 * - 关于信息
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, Trash2, Info, RefreshCw, Moon } from 'lucide-react-native';
import { getCurrentLanguage, setLanguage, getSupportedLanguages, t } from '../lib/i18n';
import { CacheService } from '../lib/CacheService';
import * as Updates from 'expo-updates';
import { useTheme } from '../lib/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [cacheSize, setCacheSize] = useState(0);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<string>('');

  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    try {
      const stats = await CacheService.getStats();
      setCacheSize(stats.size);
    } catch (error) {
      console.error('加载缓存大小失败:', error);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    try {
      await setLanguage(langCode);
      setCurrentLang(langCode);
      Alert.alert(
        t('common.success'),
        '语言已切换，部分内容需要重启应用后生效'
      );
    } catch (error) {
      console.error('切换语言失败:', error);
      Alert.alert(t('common.error'), '切换语言失败');
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      t('settings.clearCache'),
      '确定要清空所有缓存吗？',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await CacheService.clear();
              await loadCacheSize();
              Alert.alert(t('common.success'), t('settings.cacheCleared'));
            } catch (error) {
              console.error('清空缓存失败:', error);
              Alert.alert(t('common.error'), '清空缓存失败');
            }
          },
        },
      ]
    );
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateInfo('正在检查更新...');

    try {
      console.log('开始检查更新...');
      console.log('环境信息:', {
        isDev: __DEV__,
        isEnabled: Updates.isEnabled,
        platform: Platform.OS,
      });
      
      // 检查是否有可用更新
      const update = await Updates.checkForUpdateAsync();
      
      console.log('更新检查结果:', update);
      
      if (update.isAvailable) {
        setUpdateInfo('发现新版本，正在下载...');
        console.log('发现新版本，开始下载...');
        
        // 下载更新
        const result = await Updates.fetchUpdateAsync();
        console.log('下载完成:', result);
        
        setUpdateInfo('');
        setIsCheckingUpdate(false);
        
        // 提示用户重启应用
        Alert.alert(
          '更新已下载',
          '应用将重启以应用更新',
          [
            {
              text: '稍后',
              style: 'cancel',
            },
            {
              text: '立即重启',
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      } else {
        console.log('当前已是最新版本');
        setUpdateInfo('');
        setIsCheckingUpdate(false);
        Alert.alert('提示', '当前已是最新版本');
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      setUpdateInfo('');
      setIsCheckingUpdate(false);
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      // 如果是因为不支持 OTA 更新
      if (!Updates.isEnabled) {
        Alert.alert(
          'OTA 更新不可用',
          `当前环境不支持 OTA 更新\n\n环境信息：\n- 开发模式: ${__DEV__ ? '是' : '否'}\n- Updates.isEnabled: ${Updates.isEnabled}\n- Platform: ${Platform.OS}\n\nOTA 更新仅在生产构建中可用。\n请使用 EAS Build 构建的 APK 测试更新功能。`
        );
      } else {
        Alert.alert('错误', `检查更新失败：${errorMessage}\n\n请确保网络连接正常`);
      }
    }
  };

  const supportedLanguages = getSupportedLanguages();

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>SETTINGS</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 深色模式 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>深色模式</Text>
          </View>

          <View style={styles.themeCard}>
            <View style={styles.themeInfo}>
              <Text style={styles.themeLabel}>启用深色模式</Text>
              <Text style={styles.themeDescription}>
                {isDark ? '当前使用深色主题' : '当前使用浅色主题'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
              thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
        </View>

        {/* 语言设置 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          </View>

          {supportedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                currentLang.startsWith(lang.code.split('-')[0]) && styles.languageItemActive
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={styles.languageName}>{lang.nativeName}</Text>
              <Text style={styles.languageCode}>{lang.name}</Text>
              {currentLang.startsWith(lang.code.split('-')[0]) && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 检查更新 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RefreshCw color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>检查更新</Text>
          </View>

          <View style={styles.updateCard}>
            <View style={styles.updateInfo}>
              <Text style={styles.updateLabel}>当前版本</Text>
              <Text style={styles.updateVersion}>1.0.0</Text>
            </View>
            
            {updateInfo ? (
              <View style={styles.updateStatusContainer}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.updateStatusText}>{updateInfo}</Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, isCheckingUpdate && styles.updateButtonDisabled]}
            onPress={handleCheckUpdate}
            disabled={isCheckingUpdate}
          >
            {isCheckingUpdate ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>检查更新</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 缓存管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trash2 color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>{t('settings.cache')}</Text>
          </View>

          <View style={styles.cacheInfo}>
            <Text style={styles.cacheLabel}>缓存大小</Text>
            <Text style={styles.cacheValue}>
              {(cacheSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCache}
          >
            <Text style={styles.clearButtonText}>{t('settings.clearCache')}</Text>
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info color="#4A90E2" size={24} />
            <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>应用名称</Text>
            <Text style={styles.aboutValue}>安辅导 (AnFuDao)</Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutInfo}>
            <Text style={styles.aboutLabel}>开发者</Text>
            <Text style={styles.aboutValue}>Klay</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#333333',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999999',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  languageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageItemActive: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  languageName: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  languageCode: {
    color: '#999999',
    fontSize: 14,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A90E2',
  },
  themeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    color: '#999999',
    fontSize: 13,
  },
  updateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  updateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateLabel: {
    color: '#999999',
    fontSize: 14,
  },
  updateVersion: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  updateStatusText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0.1,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cacheInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cacheLabel: {
    color: '#999999',
    fontSize: 14,
  },
  cacheValue: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutLabel: {
    color: '#999999',
    fontSize: 14,
  },
  aboutValue: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
});
