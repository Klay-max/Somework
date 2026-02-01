/**
 * PDF 导出服务
 * 将报告数据导出为 PDF 格式
 */

import { Platform } from 'react-native';
import type { ReportData } from './types';

/**
 * 生成 PDF HTML 内容
 */
function generatePDFHTML(report: ReportData): string {
  const { score, ability, analysis, knowledge, path } = report;
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>学习诊断报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
      background: #000;
      color: #00ff00;
      padding: 40px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #00ffff;
      padding-bottom: 20px;
    }
    
    .title {
      font-size: 32px;
      color: #00ffff;
      margin-bottom: 10px;
      text-shadow: 0 0 10px #00ffff;
    }
    
    .subtitle {
      font-size: 14px;
      color: #00ff00;
      opacity: 0.8;
    }
    
    .section {
      margin-bottom: 30px;
      background: #111;
      border: 1px solid #00ff00;
      border-radius: 8px;
      padding: 20px;
    }
    
    .section-title {
      font-size: 20px;
      color: #00ffff;
      margin-bottom: 15px;
      border-left: 4px solid #00ffff;
      padding-left: 10px;
    }
    
    .score-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .score-item {
      background: #000;
      border: 1px solid #00ff00;
      border-radius: 4px;
      padding: 15px;
      text-align: center;
    }
    
    .score-label {
      font-size: 12px;
      color: #00ff00;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    
    .score-value {
      font-size: 24px;
      color: #00ffff;
      font-weight: bold;
    }
    
    .ability-list {
      margin-top: 15px;
    }
    
    .ability-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #333;
    }
    
    .ability-item:last-child {
      border-bottom: none;
    }
    
    .ability-label {
      font-size: 14px;
      color: #00ff00;
    }
    
    .ability-bar {
      flex: 1;
      height: 8px;
      background: #222;
      border-radius: 4px;
      margin: 0 15px;
      position: relative;
      overflow: hidden;
    }
    
    .ability-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff00, #00ffff);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .ability-value {
      font-size: 14px;
      color: #00ffff;
      font-weight: bold;
      min-width: 45px;
      text-align: right;
    }
    
    .analysis-text {
      font-size: 14px;
      color: #00ff00;
      line-height: 1.8;
      margin-top: 10px;
    }
    
    .list {
      margin-top: 10px;
      padding-left: 20px;
    }
    
    .list-item {
      font-size: 14px;
      color: #00ff00;
      margin-bottom: 8px;
      position: relative;
    }
    
    .list-item:before {
      content: '▸';
      color: #00ffff;
      position: absolute;
      left: -15px;
    }
    
    .path-stage {
      background: #000;
      border: 1px solid #00ffff;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .stage-title {
      font-size: 16px;
      color: #00ffff;
      font-weight: bold;
    }
    
    .stage-duration {
      font-size: 12px;
      color: #00ff00;
      background: #111;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .stage-content {
      font-size: 14px;
      color: #00ff00;
      line-height: 1.8;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      font-size: 12px;
      color: #00ff00;
      opacity: 0.6;
    }
    
    @media print {
      body {
        background: #fff;
        color: #000;
      }
      
      .title, .section-title, .stage-title, .score-value, .ability-value {
        color: #000;
        text-shadow: none;
      }
      
      .section, .score-item, .path-stage {
        border-color: #000;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 报告头部 -->
    <div class="header">
      <h1 class="title">📊 学习诊断报告</h1>
      <p class="subtitle">生成时间：${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
    </div>
    
    <!-- 核心计分板 -->
    <div class="section">
      <h2 class="section-title">核心计分板</h2>
      <div class="score-grid">
        <div class="score-item">
          <div class="score-label">总分</div>
          <div class="score-value">${score.score}</div>
        </div>
        <div class="score-item">
          <div class="score-label">正确率</div>
          <div class="score-value">${score.accuracy}%</div>
        </div>
        <div class="score-item">
          <div class="score-label">正确题数</div>
          <div class="score-value">${score.correct}/${score.total}</div>
        </div>
        <div class="score-item">
          <div class="score-label">错误题数</div>
          <div class="score-value">${score.wrong}</div>
        </div>
      </div>
    </div>
    
    <!-- 五维能力分析 -->
    <div class="section">
      <h2 class="section-title">五维能力分析</h2>
      <div class="ability-list">
        <div class="ability-item">
          <span class="ability-label">听力理解</span>
          <div class="ability-bar">
            <div class="ability-fill" style="width: ${ability.listening}%"></div>
          </div>
          <span class="ability-value">${ability.listening}%</span>
        </div>
        <div class="ability-item">
          <span class="ability-label">语法运用</span>
          <div class="ability-bar">
            <div class="ability-fill" style="width: ${ability.grammar}%"></div>
          </div>
          <span class="ability-value">${ability.grammar}%</span>
        </div>
        <div class="ability-item">
          <span class="ability-label">阅读理解</span>
          <div class="ability-bar">
            <div class="ability-fill" style="width: ${ability.reading}%"></div>
          </div>
          <span class="ability-value">${ability.reading}%</span>
        </div>
        <div class="ability-item">
          <span class="ability-label">完形填空</span>
          <div class="ability-bar">
            <div class="ability-fill" style="width: ${ability.cloze}%"></div>
          </div>
          <span class="ability-value">${ability.cloze}%</span>
        </div>
        <div class="ability-item">
          <span class="ability-label">逻辑推理</span>
          <div class="ability-bar">
            <div class="ability-fill" style="width: ${ability.logic}%</div>
          </div>
          <span class="ability-value">${ability.logic}%</span>
        </div>
      </div>
    </div>
    
    <!-- 深度分析 -->
    <div class="section">
      <h2 class="section-title">深度分析</h2>
      
      <h3 style="color: #00ffff; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">表面问题</h3>
      <div class="list">
        ${analysis.surfaceIssues.map(issue => `<div class="list-item">${issue}</div>`).join('')}
      </div>
      
      <h3 style="color: #00ffff; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">根本原因</h3>
      <div class="list">
        ${analysis.rootCauses.map(cause => `<div class="list-item">${cause}</div>`).join('')}
      </div>
      
      <h3 style="color: #00ffff; font-size: 16px; margin-top: 15px; margin-bottom: 10px;">AI 综合评价</h3>
      <div class="analysis-text">${analysis.aiComment}</div>
    </div>
    
    <!-- 知识矩阵 -->
    <div class="section">
      <h2 class="section-title">知识薄弱点</h2>
      <div class="list">
        ${knowledge.weakPoints.map(point => `<div class="list-item">${point}</div>`).join('')}
      </div>
    </div>
    
    <!-- 升级路径 -->
    <div class="section">
      <h2 class="section-title">个性化学习路径</h2>
      ${path.map((stage, index) => `
        <div class="path-stage">
          <div class="stage-header">
            <span class="stage-title">${stage.title}</span>
            <span class="stage-duration">${stage.duration}</span>
          </div>
          <div class="stage-content">${Array.isArray(stage.content) ? stage.content.join('；') : stage.content}</div>
        </div>
      `).join('')}
    </div>
    
    <!-- 页脚 -->
    <div class="footer">
      <p>本报告由 AI 智能分析生成 | 报告 ID: ${report.id}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Web 端：使用浏览器打印功能生成 PDF
 */
async function exportPDFWeb(report: ReportData): Promise<void> {
  const html = generatePDFHTML(report);
  
  // 创建新窗口
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
  }
  
  // 写入 HTML
  printWindow.document.write(html);
  printWindow.document.close();
  
  // 等待内容加载
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 触发打印
  printWindow.print();
}

/**
 * 导出报告为 PDF
 */
export async function exportReportAsPDF(report: ReportData): Promise<void> {
  if (Platform.OS === 'web') {
    await exportPDFWeb(report);
  } else {
    // 移动端：使用 react-native-html-to-pdf
    throw new Error('移动端 PDF 导出功能开发中');
  }
}

/**
 * 下载 PDF 文件（Web 端）
 */
export async function downloadPDFWeb(report: ReportData): Promise<void> {
  const html = generatePDFHTML(report);
  
  // 创建 Blob
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const link = document.createElement('a');
  link.href = url;
  link.download = `学习诊断报告_${report.id}_${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 释放 URL
  URL.revokeObjectURL(url);
}
