/**
 * 测试环境变量是否正确配置
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 检查环境变量配置...\n');

const checks = [
  {
    name: 'ALICLOUD_ACCESS_KEY_ID',
    value: process.env.ALICLOUD_ACCESS_KEY_ID,
    expected: '应该是 24 个字符左右，以 LTAI 开头'
  },
  {
    name: 'ALICLOUD_ACCESS_KEY_SECRET',
    value: process.env.ALICLOUD_ACCESS_KEY_SECRET,
    expected: '应该是 30 个字符左右'
  },
  {
    name: 'DEEPSEEK_API_KEY',
    value: process.env.DEEPSEEK_API_KEY,
    expected: '应该以 sk- 开头'
  }
];

let allPassed = true;

checks.forEach(check => {
  const exists = !!check.value;
  const masked = check.value 
    ? `${check.value.substring(0, 8)}...${check.value.substring(check.value.length - 4)}`
    : '未设置';
  
  console.log(`${exists ? '✅' : '❌'} ${check.name}`);
  console.log(`   值: ${masked}`);
  console.log(`   长度: ${check.value ? check.value.length : 0} 字符`);
  console.log(`   说明: ${check.expected}\n`);
  
  if (!exists) {
    allPassed = false;
  }
});

if (allPassed) {
  console.log('✅ 所有环境变量都已配置！');
  console.log('\n下一步：运行 vercel --prod 部署到生产环境');
} else {
  console.log('❌ 有环境变量缺失，请检查 .env.local 文件');
}
