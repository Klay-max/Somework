#!/bin/bash

# 生产部署前检查脚本
# 用法: ./scripts/pre-deployment-check.sh

set -e

echo "========================================="
echo "生产部署前检查"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. 检查Docker
echo "1. 检查Docker环境..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    check_pass "Docker已安装: $DOCKER_VERSION"
else
    check_fail "Docker未安装"
fi

if docker info &> /dev/null; then
    check_pass "Docker服务运行正常"
else
    check_fail "Docker服务未运行"
fi

# 2. 检查Docker Compose
echo ""
echo "2. 检查Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    check_pass "Docker Compose已安装: $COMPOSE_VERSION"
else
    check_fail "Docker Compose未安装"
fi

# 3. 检查.env文件
echo ""
echo "3. 检查环境配置..."
if [ -f .env ]; then
    check_pass ".env文件存在"
    
    # 检查必需的环境变量
    required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "SECRET_KEY" "JWT_SECRET_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            value=$(grep "^${var}=" .env | cut -d'=' -f2)
            if [[ "$value" == *"your_"* ]] || [[ "$value" == *"CHANGE_ME"* ]] || [ -z "$value" ]; then
                check_fail "$var 未正确配置"
            else
                check_pass "$var 已配置"
            fi
        else
            check_fail "$var 未找到"
        fi
    done
    
    # 检查API密钥
    api_keys=("BAIDU_OCR_API_KEY" "DEEPSEEK_API_KEY")
    for key in "${api_keys[@]}"; do
        if grep -q "^${key}=" .env; then
            value=$(grep "^${key}=" .env | cut -d'=' -f2)
            if [[ "$value" == *"your_"* ]] || [ -z "$value" ]; then
                check_warn "$key 未配置（可能影响功能）"
            else
                check_pass "$key 已配置"
            fi
        else
            check_warn "$key 未找到"
        fi
    done
else
    check_fail ".env文件不存在"
    echo "   请运行: cp .env.example .env"
fi

# 4. 检查磁盘空间
echo ""
echo "4. 检查系统资源..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_pass "磁盘空间充足 (使用率: ${DISK_USAGE}%)"
else
    check_warn "磁盘空间不足 (使用率: ${DISK_USAGE}%)"
fi

# 5. 检查端口占用
echo ""
echo "5. 检查端口占用..."
ports=(80 443 5432 6379 8000 9090 3000)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        check_warn "端口 $port 已被占用"
    else
        check_pass "端口 $port 可用"
    fi
done

# 6. 检查项目文件
echo ""
echo "6. 检查项目文件..."
required_files=(
    "docker-compose.prod.yml"
    "backend/Dockerfile.prod"
    "backend/requirements.txt"
    "backend/main.py"
    "nginx/nginx.conf"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file 存在"
    else
        check_fail "$file 不存在"
    fi
done

# 7. 检查Git状态
echo ""
echo "7. 检查Git状态..."
if [ -d .git ]; then
    check_pass "Git仓库已初始化"
    
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        check_pass "没有未提交的更改"
    else
        check_warn "有未提交的更改"
    fi
else
    check_warn "不是Git仓库"
fi

# 总结
echo ""
echo "========================================="
echo "检查完成"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过！可以开始部署。${NC}"
    echo ""
    echo "下一步："
    echo "  ./scripts/deploy.sh production"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ 发现 $WARNINGS 个警告${NC}"
    echo ""
    echo "建议修复警告后再部署，或者继续部署："
    echo "  ./scripts/deploy.sh production"
    exit 0
else
    echo -e "${RED}✗ 发现 $ERRORS 个错误和 $WARNINGS 个警告${NC}"
    echo ""
    echo "请修复错误后再部署！"
    exit 1
fi
