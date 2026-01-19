/**
 * 扫描终端页面
 * 
 * 功能：
 * - 检测平台类型（Web 或移动端）
 * - Web 端渲染文件上传组件
 * - 集成图像处理和 OCR 识别
 * - 显示识别进度
 * - 导航至报告页面
 */

import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ImageProcessor } from '../lib/ImageProcessor';
import { AIAnalysisService, APIError } from '../lib/AIAnalysisService';
import { AnswerExtractor } from '../lib/AnswerExtractor';
import { AnswerGrader } from '../lib/AnswerGrader';
import { StandardAnswerManager } from '../lib/StandardAnswerManager';
import { getTemplate } from '../lib/AnswerSheetTemplate';
import { StorageService } from '../lib/StorageService';
import { globalRequestQueue, RequestPriority } from '../lib/RequestQueue';

export default function ScannerTerminal() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | { uri: string; name: string } | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Web 平台的文件选择
  const handleFileSelect = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  // 移动端的文件选择
  const handleMobileFileSelect = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要访问相册的权限');
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
        });
        setError('');
      }
    } catch (err) {
      console.error('选择文件失败:', err);
      Alert.alert('错误', '选择文件失败');
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) {
      Alert.alert('错误', '请先选择一个文件');
      return;
    }

    setIsScanning(true);
    setError('');
    
    try {
      // 步骤 1: 图像处理
      setProgress('正在压缩图像...');
      setProgressPercent(10);
      
      // 根据平台处理文件
      let processedImage;
      if (Platform.OS === 'web' && selectedFile instanceof File) {
        processedImage = await ImageProcessor.processImage(selectedFile, 0.5); // 500KB
      } else if (typeof selectedFile === 'object' && 'uri' in selectedFile) {
        processedImage = await ImageProcessor.processImage(selectedFile.uri, 0.5); // 500KB
      } else {
        throw new Error('不支持的文件类型');
      }
      
      if (!processedImage.success) {
        throw new Error(processedImage.error || '图像处理失败');
      }

      console.log(`[Camera] 图像压缩完成: ${(processedImage.compressedSize! / 1024).toFixed(2)}KB`);

      // 步骤 2: OCR 识别（使用请求队列）
      setProgress('正在识别答题卡...');
      setProgressPercent(25);
      
      const ocrResult = await globalRequestQueue.enqueue(
        () => AIAnalysisService.recognizeAnswerSheet(processedImage.base64!),
        RequestPriority.HIGH
      );

      // 步骤 3: 答案提取和评分（本地处理，不调用 API）
      setProgress('正在提取答案...');
      setProgressPercent(45);
      
      const template = getTemplate('standard-50');
      
      // 构造完整的 OCRResult 对象
      const ocrResultObject = {
        success: true,
        text: ocrResult.text || '',
        regions: [],
        confidence: ocrResult.confidence || 0.95
      };
      
      const extractedAnswers = AnswerExtractor.extract(ocrResultObject, template);
      
      setProgress('正在评分...');
      setProgressPercent(55);
      
      const sampleAnswerSet = StandardAnswerManager.createSampleAnswerSet();
      const gradingResult = AnswerGrader.grade(
        extractedAnswers,
        sampleAnswerSet.answers,
        sampleAnswerSet.dimensions
      );

      // 步骤 4: AI 错误分析（使用请求队列）
      setProgress('正在分析错题...');
      setProgressPercent(70);
      
      const analysisResult = await globalRequestQueue.enqueue(
        () => AIAnalysisService.analyzeErrors(gradingResult),
        RequestPriority.NORMAL
      );

      // 步骤 5: 生成学习路径（使用请求队列）
      setProgress('正在生成学习路径...');
      setProgressPercent(85);
      
      const learningPath = await globalRequestQueue.enqueue(
        () => AIAnalysisService.generateLearningPath(analysisResult),
        RequestPriority.NORMAL
      );

      // 步骤 6: 准备报告数据
      setProgress('正在生成报告...');
      setProgressPercent(95);
      
      const reportId = `report-${Date.now()}`;
      
      // 转换维度分数为对象格式
      const dimensionScoresMap: Record<string, number> = {
        listening: 0,
        grammar: 0,
        reading: 0,
        cloze: 0,
        logic: 0,
      };
      
      // 维度名称映射（中文 -> 英文）
      const dimensionNameMap: Record<string, string> = {
        '听力': 'listening',
        '语法': 'grammar',
        '阅读': 'reading',
        '完形': 'cloze',
        '逻辑': 'logic',
      };
      
      // 填充维度分数
      for (const dimScore of gradingResult.dimensionScores) {
        const englishKey = dimensionNameMap[dimScore.dimension];
        if (englishKey && dimScore.maxScore > 0) {
          dimensionScoresMap[englishKey] = Math.round((dimScore.score / dimScore.maxScore) * 100);
        }
      }
      
      // 如果某些维度没有数据，使用默认值
      for (const key of Object.keys(dimensionScoresMap)) {
        if (dimensionScoresMap[key] === 0) {
          dimensionScoresMap[key] = 60; // 默认 60 分
        }
      }
      
      const reportData = {
        id: reportId,
        timestamp: new Date().toISOString(),
        score: {
          score: gradingResult.totalScore,
          accuracy: (gradingResult.correctCount / (gradingResult.correctCount + gradingResult.wrongCount)) * 100,
          national: 75,
          province: 78,
          city: 80,
        },
        ability: dimensionScoresMap,
        analysis: {
          surfaceIssues: analysisResult.surfaceIssues,
          rootCauses: analysisResult.rootCauses,
          aiComment: analysisResult.aiComment,
        },
        knowledge: analysisResult.knowledgeGaps.map((gap, index) => ({
          id: `k${index + 1}`,
          name: gap,
          difficulty: (Math.floor(Math.random() * 3) + 2) as 2 | 3 | 4,
          mastered: false,
          detail: `需要加强 ${gap} 相关知识`,
        })),
        path: learningPath.stages,
      };
      
      // 保存到历史记录
      await StorageService.saveReport(reportData);
      
      setProgressPercent(100);
      console.log('准备导航到报告页面:', reportId);
      
      // 导航到报告页面
      router.push({
        pathname: `/report/${reportId}`,
        params: { 
          data: JSON.stringify(reportData)
        }
      });
      
      console.log('导航命令已发送');
      
    } catch (err) {
      console.error('扫描失败:', err);
      
      let errorMessage = '扫描失败，请重试';
      
      if (err instanceof APIError) {
        switch (err.errorCode) {
          case 'TIMEOUT':
            errorMessage = '请求超时，请检查网络连接后重试';
            break;
          case 'NETWORK_ERROR':
            errorMessage = '网络错误，请检查网络连接';
            break;
          case 'OCR_ERROR':
            errorMessage = 'OCR 识别失败，请确保图像清晰';
            break;
          default:
            errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      Alert.alert('扫描失败', errorMessage);
    } finally {
      setIsScanning(false);
      setProgress('');
      setProgressPercent(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题 */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>扫描终端</Text>
        <Text style={styles.subtitle}>SCANNER TERMINAL</Text>
      </View>

      {/* 上传区域 */}
      <View style={styles.uploadArea}>
        {/* 文件选择 */}
        <TouchableOpacity 
          style={styles.uploadBox}
          onPress={Platform.OS === 'web' ? undefined : handleMobileFileSelect}
          activeOpacity={Platform.OS === 'web' ? 1 : 0.7}
        >
          <Text style={styles.uploadText}>
            {selectedFile 
              ? (typeof selectedFile === 'object' && 'name' in selectedFile 
                  ? selectedFile.name 
                  : '已选择图片')
              : '点击选择文件'}
          </Text>
          
          {Platform.OS === 'web' && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          )}
        </TouchableOpacity>

        {/* 错误提示 */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        {/* 扫描按钮 */}
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
          onPress={handleStartScan}
          disabled={isScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? '扫描中...' : '开始扫描'}
          </Text>
        </TouchableOpacity>

        {/* 扫描动画 */}
        {isScanning && (
          <View style={styles.scanningOverlay}>
            <View style={styles.progressContainer}>
              <Text style={styles.scanningText}>正在分析...</Text>
              {progress && (
                <Text style={styles.progressText}>{progress}</Text>
              )}
              <View style={styles.loadingBar}>
                <View style={[styles.loadingBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      width: '100%',
    }),
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
  uploadArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  uploadBox: {
    width: 300,
    height: 200,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  uploadText: {
    color: '#00ffff',
    fontSize: 16,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    color: '#00ffff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxWidth: 300,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#00ffff',
    fontSize: 16,
    marginTop: 12,
    letterSpacing: 1,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#00ffff',
    transition: 'width 0.3s ease',
  },
  percentText: {
    color: '#00ffff',
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
  },
});