@echo off
echo 配置网络代理...
echo.

REM 设置 HTTP 代理（替换为你的代理地址）
set HTTP_PROXY=http://127.0.0.1:7890
set HTTPS_PROXY=http://127.0.0.1:7890

REM 设置 Git 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

echo ✅ 代理配置完成！
echo.
echo 当前代理设置:
echo HTTP_PROXY=%HTTP_PROXY%
echo HTTPS_PROXY=%HTTPS_PROXY%
echo.
echo Git 代理:
git config --global --get http.proxy
git config --global --get https.proxy
echo.
pause
