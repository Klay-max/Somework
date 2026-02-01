/**
 * 设置页面
 * 
 * 功能：
 * - 语言切换
 * - 缓存管理
 * - 关于信息
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, Trash2, Info } from 'lucide-react-native';
import { getCurrentLanguage, setLanguage, getSupportedLanguages, t } from '../lib/i18n';
import { CacheService } from '../lib/CacheService';

export default function Settings() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [cacheSize, setCacheSize] = useState(0);

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
        {/* 语言设置 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe color="#00ffff" size={24} />
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

        {/* 缓存管理 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trash2 color="#00ffff" size={24} />
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
            <Info color="#00ffff" size={24} />
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
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#00ffff',
    fontSize: 16,
  },
  title: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#888888',
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  languageItem: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageItemActive: {
    borderColor: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  languageName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageCode: {
    color: '#888888',
    fontSize: 14,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ffff',
  },
  cacheInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cacheLabel: {
    color: '#888888',
    fontSize: 14,
  },
  cacheValue: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#ff0000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  aboutLabel: {
    color: '#888888',
    fontSize: 14,
  },
  aboutValue: {
    color: '#ffffff',
    fontSize: 14,
  },
});
