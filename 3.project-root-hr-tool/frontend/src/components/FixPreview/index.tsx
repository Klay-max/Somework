import React from 'react';
import { Card, Button, Divider, Typography, Progress } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface FixSummary {
  totalIssues: number;
  fixedIssues: number;
  skippedIssues: number;
  manualReviewRequired: number;
  fixedByType: Record<string, number>;
  processingTime: number;
  confidence: number;
}

interface FixPreviewProps {
  originalText?: string;
  fixedText?: string;
  selectedIssues?: string[];
  onIssueToggle?: (issueId: string, selected: boolean) => void;
  onApplyFixes?: () => void;
  onCancel?: () => void;
  fixSummary?: FixSummary;
  loading?: boolean;
}

const FixPreview: React.FC<FixPreviewProps> = ({
  originalText,
  fixedText,
  selectedIssues = [],
  onIssueToggle,
  onApplyFixes,
  onCancel,
  fixSummary,
  loading = false
}) => {
  return (
    <Card title="修复预览" style={{ height: '100%' }}>
      {fixSummary && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>修复摘要</Title>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <Text>总问题数：{fixSummary.totalIssues}</Text>
            <Text>已修复：{fixSummary.fixedIssues}</Text>
            <Text>已跳过：{fixSummary.skippedIssues}</Text>
            <Text>需人工审核：{fixSummary.manualReviewRequired}</Text>
          </div>
          <Progress 
            percent={Math.round((fixSummary.fixedIssues / fixSummary.totalIssues) * 100)}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div style={{ marginTop: 8 }}>
            <Text>总体置信度：{Math.round(fixSummary.confidence * 100)}%</Text>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: '400px', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Title level={5}>原始文本</Title>
          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '12px',
            height: '350px',
            overflow: 'auto',
            backgroundColor: '#fff2f0'
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              margin: 0,
              fontFamily: 'monospace'
            }}>
              {originalText || '暂无原始文本'}
            </pre>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Title level={5}>修复后</Title>
          <div style={{
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            padding: '12px',
            height: '350px',
            overflow: 'auto',
            backgroundColor: '#f6ffed'
          }}>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              margin: 0,
              fontFamily: 'monospace'
            }}>
              {fixedText || '暂无修复文本'}
            </pre>
          </div>
        </div>
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text>已选问题：{selectedIssues.length}</Text>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            onClick={onCancel}
            icon={<CloseOutlined />}
          >
            取消
          </Button>
          <Button 
            type="primary"
            onClick={onApplyFixes}
            icon={<CheckOutlined />}
            loading={loading}
            disabled={selectedIssues.length === 0}
          >
            应用选中的修复
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FixPreview;