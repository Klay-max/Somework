#!/bin/bash

# 数据库备份脚本
# 用法: ./scripts/backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="docker-compose.prod.yml"

echo "========================================="
echo "数据库备份脚本"
echo "时间: $DATE"
echo "========================================="

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份 PostgreSQL
echo ""
echo "备份 PostgreSQL..."
docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres exam_assessment > "$BACKUP_DIR/postgres_$DATE.sql"
gzip "$BACKUP_DIR/postgres_$DATE.sql"
echo "✓ PostgreSQL 备份完成: $BACKUP_DIR/postgres_$DATE.sql.gz"

# 备份 Redis
echo ""
echo "备份 Redis..."
docker-compose -f $COMPOSE_FILE exec redis redis-cli SAVE
docker cp exam_assessment_redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"
echo "✓ Redis 备份完成: $BACKUP_DIR/redis_$DATE.rdb"

# 清理旧备份（保留最近7天）
echo ""
echo "清理旧备份..."
find $BACKUP_DIR -name "postgres_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "redis_*.rdb" -mtime +7 -delete
echo "✓ 旧备份已清理"

# 显示备份列表
echo ""
echo "当前备份列表:"
ls -lh $BACKUP_DIR

echo ""
echo "========================================="
echo "备份完成！"
echo "========================================="
