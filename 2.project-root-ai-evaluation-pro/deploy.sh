#!/bin/bash

# VISION-CORE 快速部署脚本

echo "🚀 VISION-CORE 部署脚本"
echo "========================"
echo ""

# 检查 Vercel CLI 是否安装
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI 已就绪"
echo ""

# 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$ALICLOUD_ACCESS_KEY_ID" ]; then
    echo "⚠️  警告: ALICLOUD_ACCESS_KEY_ID 未设置"
fi

if [ -z "$ALICLOUD_ACCESS_KEY_SECRET" ]; then
    echo "⚠️  警告: ALICLOUD_ACCESS_KEY_SECRET 未设置"
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告: DEEPSEEK_API_KEY 未设置"
fi

echo ""
echo "📝 请确保在 Vercel Dashboard 中配置了以下环境变量："
echo "   - ALICLOUD_ACCESS_KEY_ID"
echo "   - ALICLOUD_ACCESS_KEY_SECRET"
echo "   - DEEPSEEK_API_KEY"
echo ""

# 询问部署类型
echo "请选择部署类型："
echo "1) 预览部署 (Preview)"
echo "2) 生产部署 (Production)"
read -p "请输入选项 (1 或 2): " deploy_type

echo ""

if [ "$deploy_type" = "1" ]; then
    echo "🔄 开始预览部署..."
    vercel
elif [ "$deploy_type" = "2" ]; then
    echo "🚀 开始生产部署..."
    vercel --prod
else
    echo "❌ 无效选项"
    exit 1
fi

echo ""
echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 访问 Vercel Dashboard 查看部署状态"
echo "2. 测试 API 端点是否正常工作"
echo "3. 测试完整的扫描流程"
echo ""
echo "📖 详细部署指南请查看: DEPLOYMENT_GUIDE.md"
