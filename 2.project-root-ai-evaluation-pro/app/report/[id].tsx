/**
 * 报告页面
 * 
 * 功能：
 * - 接收动态路由参数 id
 * - 加载报告数据
 * - 显示完整报告内容
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { generateMockReport } from '@/lib/mockData';
import { ScoreCore } from '@/components/report/ScoreCore';
// import { AbilityRadar } from '@/components/report/AbilityRadar'; // 临时注释用于测试构建
import { StorageService } from '@/lib/StorageService';
import type { ReportData } from '@/lib/types';
import { t } from '@/lib/i18n';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

export default function ReportPage() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<View>(null);

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
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  // 分享功能
  const handleShare = async () => {
    const shareText = `${t('report.score')}：${reportData.score.score}${t('report.accuracy')}：${reportData.score.accuracy}%`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: t('report.title'),
            text: shareText,
          });
        } catch (err) {
          // 用户取消分享
        }
      } else {
        // 降级方案：复制到剪贴板
        await navigator.clipboard.writeText(shareText);
        alert(t('report.shareSuccess'));
      }
    } else {
      // 移动端：导出为图片并分享
      await exportAsImage();
    }
  };

  // 导出为图片
  const exportAsImage = async () => {
    if (!reportRef.current) {
      Alert.alert(t('common.error'), t('report.exportFailed'));
      return;
    }

    try {
      setIsExporting(true);

      // 截取报告视图
      const uri = await captureRef(reportRef, {
        format: 'png',
        quality: 0.9,
      });

      // 保存到文件系统
      const fileName = `report_${id}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      // 分享图片
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: t('report.shareTitle'),
        });
      } else {
        Alert.alert(t('common.success'), t('report.exportSuccess'));
      }
    } catch (error) {
      console.error('导出失败:', error);
      Alert.alert(t('common.error'), t('report.exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  // 显示导出选项
  const showExportOptions = () => {
    if (Platform.OS === 'web') {
      // Web 端：显示导出选项
      const choice = confirm('选择导出格式：\n\n确定 = PDF 格式（推荐）\n取消 = 分享文本');
      if (choice) {
        exportAsPDF();
      } else {
        handleShare();
      }
    } else {
      // 移动端：显示选项
      Alert.alert(
        t('report.export'),
        t('report.exportOptions'),
        [
          {
            text: 'PDF 格式',
            onPress: exportAsPDF,
          },
          {
            text: t('report.exportImage'),
            onPress: exportAsImage,
          },
          {
            text: t('report.shareText'),
            onPress: handleShare,
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]
      );
    }
  };

  // 导出为 PDF
  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      
      const { exportReportAsPDF } = await import('@/lib/PDFExportService');
      await exportReportAsPDF(reportData);
      
      if (Platform.OS === 'web') {
        // Web 端打印对话框会自动显示
      } else {
        Alert.alert(t('common.success'), 'PDF 导出成功');
      }
    } catch (error: any) {
      console.error('PDF 导出失败:', error);
      // 显示友好的错误提示，而不是让应用闪退
      const errorMessage = error?.message || t('report.exportFailed');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsExporting(false);
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
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('report.title')}</Text>
            <Text style={styles.subtitle}>DIAGNOSTIC REPORT</Text>
          </View>

          <TouchableOpacity 
            onPress={showExportOptions}
            style={styles.shareButton}
            disabled={isExporting}
          >
            <Text style={styles.shareText}>
              {isExporting ? t('report.exporting') : t('report.export')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 报告内容 - 添加 ref 用于截图 */}
        <View ref={reportRef} collapsable={false} style={styles.content}>
          {/* 核心计分板 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('report.score')}</Text>
            <ScoreCore data={reportData.score} />
          </View>

          {/* 五维能力雷达图 - 临时注释用于测试构建 */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('report.abilityAnalysis')}</Text>
            <AbilityRadar data={reportData.ability} />
          </View> */}
          
          {/* 临时替代：显示能力数据 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('report.abilityAnalysis')}</Text>
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>{t('report.abilityAnalysis')}</Text>
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
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 255, 255, 0.3)',
    backgroundColor: '#0a0a0a',
  },
  backButton: {
    padding: 8,
    minWidth: 80,
  },
  backText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: '#00ffff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#888888',
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 2,
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.6)',
    borderRadius: 6,
    minWidth: 80,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  shareText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#00ffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 1,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ffff',
  },
  card: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.25)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardSubtitle: {
    color: '#00ffff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#00ffff',
    fontSize: 13,
    fontWeight: '500',
  },
  alertBox: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#ff3333',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  alertText: {
    color: '#ff6666',
    fontSize: 14,
    lineHeight: 22,
  },
  commentText: {
    color: '#d0d0d0',
    fontSize: 14,
    lineHeight: 24,
  },
  knowledgeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingVertical: 14,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  knowledgeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  knowledgeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 22,
  },
  knowledgeDifficulty: {
    color: '#999999',
    fontSize: 14,
  },
  knowledgeStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  pathStage: {
    borderLeftWidth: 3,
    borderLeftColor: '#00ffff',
    paddingLeft: 20,
    marginBottom: 20,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stageNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stageNumberText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stageTitle: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  stageContent: {
    color: '#d0d0d0',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 22,
    paddingLeft: 50,
  },
  stageDuration: {
    color: '#999999',
    fontSize: 13,
    paddingLeft: 50,
  },
  // 临时能力列表样式
  abilityList: {
    gap: 12,
  },
  abilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  abilityLabel: {
    color: '#d0d0d0',
    fontSize: 15,
    fontWeight: '500',
  },
  abilityValue: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  footerText: {
    color: '#666666',
    fontSize: 12,
  },
  footerCopyright: {
    color: '#444444',
    fontSize: 10,
    marginTop: 6,
  },
});
