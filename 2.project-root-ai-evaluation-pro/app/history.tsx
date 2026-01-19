/**
 * 历史记录页面
 * 
 * 功能：
 * - 显示所有历史报告
 * - 按时间排序
 * - 点击查看详情
 * - 删除报告
 * - 显示统计信息
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StorageService, type StoredReport } from '../lib/StorageService';

export default function HistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    averageAccuracy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const [reportsData, stats] = await Promise.all([
        StorageService.getAllReports(),
        StorageService.getStatistics(),
      ]);
      
      setReports(reportsData);
      setStatistics(stats);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      Alert.alert('错误', '加载历史记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 查看报告详情
  const handleViewReport = (report: StoredReport) => {
    router.push({
      pathname: `/report/${report.id}`,
      params: {
        data: JSON.stringify(report.data),
      },
    });
  };

  // 删除报告
  const handleDeleteReport = (id: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条报告吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteReport(id);
              await loadHistory(); // 重新加载
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  // 清空所有记录
  const handleClearAll = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有历史记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllReports();
              await loadHistory();
            } catch (error) {
              Alert.alert('错误', '清空失败');
            }
          },
        },
      ]
    );
  };

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>历史记录</Text>
          <Text style={styles.subtitle}>HISTORY</Text>
        </View>

        {reports.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 统计信息 */}
          {statistics.totalReports > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>统计概览</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.totalReports}</Text>
                  <Text style={styles.statLabel}>总测评次数</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.averageScore.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>平均分</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.highestScore}</Text>
                  <Text style={styles.statLabel}>最高分</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.averageAccuracy.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>平均正确率</Text>
                </View>
              </View>
            </View>
          )}

          {/* 历史记录列表 */}
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>加载中...</Text>
            </View>
          ) : reports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>暂无历史记录</Text>
              <Text style={styles.emptyHint}>完成一次扫描后，记录将显示在这里</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {reports.map((report, index) => (
                <View key={report.id} style={styles.reportCard}>
                  <TouchableOpacity
                    style={styles.reportContent}
                    onPress={() => handleViewReport(report)}
                  >
                    {/* 左侧序号 */}
                    <View style={styles.reportNumber}>
                      <Text style={styles.reportNumberText}>{index + 1}</Text>
                    </View>

                    {/* 中间信息 */}
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportDate}>{formatDate(report.timestamp)}</Text>
                      <View style={styles.reportStats}>
                        <View style={styles.reportStatItem}>
                          <Text style={styles.reportStatLabel}>得分</Text>
                          <Text style={styles.reportStatValue}>{report.score}</Text>
                        </View>
                        <View style={styles.reportStatDivider} />
                        <View style={styles.reportStatItem}>
                          <Text style={styles.reportStatLabel}>正确率</Text>
                          <Text style={styles.reportStatValue}>{report.accuracy.toFixed(1)}%</Text>
                        </View>
                      </View>
                    </View>

                    {/* 右侧操作 */}
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => handleViewReport(report)}
                      >
                        <Text style={styles.viewButtonText}>查看</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReport(report.id)}
                      >
                        <Text style={styles.deleteButtonText}>删除</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
    minWidth: 80,
  },
  backText: {
    color: '#00ffff',
    fontSize: 16,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
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
    marginTop: 4,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    borderRadius: 4,
    minWidth: 80,
  },
  clearText: {
    color: '#ff6666',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  statsCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  statsTitle: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  statValue: {
    color: '#00ffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    color: '#888888',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#888888',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyHint: {
    color: '#666666',
    fontSize: 14,
  },
  listContainer: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  reportNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  reportNumberText: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reportInfo: {
    flex: 1,
  },
  reportDate: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 12,
  },
  reportStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportStatItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  reportStatLabel: {
    color: '#666666',
    fontSize: 13,
  },
  reportStatValue: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  reportStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#333333',
    marginHorizontal: 16,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6666',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ff6666',
    fontSize: 14,
  },
});
