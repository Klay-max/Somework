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
import { StorageService } from '../lib/StorageService';

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Bento Grid 布局 */}
        <View style={styles.content}>
          {/* 顶部状态栏 */}
          <View style={styles.statusBar}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>SYSTEM ONLINE</Text>
          </View>

          {/* 中央主控区 */}
          <View style={styles.mainControlContainer}>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={handleStartScan}
            >
              <Text style={styles.mainButtonText}>开始AI诊断</Text>
              <Text style={styles.mainButtonSubtext}>START AI DIAGNOSIS</Text>
            </TouchableOpacity>

            {/* 历史记录按钮 */}
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={handleViewHistory}
            >
              <Text style={styles.historyButtonText}>查看历史记录</Text>
              <Text style={styles.historyButtonSubtext}>VIEW HISTORY</Text>
            </TouchableOpacity>
          </View>

          {/* 底部数据区 */}
          <View style={styles.dataPanel}>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>平均正确率</Text>
              <Text style={styles.dataValue}>
                {statistics.totalReports > 0 ? `${statistics.averageAccuracy.toFixed(0)}%` : '--'}
              </Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataLabel}>扫描次数</Text>
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
  historyButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyButtonSubtext: {
    color: '#888888',
    fontSize: 12,
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
});
