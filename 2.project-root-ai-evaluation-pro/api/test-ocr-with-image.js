/**
 * OCR API 测试脚本（使用真实图像）
 * 
 * 使用方法：
 * 1. 将图像文件放在 api 目录下，命名为 test-image.jpg 或 test-image.png
 * 2. 配置 .env 文件中的阿里云凭证
 * 3. 运行: node api/test-ocr-with-image.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 读取图像文件并转换为 Base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('❌ 读取图像失败:', error.message);
    return null;
  }
}

// 测试 OCR API
async function testOCR() {
  console.log('🚀 开始测试 OCR API...\n');

  // 查找测试图像
  const possibleImages = [
    'test-image.jpg',
    'test-image.png',
    'test-image.jpeg',
    'answer-sheet.jpg',
    'answer-sheet.png',
  ];

  let imagePath = null;
  for (const filename of possibleImages) {
    const fullPath = path.join(__dirname, filename);
    if (fs.existsSync(fullPath)) {
      imagePath = fullPath;
      break;
    }
  }

  if (!imagePath) {
    console.log('❌ 未找到测试图像文件');
    console.log('📝 请将图像文件放在 api 目录下，命名为以下之一：');
    possibleImages.forEach(name => console.log(`   - ${name}`));
    console.log('\n💡 提示：可以使用答题卡图像进行测试');
    return;
  }

  console.log(`📷 找到测试图像: ${path.basename(imagePath)}`);

  // 转换为 Base64
  console.log('🔄 转换图像为 Base64...');
  const imageBase64 = imageToBase64(imagePath);
  
  if (!imageBase64) {
    return;
  }

  const imageSizeKB = Math.round(imageBase64.length * 0.75 / 1024);
  console.log(`📊 图像大小: ${imageSizeKB} KB`);

  if (imageSizeKB > 4096) {
    console.log('⚠️  警告: 图像超过 4MB，可能会被阿里云 OCR 拒绝');
    console.log('💡 建议: 使用图像压缩工具减小文件大小');
  }

  // 发送请求
  console.log('\n📤 发送 OCR 请求...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/ocr', {
      imageBase64: imageBase64,
    }, {
      timeout: 30000, // 30 秒超时
    });

    console.log('\n✅ OCR 识别成功！\n');
    console.log('📊 识别结果:');
    console.log('─────────────────────────────────────');
    
    const { data } = response.data;
    
    console.log(`置信度: ${(data.confidence * 100).toFixed(2)}%`);
    console.log(`\n识别文本:\n${data.rawText || '(无文本)'}`);
    
    if (data.regions && data.regions.length > 0) {
      console.log(`\n文本区域数量: ${data.regions.length}`);
      console.log('\n前 5 个文本区域:');
      data.regions.slice(0, 5).forEach((region, index) => {
        console.log(`  ${index + 1}. "${region.text}" (置信度: ${(region.confidence * 100).toFixed(2)}%)`);
      });
      
      if (data.regions.length > 5) {
        console.log(`  ... 还有 ${data.regions.length - 5} 个区域`);
      }
    }
    
    console.log('\n─────────────────────────────────────');
    
    // 保存完整结果到文件
    const resultPath = path.join(__dirname, 'ocr-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(response.data, null, 2));
    console.log(`\n💾 完整结果已保存到: ${resultPath}`);
    
  } catch (error) {
    console.error('\n❌ OCR 请求失败:');
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      console.error('网络错误: 无法连接到服务器');
      console.error('请确保测试服务器正在运行: node api/test-server.js');
    } else {
      console.error('错误:', error.message);
    }
  }
}

// 运行测试
console.log('═══════════════════════════════════════');
console.log('   阿里云 OCR API 测试（真实图像）');
console.log('═══════════════════════════════════════\n');

testOCR().then(() => {
  console.log('\n✨ 测试完成！');
}).catch(error => {
  console.error('\n💥 测试失败:', error.message);
  process.exit(1);
});
