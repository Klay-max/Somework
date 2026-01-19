import React from 'react';
import { Card, Spin, Empty, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface DocumentPreviewProps {
  documentId?: string;
  content?: string;
  loading?: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  documentId, 
  content, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card title="文档预览" style={{ height: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px' 
        }}>
          <Spin size="large" tip="加载文档中..." />
        </div>
      </Card>
    );
  }

  if (!documentId || !content) {
    return (
      <Card title="文档预览" style={{ height: '100%' }}>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
          description="未加载文档"
          style={{ padding: '60px 0' }}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="文档预览" 
      style={{ height: '100%', overflow: 'hidden' }}
    >
      <div style={{ 
        height: 'calc(100% - 60px)', 
        overflow: 'auto',
        padding: '16px',
        backgroundColor: '#fafafa',
        border: '1px solid #d9d9d9',
        borderRadius: '4px'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          minHeight: '100%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Paragraph style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            fontSize: '14px',
            lineHeight: '1.8',
            margin: 0
          }}>
            {content}
          </Paragraph>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        textAlign: 'right',
        fontSize: '12px',
        color: '#999'
      }}>
        <Text type="secondary">
          文档 ID：{documentId}
        </Text>
      </div>
    </Card>
  );
};

export default DocumentPreview;
