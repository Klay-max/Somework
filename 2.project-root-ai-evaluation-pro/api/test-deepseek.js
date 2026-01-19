/**
 * DeepSeek API 测试脚本
 * 
 * 使用方法：
 * 1. 配置 .env 文件中的 DEEPSEEK_API_KEY
 * 2. 启动测试服务器: node api/test-server.js
 * 3. 运行测试: node api/test-deepseek.js
 */

const axios = require('axios');

// 模拟评分结果
const mockGradeResult = {
  totalScore: 75,
  maxScore: 100,
  accuracy: 75,
  correctCount: 15,
  wrongCount: 5,
  wrongAnswers: [
    {
      questionId: '3',
      userAnswer: 'B',
      correctAnswer: 'C',
      knowledgePoints: ['虚拟语气', '条件句'],
    },
    {
      questionId: '7',
      userAnswer: 'A',
      correctAnswer: 'D',
      knowledgePoints: ['时态', '完成时'],
    },
    {
      questionId: '12',
      userAnswer: 'C',
      correctAnswer: 'A',
      knowledgePoints: ['词汇', '同义词辨析'],
    },
    {
      questionId: '15',
      userAnswer: 'D',
      correctAnswer: 'B',
      knowledgePoints: ['阅读理解', '推理判断'],
    },
    {
      questionId: '18',
      userAnswer: 'B',
      correctAnswer: 'C',
      knowledgePoints: ['语法', '从句'],
    },
  ],
  dimensionScores: [
    { dimension: '听力', score: 18, maxScore: 20 },
    { dimension: '语法', score: 12, maxScore: 20 },
    { dimension: '阅读', score: 15, maxScore: 20 },
    { dimension: '完形', score: 16, maxScore: 20 },
    { dimension: '逻辑', score: 14, maxScore: 20 },
  ],
};

// 测试错误分析 API
async function testAnalyze() {
  console.log('📊 测试错误分析 API...\n');
  
  try {
    const response = await axios.post('http://localhost:3000/api/analyze', {
      gradeResult: mockGradeResult,
      language: 'zh',
    }, {
      timeout: 30000, // 30 秒超时
    });
    
    console.log('✅ 错误分析成功！\n');
    console.log('─────────────────────────────────────');
    
    const { data } = response.data;
    
    console.log('📌 表层问题:');
    data.surfaceIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    
    console.log('\n🔍 深层原因:');
    data.rootCauses.forEach((cause, i) => {
      console.log(`  ${i + 1}. ${cause}`);
    });
    
    console.log('\n💬 AI 点评:');
    console.log(`  ${data.aiComment}`);
    
    console.log('\n📚 知识点缺口:');
    data.knowledgeGaps.forEach((gap, i) => {
      console.log(`  ${i + 1}. ${gap.knowledgePoint} (难度: ${gap.difficulty}/5, 掌握: ${gap.mastered ? '是' : '否'})`);
      console.log(`     ${gap.detail}`);
    });
    
    console.log('\n─────────────────────────────────────');
    
    return data;
  } catch (error) {
    console.error('\n❌ 错误分析失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('网络错误: 无法连接到服务器');
      console.error('请确保测试服务器正在运行: node api/test-server.js');
    } else {
      console.error('错误:', error.message);
    }
    
    throw error;
  }
}

// 测试学习路径生成 API
async function testGeneratePath(errorAnalysis) {
  console.log('\n\n🎯 测试学习路径生成 API...\n');
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate-path', {
      errorAnalysis,
      language: 'zh',
    }, {
      timeout: 30000, // 30 秒超时
    });
    
    console.log('✅ 学习路径生成成功！\n');
    console.log('─────────────────────────────────────');
    
    const { data } = response.data;
    
    console.log(`📅 学习阶段数量: ${data.stages.length}\n`);
    
    data.stages.forEach((stage, i) => {
      console.log(`阶段 ${stage.id}: ${stage.title} (${stage.duration})`);
      console.log('学习内容:');
      stage.content.forEach((item, j) => {
        console.log(`  ${j + 1}. ${item}`);
      });
      if (stage.videoLinks && stage.videoLinks.length > 0) {
        console.log('视频资源:');
        stage.videoLinks.forEach((link, j) => {
          console.log(`  ${j + 1}. ${link}`);
        });
      }
      console.log('');
    });
    
    console.log('─────────────────────────────────────');
    
    return data;
  } catch (error) {
    console.error('\n❌ 学习路径生成失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('网络错误: 无法连接到服务器');
    } else {
      console.error('错误:', error.message);
    }
    
    throw error;
  }
}

// 运行测试
async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('   DeepSeek API 完整流程测试');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // 测试错误分析
    const errorAnalysis = await testAnalyze();
    
    // 测试学习路径生成
    await testGeneratePath(errorAnalysis);
    
    console.log('\n✨ 所有测试通过！');
    console.log('\n💡 提示:');
    console.log('  - 如果看到模拟数据，说明 DeepSeek API 密钥未配置');
    console.log('  - 配置 .env 文件中的 DEEPSEEK_API_KEY 以使用真实 AI 分析');
    console.log('  - 真实 API 调用需要 15-30 秒，请耐心等待');
    
  } catch (error) {
    console.error('\n💥 测试失败');
    process.exit(1);
  }
}

runTests();
