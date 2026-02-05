/**
 * 首页仪表盘
 * 
 * Bento Grid 布局，包含：
 * - 顶部状态栏
 * - 中央主控按钮
 * - 底部数据面板
 */

import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react-native';
import { StorageService } from '../lib/StorageService';
import { t } from '../lib/i18n';

export default function Dashboard() {
  const router = useRouter();
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    averageAccuracy: 0,
    averageScore: 0,
    highestScore: 0,
  });

  // 加载统计信息
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await StorageService.getStatistics();
      setStatistics({
        totalReports: stats.totalReports,
        averageAccuracy: stats.averageAccuracy,
        averageScore: stats.averageScore,
        highestScore: stats.highestScore,
      });
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const handleStartScan = () => {
    // 导航至扫描终端页面
    router.push('/camera');
  };

  const handleViewHistory = () => {
    // 导航至历史记录页面
    router.push('/history');
  };

  const handleBatchProcessing = () => {
    // 导航至批量处理页面
    router.push('/batch');
  };

  const handleSettings = () => {
    // 导航至设置页面
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      {/* 设置按钮 */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={handleSettings}
      >
        <SettingsIcon color="#4A90E2" size={24} />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Bento Grid 布局 */}
        <View style={styles.content}>
          {/* 顶部状态栏 */}
          <View style={styles.statusBar}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>{t('dashboard.systemOnline')}</Text>
          </View>

          {/* 快捷统计卡片 */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>📊</Text>
              <Text style={styles.quickStatValue}>{statistics.totalReports}</Text>
              <Text style={styles.quickStatLabel}>总测评</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>⭐</Text>
              <Text style={styles.quickStatValue}>
                {statistics.averageScore > 0 ? statistics.averageScore.toFixed(0) : '--'}
              </Text>
              <Text style={styles.quickStatLabel}>平均分</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatIcon}>🏆</Text>
              <Text style={styles.quickStatValue}>
                {statistics.highestScore > 0 ? statistics.highestScore : '--'}
              </Text>
              <Text style={styles.quickStatLabel}>最高分</Text>
            </View>
          </View>

          {/* 中央主控区 */}
          <View style={styles.mainControlContainer}>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={handleStartScan}
            >
              <Text style={styles.mainButtonText}>{t('dashboard.startDiagnosis')}</Text>
              <Text style={styles.mainButtonSubtext}>{t('dashboard.startDiagnosisEn')}</Text>
            </TouchableOpacity>

            {/* 功能按钮组 */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleBatchProcessing}
              >
                <Text style={styles.secondaryButtonText}>{t('dashboard.batchProcessing')}</Text>
                <Text style={styles.secondaryButtonSubtext}>{t('dashboard.batchProcessingEn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleViewHistory}
              >
                <Text style={styles.secondaryButtonText}>{t('dashboard.viewHistory')}</Text>
                <Text style={styles.secondaryButtonSubtext}>{t('dashboard.viewHistoryEn')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 底部数据区 */}
          <View style={styles.dataPanel}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>{t('dashboard.averageAccuracy')}</Text>
              <Text style={styles.dataValue}>
                {statistics.totalReports > 0 && statistics.averageAccuracy ? `${statistics.averageAccuracy.toFixed(0)}%` : '--'}
              </Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>{t('dashboard.scanCount')}</Text>
              <Text style={styles.dataValue}>{statistics.totalReports}</Text>
            </View>
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
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
    minHeight: 700,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#52C41A',
    marginRight: 12,
  },
  statusText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainControlContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  mainButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 64,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    color: '#999999',
    fontSize: 11,
  },
  dataPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dataLabel: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 8,
  },
  dataValue: {
    color: '#4A90E2',
    fontSize: 32,
    fontWeight: 'bold',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    marginTop: 16,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickStatValue: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    color: '#999999',
    fontSize: 12,
  },
});
