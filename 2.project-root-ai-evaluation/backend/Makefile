.PHONY: help install test test-cov run docker-up docker-down clean

help:
	@echo "可用命令:"
	@echo "  make install     - 安装依赖"
	@echo "  make test        - 运行测试"
	@echo "  make test-cov    - 运行测试并生成覆盖率报告"
	@echo "  make run         - 启动应用"
	@echo "  make docker-up   - 启动 Docker 服务"
	@echo "  make docker-down - 停止 Docker 服务"
	@echo "  make clean       - 清理临时文件"

install:
	pip install -r requirements.txt

test:
	pytest

test-cov:
	pytest --cov=app --cov-report=html --cov-report=term

run:
	python main.py

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage
