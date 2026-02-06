const fs = require('fs');
const path = require('path');

// 源图标文件
const sourceIcon = 'logo.png';

// Android 图标尺寸映射
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

// 目标文件列表
const targetFiles = [
  'ic_launcher.png',
  'ic_launcher_round.png',
  'ic_launcher_foreground.png'
];

console.log('🔄 开始更新 Android 图标...\n');

// 检查源文件是否存在
if (!fs.existsSync(sourceIcon)) {
  console.error(`❌ 错误：找不到源图标文件 ${sourceIcon}`);
  process.exit(1);
}

// 复制图标到所有 mipmap 文件夹
let successCount = 0;
let errorCount = 0;

Object.keys(iconSizes).forEach(folder => {
  const folderPath = path.join('android', 'app', 'src', 'main', 'res', folder);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  文件夹不存在，跳过: ${folderPath}`);
    return;
  }

  targetFiles.forEach(targetFile => {
    const targetPath = path.join(folderPath, targetFile);
    
    try {
      fs.copyFileSync(sourceIcon, targetPath);
      console.log(`✅ 已更新: ${targetPath}`);
      successCount++;
    } catch (error) {
      console.error(`❌ 更新失败: ${targetPath}`, error.message);
      errorCount++;
    }
  });
});

console.log(`\n📊 更新完成！`);
console.log(`   成功: ${successCount} 个文件`);
console.log(`   失败: ${errorCount} 个文件`);

if (errorCount === 0) {
  console.log('\n✨ 所有图标已成功更新！');
  console.log('📝 下一步：');
  console.log('   1. 运行: git add android/app/src/main/res/mipmap-*');
  console.log('   2. 运行: git commit -m "Update Android app icons"');
  console.log('   3. 运行: git push');
  console.log('   4. 构建新的 APK');
} else {
  console.log('\n⚠️  部分图标更新失败，请检查错误信息');
}
