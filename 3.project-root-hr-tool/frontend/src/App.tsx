import React, { useState } from 'react';
import { Layout, Row, Col, Typography, message } from 'antd';
import FileUpload from './components/FileUpload';
import DocumentPreview from './components/DocumentPreview';
import IssueList from './components/IssueList';
import IssueDetail from './components/IssueDetail';
import FixPreview from './components/FixPreview';
import DownloadManager from './components/DownloadManager';
import { documentApi } from './services/api';
import { Issue } from './types/issue';
import { Document } from './types/document';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const handleUploadSuccess = async (response: any) => {
    try {
      setLoading(true);
      message.success('文件上传成功！');
      
      // Store document info
      setCurrentDocument({
        id: response.documentId,
        filename: response.filename,
        originalName: response.filename,
        mimeType: '',
        size: response.size,
        uploadedAt: new Date(),
        content: '',
        metadata: {},
        status: 'analyzing'
      });
      
      // Start analysis
      const analysisResponse = await documentApi.analyze(response.documentId);
      setAnalysisId(analysisResponse.analysisId);
      
      message.info('正在分析文档，请稍候...（这可能需要 1-2 分钟）');
      
      // Poll for analysis results
      const maxAttempts = 120; // 120 seconds max (2 minutes)
      let attempts = 0;
      
      const pollResults = async (): Promise<void> => {
        try {
          const results = await documentApi.getAnalysis(response.documentId, analysisResponse.analysisId);
          
          if (results.issues && results.issues.length > 0) {
            setIssues(results.issues);
            message.success(`文档分析完成！发现 ${results.issues.length} 个问题`);
            setLoading(false);
            return;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollResults, 1000); // Poll every second
          } else {
            message.warning('分析超时，请重试');
            setLoading(false);
          }
        } catch (error) {
          console.error('Failed to get analysis results:', error);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollResults, 1000);
          } else {
            message.error('获取分析结果失败');
            setLoading(false);
          }
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollResults, 2000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      message.error('文档分析失败');
      setLoading(false);
    }
  };

  const handleUploadError = (error: any) => {
    console.error('Upload failed:', error);
    message.error('文件上传失败');
  };

  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleApplyFix = async (issueId: string, suggestionId: string) => {
    try {
      setLoading(true);
      // Add to selected issues
      if (!selectedIssueIds.includes(issueId)) {
        setSelectedIssueIds([...selectedIssueIds, issueId]);
      }
      message.success('已添加到修复列表！');
    } catch (error) {
      console.error('Fix failed:', error);
      message.error('修复应用失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBatchFixes = async () => {
    if (!currentDocument || selectedIssueIds.length === 0) {
      message.warning('请先选择要修复的问题');
      return;
    }

    try {
      setLoading(true);
      message.info('正在应用修复...');
      
      const result = await documentApi.fix(currentDocument.id, {
        selectedIssues: selectedIssueIds,
        autoFix: true
      });
      
      // Update document with fixed version
      setCurrentDocument({
        ...currentDocument,
        id: result.fixedDocumentId,
        status: 'fixed'
      });
      
      message.success(`修复完成！已修复 ${result.fixSummary.fixedIssues} 个问题`);
      setSelectedIssueIds([]);
    } catch (error) {
      console.error('Batch fix failed:', error);
      message.error('批量修复失败');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueToggle = (issueId: string, selected: boolean) => {
    if (selected) {
      setSelectedIssueIds([...selectedIssueIds, issueId]);
    } else {
      setSelectedIssueIds(selectedIssueIds.filter(id => id !== issueId));
    }
  };

  const handleCancelFixes = () => {
    setSelectedIssueIds([]);
    message.info('已取消选择');
  };

  const handleDownload = async (format: 'original' | 'fixed') => {
    if (!currentDocument) return;
    
    try {
      setLoading(true);
      const blob = await documentApi.download(currentDocument.id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentDocument.filename}_${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载！');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('下载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={2} style={{ margin: '16px 0', color: '#1890ff' }}>
          HR 文档分析工具
        </Title>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 112px)' }}>
          {/* Left Column - Upload and Issues */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <FileUpload 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
            <IssueList 
              issues={issues}
              onIssueSelect={handleIssueSelect}
              loading={loading}
            />
          </Col>
          
          {/* Middle Column - Document Preview and Issue Detail */}
          <Col span={8}>
            <div style={{ marginBottom: 16, height: '50%' }}>
              <DocumentPreview 
                documentId={currentDocument?.id}
                content={currentDocument?.content}
                loading={loading}
              />
            </div>
            <div style={{ height: '50%' }}>
              <IssueDetail 
                issue={selectedIssue || undefined}
                onApplyFix={handleApplyFix}
                onManualEdit={(issueId) => console.log('Manual edit:', issueId)}
              />
            </div>
          </Col>
          
          {/* Right Column - Fix Preview and Download */}
          <Col span={8}>
            <div style={{ marginBottom: 16, height: '60%' }}>
              <FixPreview 
                originalText={selectedIssue?.originalText}
                fixedText={selectedIssue?.suggestion.suggestedText}
                selectedIssues={selectedIssueIds}
                onIssueToggle={handleIssueToggle}
                onApplyFixes={handleApplyBatchFixes}
                onCancel={handleCancelFixes}
                loading={loading}
              />
            </div>
            <div style={{ height: '40%' }}>
              <DownloadManager 
                documentId={currentDocument?.id}
                originalFilename={currentDocument?.filename}
                onDownload={handleDownload}
                loading={loading}
              />
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
