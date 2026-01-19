/**
 * 报告页面
 * 
 * 功能：
 * - 接收动态路由参数 id
 * - 加载报告数据
 * - 显示完整报告内容
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { generateMockReport } from '@/lib/mockData';
import { ScoreCore } from '@/components/report/ScoreCore';
// import { AbilityRadar } from '@/components/report/AbilityRadar'; // 临时注释用于测试构建
import { StorageService } from '@/lib/StorageService';
import type { ReportData } from '@/lib/types';

export default function ReportPage() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载报告数据
  useEffect(() => {
    console.log('报告页面加载，参数:', { id, hasData: !!data });
    loadReportData();
  }, [id, data]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      console.log('开始加载报告数据...');
      
      // 优先使用路由参数中的数据
      if (data) {
        try {
          console.log('尝试解析路由参数...');
          const parsed = JSON.parse(data as string);
          setReportData(parsed);
          console.log('✓ 使用路由参数中的报告数据');
          return;
        } catch (err) {
          console.error('✗ 解析路由参数失败:', err);
        }
      }
      
      // 尝试从存储中加载
      if (id) {
        console.log('尝试从存储中加载报告:', id);
        const stored = await StorageService.getReportById(id);
        if (stored) {
          setReportData(stored);
          console.log('✓ 从存储中加载报告数据');
          return;
        }
        console.log('✗ 存储中未找到报告');
      }
      
      // 降级到模拟数据
      console.log('⚠ 使用模拟报告数据');
      setReportData(generateMockReport(id || 'default'));
    } catch (error) {
      console.error('✗ 加载报告数据失败:', error);
      setReportData(generateMockReport(id || 'default'));
    } finally {
      setIsLoading(false);
      console.log('报告数据加载完成');
    }
  };

  if (isLoading || !reportData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // 分享功能
  const handleShare = async () => {
    const shareText = `我的测评得分：${reportData.score.score}分，正确率：${reportData.score.accuracy}%`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '安辅导 诊断报告',
            text: shareText,
          });
        } catch (err) {
          // 用户取消分享
        }
      } else {
        // 降级方案：复制到剪贴板
        await navigator.clipboard.writeText(shareText);
        alert('链接已复制到剪贴板');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>诊断报告</Text>
            <Text style={styles.subtitle}>DIAGNOSTIC REPORT</Text>
          </View>

          <TouchableOpacity 
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Text style={styles.shareText}>分享</Text>
          </TouchableOpacity>
        </View>

        {/* 报告内容 */}
        <View style={styles.content}>
          {/* 核心计分板 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>核心得分</Text>
            <ScoreCore data={reportData.score} />
          </View>

          {/* 五维能力雷达图 - 临时注释用于测试构建 */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>能力分析</Text>
            <AbilityRadar data={reportData.ability} />
          </View> */}
          
          {/* 临时替代：显示能力数据 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>能力分析</Text>
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>五维能力评估</Text>
              <View style={styles.abilityList}>
                <View style={styles.abilityItem}>
                  <Text style={styles.abilityLabel}>听力理解</Text>
                  <Text style={styles.abilityValue}>{reportData.ability.listening || 0}%</Text>
                </View>
                <View style={styles.abilityItem}>
                  <Text style={styles.abilityLabel}>语法运用</Text>
                  <Text style={styles.abilityValue}>{reportData.ability.grammar || 0}%</Text>
                </View>
                <View style={styles.abilityItem}>
                  <Text style={styles.abilityLabel}>阅读理解</Text>
                  <Text style={styles.abilityValue}>{reportData.ability.reading || 0}%</Text>
                </View>
                <View style={styles.abilityItem}>
                  <Text style={styles.abilityLabel}>完形填空</Text>
                  <Text style={styles.abilityValue}>{reportData.ability.cloze || 0}%</Text>
                </View>
                <View style={styles.abilityItem}>
                  <Text style={styles.abilityLabel}>逻辑推理</Text>
                  <Text style={styles.abilityValue}>{reportData.ability.logic || 0}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 深度分析 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>深度分析</Text>
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>表层病灶</Text>
              <View style={styles.tagContainer}>
                {reportData.analysis.surfaceIssues.map((issue, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{issue}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.cardSubtitle, { marginTop: 20 }]}>深层病根</Text>
              {reportData.analysis.rootCauses.map((cause, index) => (
                <View key={index} style={styles.alertBox}>
                  <Text style={styles.alertText}>{cause}</Text>
                </View>
              ))}

              <Text style={[styles.cardSubtitle, { marginTop: 20 }]}>AI 点评</Text>
              <Text style={styles.commentText}>{reportData.analysis.aiComment}</Text>
            </View>
          </View>

          {/* 知识点矩阵 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>知识点掌握</Text>
            <View style={styles.card}>
              {reportData.knowledge.map((point, index) => (
                <View key={index} style={styles.knowledgeItem}>
                  <View style={styles.knowledgeHeader}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: point.mastered ? '#00ff00' : '#ff0000' }
                    ]} />
                    <Text style={styles.knowledgeName}>{point.name}</Text>
                  </View>
                  <View style={styles.knowledgeMeta}>
                    <Text style={styles.knowledgeDifficulty}>
                      难度: {'★'.repeat(point.difficulty)}
                    </Text>
                    <Text style={[
                      styles.knowledgeStatus,
                      { color: point.mastered ? '#00ff00' : '#ff0000' }
                    ]}>
                      {point.mastered ? '已掌握' : '待加强'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 提分路径 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>提分路径</Text>
            <View style={styles.card}>
              {reportData.path.map((stage, index) => (
                <View key={index} style={styles.pathStage}>
                  <View style={styles.stageHeader}>
                    <View style={styles.stageNumber}>
                      <Text style={styles.stageNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stageTitle}>{stage.title}</Text>
                  </View>
                  <Text style={styles.stageContent}>{stage.content}</Text>
                  <Text style={styles.stageDuration}>预计时间: {stage.duration}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              报告生成时间: {new Date(reportData.timestamp).toLocaleString('zh-CN')}
            </Text>
            <Text style={styles.footerCopyright}>安辅导 © 2026</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffff',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
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
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)',
    borderRadius: 4,
    minWidth: 80,
  },
  shareText: {
    color: '#00ffff',
    fontSize: 14,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 24,
  },
  cardSubtitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  tagText: {
    color: '#00ffff',
    fontSize: 14,
  },
  alertBox: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  alertText: {
    color: '#ff6666',
    fontSize: 15,
    lineHeight: 22,
  },
  commentText: {
    color: '#cccccc',
    fontSize: 15,
    lineHeight: 24,
  },
  knowledgeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingVertical: 16,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  knowledgeName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  knowledgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  knowledgeDifficulty: {
    color: '#888888',
    fontSize: 15,
  },
  knowledgeStatus: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  pathStage: {
    borderLeftWidth: 4,
    borderLeftColor: '#00ffff',
    paddingLeft: 24,
    marginBottom: 24,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stageNumberText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stageTitle: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  stageContent: {
    color: '#cccccc',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 24,
  },
  stageDuration: {
    color: '#888888',
    fontSize: 14,
  },
  // 临时能力列表样式
  abilityList: {
    gap: 16,
  },
  abilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  abilityLabel: {
    color: '#cccccc',
    fontSize: 16,
  },
  abilityValue: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    color: '#666666',
    fontSize: 13,
  },
  footerCopyright: {
    color: '#444444',
    fontSize: 11,
    marginTop: 8,
  },
});
