@echo off
echo 正在添加环境变量...
echo.

echo 添加 ALICLOUD_ACCESS_KEY_ID...
echo LTAI5tAQPefJFx33c4BfiHK7 | vercel env add ALICLOUD_ACCESS_KEY_ID production preview development

echo.
echo 添加 ALICLOUD_ACCESS_KEY_SECRET...
echo v8FbXKxmNjioUq2QgGP727Gjaz7PV9 | vercel env add ALICLOUD_ACCESS_KEY_SECRET production preview development

echo.
echo 添加 DEEPSEEK_API_KEY...
echo sk-03fe6c3cfcb84ceeb959124252f2204b | vercel env add DEEPSEEK_API_KEY production preview development

echo.
echo 环境变量添加完成！
pause
