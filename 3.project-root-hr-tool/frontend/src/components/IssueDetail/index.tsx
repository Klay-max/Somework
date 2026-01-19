import React from 'react';
import { Card, Tag, Button, Divider, Typography } from 'antd';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface FixSuggestion {
  id: string;
  suggestedText: string;
  explanation: string;
  confidence: number;
  alternativeOptions?: string[];
  requiresManualReview: boolean;
}

interface Issue {
  id: string;
  type: 'grammar' | 'format' | 'consistency' | 'structure' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    page?: number;
    line?: number;
    column?: number;
    range?: { start: number; end: number };
  };
  originalText: string;
  context: string;
  suggestion: FixSuggestion;
  isAutoFixable: boolean;
}

interface IssueDetailProps {
  issue?: Issue;
  onApplyFix?: (issueId: string, suggestionId: string) => void;
  onManualEdit?: (issueId: string) => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ 
  issue, 
  onApplyFix, 
  onManualEdit 
}) => {
  if (!issue) {
    return (
      <Card title="问题详情" style={{ height: '100%' }}>
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          选择一个问题查看详情
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'blue';
      case 'format': return 'purple';
      case 'consistency': return 'cyan';
      case 'structure': return 'geekblue';
      case 'content': return 'magenta';
      default: return 'default';
    }
  };

  const severityText: Record<string, string> = {
    critical: '关键',
    high: '高',
    medium: '中',
    low: '低'
  };

  const typeText: Record<string, string> = {
    grammar: '语法',
    format: '格式',
    consistency: '一致性',
    structure: '结构',
    content: '内容'
  };

  return (
    <Card title="问题详情" style={{ height: '100%' }}>
      <div>
        <Title level={4}>{issue.title}</Title>
        
        <div style={{ marginBottom: 16 }}>
          <Tag color={getSeverityColor(issue.severity)}>{severityText[issue.severity]}</Tag>
          <Tag color={getTypeColor(issue.type)}>{typeText[issue.type]}</Tag>
          {issue.isAutoFixable && <Tag color="green">可自动修复</Tag>}
        </div>

        <Paragraph>{issue.description}</Paragraph>

        <Divider />

        <Title level={5}>位置</Title>
        <Text>
          {issue.location.page && `第 ${issue.location.page} 页`}
          {issue.location.line && `，第 ${issue.location.line} 行`}
          {issue.location.column && `，第 ${issue.location.column} 列`}
        </Text>

        <Divider />

        <Title level={5}>原始文本</Title>
        <div style={{ 
          background: '#fff2f0', 
          border: '1px solid #ffccc7', 
          padding: '8px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <Text code>{issue.originalText}</Text>
        </div>

        <Title level={5}>上下文</Title>
        <Paragraph style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          padding: '8px', 
          borderRadius: '4px' 
        }}>
          {issue.context}
        </Paragraph>

        <Divider />

        <Title level={5}>修复建议</Title>
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #91d5ff', 
          padding: '12px', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <Text strong>建议文本：</Text>
          <div style={{ marginTop: '8px' }}>
            <Text code>{issue.suggestion.suggestedText}</Text>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <Text strong>说明：</Text>
            <Paragraph style={{ marginTop: '4px' }}>
              {issue.suggestion.explanation}
            </Paragraph>
          </div>

          <div style={{ marginTop: '8px' }}>
            <Text>置信度：{Math.round(issue.suggestion.confidence * 100)}%</Text>
          </div>

          {issue.suggestion.requiresManualReview && (
            <div style={{ marginTop: '8px' }}>
              <Tag color="orange">需要人工审核</Tag>
            </div>
          )}
        </div>

        {issue.suggestion.alternativeOptions && issue.suggestion.alternativeOptions.length > 0 && (
          <>
            <Title level={5}>其他选项</Title>
            {issue.suggestion.alternativeOptions.map((option, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <Text code>{option}</Text>
              </div>
            ))}
          </>
        )}

        <Divider />

        <div style={{ display: 'flex', gap: '8px' }}>
          {issue.isAutoFixable && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onApplyFix?.(issue.id, issue.suggestion.id)}
            >
              应用修复
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => onManualEdit?.(issue.id)}
          >
            手动编辑
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default IssueDetail;