/**
 * 生成教育风格的应用图标
 * 设计理念：书本 + AI 智能元素
 * 配色：清新的蓝色和橙色渐变
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建教育风格图标
function createEducationIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景渐变（清新蓝色到天蓝色）
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4A90E2');    // 清新蓝
  gradient.addColorStop(1, '#67B8F7');    // 天蓝色
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 绘制书本图标
  const bookWidth = size * 0.5;
  const bookHeight = size * 0.4;
  const bookX = (size - bookWidth) / 2;
  const bookY = size * 0.35;

  // 书本底部（白色）
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bookX, bookY, bookWidth, bookHeight);

  // 书本中线
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(size / 2, bookY);
  ctx.lineTo(size / 2, bookY + bookHeight);
  ctx.stroke();

  // 书本页面线条
  const lineSpacing = bookHeight / 5;
  ctx.strokeStyle = '#F0F0F0';
  ctx.lineWidth = size * 0.01;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(bookX + size * 0.05, bookY + lineSpacing * i);
    ctx.lineTo(bookX + bookWidth - size * 0.05, bookY + lineSpacing * i);
    ctx.stroke();
  }

  // AI 智能标记（橙色圆形 + 星星）
  const aiSize = size * 0.25;
  const aiX = size * 0.7;
  const aiY = size * 0.3;

  // 橙色圆形背景
  ctx.fillStyle = '#FF9500';
  ctx.beginPath();
  ctx.arc(aiX, aiY, aiSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // 白色星星
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${aiSize * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', aiX, aiY);

  // 保存图标
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✓ 已生成: ${filename} (${size}x${size})`);
}

// 生成所有尺寸的图标
const assetsDir = path.join(__dirname, 'assets');

console.log('开始生成教育风格图标...\n');

// 主图标 (1024x1024)
createEducationIcon(1024, path.join(assetsDir, 'icon.png'));

// 自适应图标 (1024x1024)
createEducationIcon(1024, path.join(assetsDir, 'adaptive-icon.png'));

// Favicon (48x48)
createEducationIcon(48, path.join(assetsDir, 'favicon.png'));

// 启动画面 (1284x2778 - 简化版)
const splashCanvas = createCanvas(1284, 2778);
const splashCtx = splashCanvas.getContext('2d');

// 背景渐变
const splashGradient = splashCtx.createLinearGradient(0, 0, 0, 2778);
splashGradient.addColorStop(0, '#4A90E2');
splashGradient.addColorStop(1, '#67B8F7');
splashCtx.fillStyle = splashGradient;
splashCtx.fillRect(0, 0, 1284, 2778);

// 中央图标
const iconSize = 400;
const iconX = (1284 - iconSize) / 2;
const iconY = (2778 - iconSize) / 2 - 200;

// 书本
const bookW = iconSize * 0.5;
const bookH = iconSize * 0.4;
const bookPosX = iconX + (iconSize - bookW) / 2;
const bookPosY = iconY + iconSize * 0.35;

splashCtx.fillStyle = '#FFFFFF';
splashCtx.fillRect(bookPosX, bookPosY, bookW, bookH);

// AI 标记
const aiSizeS = iconSize * 0.25;
const aiXS = iconX + iconSize * 0.7;
const aiYS = iconY + iconSize * 0.3;

splashCtx.fillStyle = '#FF9500';
splashCtx.beginPath();
splashCtx.arc(aiXS, aiYS, aiSizeS / 2, 0, Math.PI * 2);
splashCtx.fill();

splashCtx.fillStyle = '#FFFFFF';
splashCtx.font = 'bold 80px Arial';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('AI', aiXS, aiYS);

// 应用名称
splashCtx.fillStyle = '#FFFFFF';
splashCtx.font = 'bold 80px Arial';
splashCtx.textAlign = 'center';
splashCtx.fillText('安辅导', 642, iconY + iconSize + 100);

splashCtx.font = '40px Arial';
splashCtx.fillText('AI 智能作业批改助手', 642, iconY + iconSize + 180);

const splashBuffer = splashCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuffer);
console.log(`✓ 已生成: splash.png (1284x2778)`);

console.log('\n✅ 所有图标生成完成！');
console.log('\n提示：运行以下命令安装 canvas 依赖：');
console.log('npm install canvas');
