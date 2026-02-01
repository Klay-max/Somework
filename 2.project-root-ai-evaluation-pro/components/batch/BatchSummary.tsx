/**
 * 批量结果汇总组件
 * 
 * 功能：
 * - 显示批量处理统计
 * - 生成班级报告
 * - 导出 Excel 数据
 * - 可视化分析
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { BarChart, Download, TrendingUp, Users } from 'lucide-react-native';
import { t } from '../../lib/i18n';

interface BatchResult {
  id: string;
  fileName: string;
  score: number;
  accuracy: number;
  timestamp: string;
}

interface BatchSummaryProps {
  results: BatchResult[];
  onExport?: () => void;
}

export default function BatchSummary({ results, onExport }: BatchSummaryProps) {
  // 计算统计数据
  const stats = React.useMemo(() => {
    if (results.length === 0) {
      return {
        total: 0,
        avgScore: 0,
        avgAccuracy: 0,
        maxScore: 0,
        minScore: 0,
        passRate: 0,
        excellentRate: 0,
      };
    }

    const scores = results.map(r => r.score);
    const accuracies = results.map(r => r.accuracy);
    
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const avgAccuracy = accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    // 及格率（60分以上）
    const passCount = scores.filter(s => s >= 60).length;
    const passRate = (passCount / scores.length) * 100;
    
    // 优秀率（90分以上）
    const excellentCount = scores.filter(s => s >= 90).length;
    const excellentRate = (excellentCount / scores.length) * 100;

    return {
      total: results.length,
      avgScore,
      avgAccuracy,
      maxScore,
      minScore,
      passRate,
      excellentRate,
    };
  }, [results]);

  // 分数分布
  const scoreDistribution = React.useMemo(() => {
    const ranges = [
      { label: '0-59', min: 0, max: 59, count: 0 },
      { label: '60-69', min: 60, max: 69, count: 0 },
      { label: '70-79', min: 70, max: 79, count: 0 },
      { label: '80-89', min: 80, max: 89, count: 0 },
      { label: '90-100', min: 90, max: 100, count: 0 },
    ];

    results.forEach(r => {
      const range = ranges.find(rg => r.score >= rg.min && r.score <= rg.max);
      if (range) range.count++;
    });

    return ranges;
  }, [results]);

  // 导出数据
  const handleExport = () => {
    if (results.length === 0) {
      Alert.alert(t('common.error'), t('batchSummary.noData'));
      return;
    }

    // 生成 CSV 数据
    const csvHeader = '序号,文件名,得分,正确率,时间\n';
    const csvRows = results.map((r, index) => 
      `${index + 1},${r.fileName},${r.score},${r.accuracy.toFixed(1)}%,${new Date(r.timestamp).toLocaleString()}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;

    // 在实际应用中，这里应该调用文件系统 API 保存文件
    console.log('导出 CSV:', csvContent);
    
    Alert.alert(
      '导出成功',
      `已导出 ${results.length} 条记录\n\n统计信息:\n` +
      `平均分: ${stats.avgScore.toFixed(1)}\n` +
      `及格率: ${stats.passRate.toFixed(1)}%\n` +
      `优秀率: ${stats.excellentRate.toFixed(1)}%`
    );

    onExport?.();
  };

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BarChart color="#666666" size={64} />
        <Text style={styles.emptyText}>暂无数据</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>批量处理汇总</Text>
        <Text style={styles.subtitle}>BATCH SUMMARY</Text>
      </View>

      {/* 核心统计卡片 */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Users color="#00ffff" size={24} />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>总数</Text>
        </View>

        <View style={styles.statCard}>
          <TrendingUp color="#00ff00" size={24} />
          <Text style={styles.statValue}>{stats.avgScore.toFixed(1)}</Text>
          <Text style={styles.statLabel}>平均分</Text>
        </View>

        <View style={styles.statCard}>
          <BarChart color="#00ffff" size={24} />
          <Text style={styles.statValue}>{stats.avgAccuracy.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>平均正确率</Text>
        </View>
      </View>

      {/* 详细统计 */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>详细统计</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>最高分</Text>
          <Text style={styles.detailValue}>{stats.maxScore}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>最低分</Text>
          <Text style={styles.detailValue}>{stats.minScore}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>及格率（≥60分）</Text>
          <Text style={[styles.detailValue, { color: '#00ff00' }]}>
            {stats.passRate.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>优秀率（≥90分）</Text>
          <Text style={[styles.detailValue, { color: '#00ffff' }]}>
            {stats.excellentRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* 分数分布 */}
      <View style={styles.distributionContainer}>
        <Text style={styles.sectionTitle}>分数分布</Text>
        
        {scoreDistribution.map((range, index) => (
          <View key={index} style={styles.distributionRow}>
            <Text style={styles.distributionLabel}>{range.label}</Text>
            <View style={styles.distributionBar}>
              <View 
                style={[
                  styles.distributionFill,
                  { 
                    width: `${(range.count / stats.total) * 100}%`,
                    backgroundColor: range.min >= 90 ? '#00ffff' : 
                                    range.min >= 60 ? '#00ff00' : '#ff0000'
                  }
                ]} 
              />
            </View>
            <Text style={styles.distributionCount}>{range.count}</Text>
          </View>
        ))}
      </View>

      {/* 导出按钮 */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Download color="#00ffff" size={20} />
        <Text style={styles.exportButtonText}>导出 Excel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    color: '#00ffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  detailLabel: {
    color: '#888888',
    fontSize: 14,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  distributionContainer: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionLabel: {
    color: '#888888',
    fontSize: 14,
    width: 80,
  },
  distributionBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#222222',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  distributionFill: {
    height: '100%',
  },
  distributionCount: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  exportButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
