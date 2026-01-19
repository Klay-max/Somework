@echo off
REM 生产部署前检查脚本 (Windows)
REM 用法: scripts\pre-deployment-check.bat

setlocal enabledelayedexpansion

echo =========================================
echo 生产部署前检查
echo =========================================
echo.

set ERRORS=0
set WARNINGS=0

REM 1. 检查Docker
echo 1. 检查Docker环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [X] Docker未安装
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [√] Docker已安装: !DOCKER_VERSION!
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [X] Docker服务未运行
    set /a ERRORS+=1
) else (
    echo [√] Docker服务运行正常
)

REM 2. 检查Docker Compose
echo.
echo 2. 检查Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [X] Docker Compose未安装
    set /a ERRORS+=1
) else (
    for /f "tokens=*" %%i in ('docker-compose --version') do set COMPOSE_VERSION=%%i
    echo [√] Docker Compose已安装: !COMPOSE_VERSION!
)

REM 3. 检查.env文件
echo.
echo 3. 检查环境配置...
if exist .env (
    echo [√] .env文件存在
    
    REM 检查必需的环境变量
    findstr /C:"POSTGRES_PASSWORD=" .env >nul
    if errorlevel 1 (
        echo [X] POSTGRES_PASSWORD 未找到
        set /a ERRORS+=1
    ) else (
        findstr /C:"POSTGRES_PASSWORD=your_" .env >nul
        if not errorlevel 1 (
            echo [X] POSTGRES_PASSWORD 未正确配置
            set /a ERRORS+=1
        ) else (
            echo [√] POSTGRES_PASSWORD 已配置
        )
    )
    
    findstr /C:"REDIS_PASSWORD=" .env >nul
    if errorlevel 1 (
        echo [X] REDIS_PASSWORD 未找到
        set /a ERRORS+=1
    ) else (
        findstr /C:"REDIS_PASSWORD=your_" .env >nul
        if not errorlevel 1 (
            echo [X] REDIS_PASSWORD 未正确配置
            set /a ERRORS+=1
        ) else (
            echo [√] REDIS_PASSWORD 已配置
        )
    )
    
    findstr /C:"SECRET_KEY=" .env >nul
    if errorlevel 1 (
        echo [X] SECRET_KEY 未找到
        set /a ERRORS+=1
    ) else (
        findstr /C:"SECRET_KEY=your_" .env >nul
        if not errorlevel 1 (
            echo [X] SECRET_KEY 未正确配置
            set /a ERRORS+=1
        ) else (
            echo [√] SECRET_KEY 已配置
        )
    )
    
    REM 检查API密钥
    findstr /C:"BAIDU_OCR_API_KEY=" .env >nul
    if errorlevel 1 (
        echo [!] BAIDU_OCR_API_KEY 未找到
        set /a WARNINGS+=1
    ) else (
        findstr /C:"BAIDU_OCR_API_KEY=your_" .env >nul
        if not errorlevel 1 (
            echo [!] BAIDU_OCR_API_KEY 未配置
            set /a WARNINGS+=1
        ) else (
            echo [√] BAIDU_OCR_API_KEY 已配置
        )
    )
    
    findstr /C:"DEEPSEEK_API_KEY=" .env >nul
    if errorlevel 1 (
        echo [!] DEEPSEEK_API_KEY 未找到
        set /a WARNINGS+=1
    ) else (
        findstr /C:"DEEPSEEK_API_KEY=your_" .env >nul
        if not errorlevel 1 (
            echo [!] DEEPSEEK_API_KEY 未配置
            set /a WARNINGS+=1
        ) else (
            echo [√] DEEPSEEK_API_KEY 已配置
        )
    )
) else (
    echo [X] .env文件不存在
    echo    请运行: copy .env.example .env
    set /a ERRORS+=1
)

REM 4. 检查项目文件
echo.
echo 4. 检查项目文件...
if exist docker-compose.prod.yml (
    echo [√] docker-compose.prod.yml 存在
) else (
    echo [X] docker-compose.prod.yml 不存在
    set /a ERRORS+=1
)

if exist backend\Dockerfile.prod (
    echo [√] backend\Dockerfile.prod 存在
) else (
    echo [X] backend\Dockerfile.prod 不存在
    set /a ERRORS+=1
)

if exist backend\requirements.txt (
    echo [√] backend\requirements.txt 存在
) else (
    echo [X] backend\requirements.txt 不存在
    set /a ERRORS+=1
)

if exist backend\main.py (
    echo [√] backend\main.py 存在
) else (
    echo [X] backend\main.py 不存在
    set /a ERRORS+=1
)

if exist nginx\nginx.conf (
    echo [√] nginx\nginx.conf 存在
) else (
    echo [X] nginx\nginx.conf 不存在
    set /a ERRORS+=1
)

REM 总结
echo.
echo =========================================
echo 检查完成
echo =========================================
echo.

if !ERRORS! EQU 0 (
    if !WARNINGS! EQU 0 (
        echo [√] 所有检查通过！可以开始部署。
        echo.
        echo 下一步：
        echo   docker-compose -f docker-compose.prod.yml up -d
        exit /b 0
    ) else (
        echo [!] 发现 !WARNINGS! 个警告
        echo.
        echo 建议修复警告后再部署，或者继续部署：
        echo   docker-compose -f docker-compose.prod.yml up -d
        exit /b 0
    )
) else (
    echo [X] 发现 !ERRORS! 个错误和 !WARNINGS! 个警告
    echo.
    echo 请修复错误后再部署！
    exit /b 1
)
