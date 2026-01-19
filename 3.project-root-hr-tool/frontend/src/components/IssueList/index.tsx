import React, { useState } from 'react';
import { List, Card, Tag, Input, Select, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Issue } from '../../types/issue';

const { Search } = Input;
const { Option } = Select;

interface IssueListProps {
  issues: Issue[];
  onIssueSelect?: (issue: Issue) => void;
  loading?: boolean;
}

const IssueList: React.FC<IssueListProps> = ({ 
  issues, 
  onIssueSelect, 
  loading = false 
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || issue.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <Card title="发现的问题" style={{ height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索问题..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 120 }}
            placeholder="类型"
          >
            <Option value="all">所有类型</Option>
            <Option value="grammar">语法</Option>
            <Option value="format">格式</Option>
            <Option value="consistency">一致性</Option>
            <Option value="structure">结构</Option>
            <Option value="content">内容</Option>
          </Select>
          <Select
            value={filterSeverity}
            onChange={setFilterSeverity}
            style={{ width: 120 }}
            placeholder="严重程度"
          >
            <Option value="all">所有级别</Option>
            <Option value="critical">关键</Option>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="low">低</Option>
          </Select>
        </div>
      </div>
      
      <List
        loading={loading}
        dataSource={filteredIssues}
        renderItem={(issue) => (
          <List.Item
            onClick={() => onIssueSelect?.(issue)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              title={
                <div>
                  <Badge count={issue.severity} color={getSeverityColor(issue.severity)} />
                  <span style={{ marginLeft: 8 }}>{issue.title}</span>
                  <Tag color={getTypeColor(issue.type)} style={{ marginLeft: 8 }}>
                    {issue.type}
                  </Tag>
                </div>
              }
              description={
                <div>
                  <div>{issue.description}</div>
                  {issue.location.page && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                      第 {issue.location.page} 页
                      {issue.location.line && `，第 ${issue.location.line} 行`}
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default IssueList;