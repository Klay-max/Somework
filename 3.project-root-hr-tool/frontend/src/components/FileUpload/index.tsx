import React, { useState } from 'react';
import { Upload, Card, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { documentApi } from '../../services/api';

const { Dragger } = Upload;

interface FileUploadProps {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await documentApi.upload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      message.success(`${file.name} uploaded successfully!`);
      
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

      return false; // Prevent default upload behavior
    } catch (error: any) {
      setUploading(false);
      setUploadProgress(0);
      
      const errorMessage = error.response?.data?.error?.message || 'Upload failed';
      message.error(errorMessage);
      
      if (onUploadError) {
        onUploadError(error);
      }
      
      return false;
    }
  };

  const beforeUpload = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    const isAllowedType = allowedTypes.includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 PDF、Word、Excel 和文本文件！');
      return Upload.LIST_IGNORE;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    const isLt50M = file.size < maxSize;
    if (!isLt50M) {
      message.error('文件大小不能超过 50MB！');
      return Upload.LIST_IGNORE;
    }

    handleUpload(file);
    return false; // Prevent default upload
  };

  return (
    <Card title="上传文档" style={{ height: '100%' }}>
      <Dragger
        name="file"
        multiple={false}
        beforeUpload={beforeUpload}
        showUploadList={false}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          点击或拖拽文件到此区域上传
        </p>
        <p className="ant-upload-hint">
          支持 PDF、Word、Excel 和文本文件（最大 50MB）
        </p>
      </Dragger>

      {uploading && uploadProgress > 0 && (
        <div style={{ marginTop: 16 }}>
          <Progress 
            percent={uploadProgress} 
            status={uploadProgress === 100 ? 'success' : 'active'}
          />
        </div>
      )}
    </Card>
  );
};

export default FileUpload;
