// 创建最小的有效 PNG 文件
const fs = require('fs');
const path = require('path');

// 1x1 透明 PNG 的 base64 数据
const transparentPNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// 创建 assets 目录（如果不存在）
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// 创建所有需要的 PNG 文件
const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  const buffer = Buffer.from(transparentPNG, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${file}`);
});

console.log('All asset files created successfully!');
