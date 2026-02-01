/**
 * 批量上传组件
 * 
 * 功能：
 * - 支持多文件选择（最多 50 张）
 * - 显示上传进度
 * - 文件预览和管理
 * - 批量处理控制
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Image, Alert } from 'react-native';
import { X, Upload, FileImage } from 'lucide-react-native';
import { t } from '../../lib/i18n';

interface UploadedFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface BatchUploaderProps {
  onFilesSelected: (files: File[] | { uri: string; name: string }[]) => void;
  onStartBatch?: () => void;
  maxFiles?: number;
}

export default function BatchUploader({ 
  onFilesSelected, 
  onStartBatch,
  maxFiles = 50 
}: BatchUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Web 平台的文件选择
  const handleFileSelect = (event: any) => {
    const files = Array.from(event.target.files || []) as File[];
    
    if (files.length === 0) return;
    
    // 检查文件数量限制
    if (uploadedFiles.length + files.length > maxFiles) {
      Alert.alert(t('batch.maxFilesExceeded'), t('batch.maxFilesMessage', { max: maxFiles }));
      return;
    }
    
    // 验证文件类型
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      Alert.alert(t('batch.invalidFileType'), t('batch.invalidFileTypeMessage'));
    }
    
    // 添加到上传列表
    const newFiles: UploadedFile[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      uri: URL.createObjectURL(file),
      size: file.size,
      status: 'pending',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    onFilesSelected(validFiles);
  };

  // 移除文件
  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // 清空所有文件
  const handleClearAll = () => {
    Alert.alert(
      t('batch.confirmClear'),
      t('batch.confirmClearMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: () => setUploadedFiles([]),
          style: 'destructive'
        }
      ]
    );
  };

  // 开始批量处理
  const handleStartBatch = () => {
    if (uploadedFiles.length === 0) {
      Alert.alert(t('common.error'), t('batch.noFiles'));
      return;
    }
    
    onStartBatch?.();
  };

  return (
    <View style={styles.container}>
      {/* 上传区域 */}
      <TouchableOpacity 
        style={styles.uploadBox}
        activeOpacity={Platform.OS === 'web' ? 1 : 0.7}
      >
        <Upload color="#00ffff" size={48} />
        <Text style={styles.uploadTitle}>批量上传答题卡</Text>
        <Text style={styles.uploadSubtitle}>
          支持一次上传最多 {maxFiles} 张图片
        </Text>
        <Text style={styles.uploadHint}>
          点击选择文件或拖拽到此处
        </Text>
        
        {Platform.OS === 'web' && (
          <input
            type="file"
            accept="image/*"
            multiple
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

      {/* 文件列表 */}
      {uploadedFiles.length > 0 && (
        <View style={styles.fileListContainer}>
          <View style={styles.fileListHeader}>
            <Text style={styles.fileListTitle}>
              已选择 {uploadedFiles.length} / {maxFiles} 个文件
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearButton}>清空</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.fileList}
            showsVerticalScrollIndicator={false}
          >
            {uploadedFiles.map((file) => (
              <View key={file.id} style={styles.fileItem}>
                {/* 文件预览 */}
                <View style={styles.filePreview}>
                  {file.uri ? (
                    <Image 
                      source={{ uri: file.uri }} 
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <FileImage color="#00ffff" size={32} />
                  )}
                </View>

                {/* 文件信息 */}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(2)} KB
                  </Text>
                  
                  {/* 状态指示 */}
                  {file.status === 'processing' && (
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${file.progress || 0}%` }
                        ]} 
                      />
                    </View>
                  )}
                  
                  {file.status === 'error' && (
                    <Text style={styles.errorText}>{file.error}</Text>
                  )}
                </View>

                {/* 删除按钮 */}
                <TouchableOpacity 
                  onPress={() => handleRemoveFile(file.id)}
                  style={styles.removeButton}
                >
                  <X color="#ff0000" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* 开始处理按钮 */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartBatch}
          >
            <Text style={styles.startButtonText}>
              开始批量处理 ({uploadedFiles.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  uploadBox: {
    height: 200,
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  uploadTitle: {
    color: '#00ffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: 1,
  },
  uploadSubtitle: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
  },
  uploadHint: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  fileListContainer: {
    marginTop: 24,
    flex: 1,
  },
  fileListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileListTitle: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#ff0000',
    fontSize: 14,
  },
  fileList: {
    flex: 1,
    maxHeight: 400,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  filePreview: {
    width: 60,
    height: 60,
    backgroundColor: '#222222',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  fileSize: {
    color: '#888888',
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffff',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  startButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
