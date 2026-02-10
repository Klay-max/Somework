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

  // 今日学习时长（模拟数据）
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  
  // 每日提示语
  const dailyTips = [
    '💪 坚持就是胜利！',
    '🌟 每一次练习都是进步！',
    '📚 知识改变命运！',
    '🎯 今天的努力，明天的成功！',
    '✨ 相信自己，你能做到！',
    '🚀 学习使我快乐！',
    '🌈 加油，你是最棒的！',
  ];
  
  const [dailyTip, setDailyTip] = useState('');

  // 加载统计信息
  useEffect(() => {
    loadStatistics();
    // 根据日期选择每日提示语
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyTip(dailyTips[dayOfYear % dailyTips.length]);
    // 模拟今日学习时长（实际应该从存储中读取）
    setTodayStudyTime(Math.floor(Math.random() * 120) + 30);
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

          {/* 版本标记 - 用于测试 OTA 更新 */}
          <View style={styles.versionBanner}>
            <Text style={styles.versionText}>🎉 版本 1.0.5 - 学习统计功能上线！</Text>
          </View>

          {/* 每日提示语 */}
          <View style={styles.dailyTipCard}>
            <Text style={styles.dailyTipText}>{dailyTip}</Text>
          </View>

          {/* 今日学习统计 */}
          <View style={styles.todayStatsCard}>
            <Text style={styles.todayStatsTitle}>📖 今日学习</Text>
            <View style={styles.studyTimeContainer}>
              <Text style={styles.studyTimeValue}>{todayStudyTime}</Text>
              <Text style={styles.studyTimeUnit}>分钟</Text>
            </View>
            {/* 学习进度条 */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min((todayStudyTime / 120) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                目标: 120分钟 ({Math.min(Math.floor((todayStudyTime / 120) * 100), 100)}%)
              </Text>
            </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
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
    marginVertical: 20,
    paddingHorizontal: 0,
  },
  mainButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  mainButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    color: '#999999',
    fontSize: 11,
  },
  dataPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 16,
    gap: 12,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dataLabel: {
    color: '#999999',
    fontSize: 13,
    marginBottom: 8,
  },
  dataValue: {
    color: '#4A90E2',
    fontSize: 28,
    fontWeight: 'bold',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 16,
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickStatValue: {
    color: '#4A90E2',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    color: '#999999',
    fontSize: 11,
  },
  versionBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#81C784',
  },
  versionText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  dailyTipCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  dailyTipText: {
    color: '#E65100',
    fontSize: 16,
    fontWeight: '600',
  },
  todayStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  todayStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  studyTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  studyTimeValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  studyTimeUnit: {
    fontSize: 18,
    color: '#999999',
    marginLeft: 6,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
});
