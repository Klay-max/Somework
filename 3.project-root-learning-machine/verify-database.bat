@echo off
echo 验证数据库连接...
echo.
set PGPASSWORD=klay9873210
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d learningapp -c "SELECT 1 as test;"
if %errorlevel% equ 0 (
    echo.
    echo ✓ 数据库连接成功！
) else (
    echo.
    echo ✗ 数据库连接失败
)
echo.
pause
