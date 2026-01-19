@echo off
echo 创建learningapp数据库...
echo.
set PGPASSWORD=klay9873210
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE learningapp;"
if %errorlevel% equ 0 (
    echo ✓ 数据库创建成功！
) else (
    echo 数据库可能已存在或创建失败
)
echo.
pause
