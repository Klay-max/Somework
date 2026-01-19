import React from 'react';
import { Card, Button, Select, Progress, Typography, Divider } from 'antd';
import { DownloadOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

interface DownloadManagerProps {
  documentId?: string;
  originalFilename?: string;
  availableFormats?: ('original' | 'fixed')[];
  downloadProgress?: number;
  onDownload?: (format: 'original' | 'fixed') => void;
  loading?: boolean;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({
  documentId,
  originalFilename,
  availableFormats = ['original', 'fixed'],
  downloadProgress,
  onDownload,
  loading = false
}) => {
  const [selectedFormat, setSelectedFormat] = React.useState<'original' | 'fixed'>('fixed');

  const handleDownload = () => {
    if (onDownload) {
      onDownload(selectedFormat);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'original':
        return <FileTextOutlined />;
      case 'fixed':
        return <FilePdfOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'original':
        return '原始文档';
      case 'fixed':
        return '修复后文档';
      default:
        return format;
    }
  };

  return (
    <Card title="下载管理" style={{ height: '100%' }}>
      {documentId ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>文档信息</Title>
            <Text>文件名：{originalFilename || '未知'}</Text>
            <br />
            <Text>文档 ID：{documentId}</Text>
          </div>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Title level={5}>下载选项</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Text>格式：</Text>
              <Select
                value={selectedFormat}
                onChange={setSelectedFormat}
                style={{ width: 200 }}
              >
                {availableFormats.map(format => (
                  <Option key={format} value={format}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getFormatIcon(format)}
                      {getFormatLabel(format)}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              loading={loading}
              size="large"
            >
              下载{getFormatLabel(selectedFormat)}
            </Button>
          </div>

          {downloadProgress !== undefined && downloadProgress > 0 && (
            <div style={{ marginTop: 16 }}>
              <Title level={5}>下载进度</Title>
              <Progress 
                percent={downloadProgress} 
                status={downloadProgress === 100 ? 'success' : 'active'}
              />
            </div>
          )}

          <Divider />

          <div>
            <Title level={5}>可用下载</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {availableFormats.map(format => (
                <div key={format} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getFormatIcon(format)}
                    <Text>{getFormatLabel(format)}</Text>
                  </span>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload?.(format)}
                    loading={loading && selectedFormat === format}
                  >
                    下载
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          暂无可下载的文档
        </div>
      )}
    </Card>
  );
};

export default DownloadManager;