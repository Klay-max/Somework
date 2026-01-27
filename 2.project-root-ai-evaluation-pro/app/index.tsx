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
        <SettingsIcon color="#00ffff" size={24} />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Bento Grid 布局 */}
        <View style={styles.content}>
          {/* 顶部状态栏 */}
          <View style={styles.statusBar}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>{t('dashboard.systemOnline')}</Text>
          </View>

          {/* OTA 更新测试标记 */}
          <View style={styles.otaTestBanner}>
            <Text style={styles.otaTestText}>🎉 OTA 更新成功！版本 1.0.1</Text>
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
    backgroundColor: '#000000',
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
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
    backgroundColor: '#00ff00',
    marginRight: 12,
  },
  statusText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  mainControlContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  mainButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: '#00ffff',
    borderRadius: 16,
    paddingVertical: 48,
    paddingHorizontal: 64,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    marginBottom: 24,
  },
  mainButtonText: {
    color: '#00ffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainButtonSubtext: {
    color: '#00ffff',
    fontSize: 14,
    letterSpacing: 2,
    opacity: 0.7,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    color: '#888888',
    fontSize: 11,
    letterSpacing: 2,
  },
  dataPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  dataCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  dataLabel: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 8,
  },
  dataValue: {
    color: '#00ffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  otaTestBanner: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 32,
    marginTop: 16,
    alignItems: 'center',
  },
  otaTestText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
