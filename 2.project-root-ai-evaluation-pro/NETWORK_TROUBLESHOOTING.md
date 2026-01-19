# 🌐 网络超时问题排查指南

## 问题现象

应用显示：**"请求超时，请检查网络连接是否畅通"**

## 🔍 问题诊断

### 运行诊断脚本

```cmd
node diagnose-timeout.js
```

这个脚本会测试：
1. 环境变量配置
2. 阿里云 OCR API 连接
3. Vercel API 连接

---

## 🚨 常见问题和解决方案

### 问题 1: DNS 解析失败

**错误信息**:
```
getaddrinfo ENOTFOUND ocr-api.cn-shanghai.aliyuncs.com
```

**原因**: 无法解析阿里云域名

**解决方案**:

#### 方案 A: 更换 DNS 服务器

1. 打开网络设置
2. 更改 DNS 为：
   - 首选：`8.8.8.8` (Google DNS)
   - 备用：`114.114.114.114` (国内 DNS)

#### 方案 B: 使用代理

如果你有代理服务器：

1. 运行 `setup-proxy.bat`
2. 修改代理地址为你的代理：
   ```bat
   set HTTP_PROXY=http://你的代理地址:端口
   set HTTPS_PROXY=http://你的代理地址:端口
   ```

#### 方案 C: 检查防火墙

1. 检查 Windows 防火墙设置
2. 确保允许 Node.js 访问网络
3. 检查公司/学校网络是否有限制

---

### 问题 2: 请求超时

**错误信息**:
```
Request timeout after 10000ms
```

**原因**: 网络速度慢或 API 响应慢

**解决方案**:

#### 已自动应用的优化

我已经将超时时间增加到：
- OCR 识别：10秒 → 30秒
- AI 分析：15秒 → 30秒
- 学习路径：12秒 → 30秒
- 默认超时：30秒 → 60秒

#### 手动调整超时时间

如果还是超时，可以在 `.env.local` 中设置更长的超时：

```env
# 超时配置（毫秒）
OCR_TIMEOUT=60000          # 60 秒
ANALYZE_TIMEOUT=60000      # 60 秒
GENERATE_PATH_TIMEOUT=60000 # 60 秒
DEFAULT_TIMEOUT=120000     # 120 秒
```

---

### 问题 3: Vercel API 无法访问

**错误信息**:
```
socket hang up
Failed to connect to somegood.vercel.app
```

**原因**: 无法访问 Vercel 服务器

**解决方案**:

#### 方案 A: 检查 Vercel 部署状态

1. 访问 Vercel Dashboard: https://vercel.com/klays-projects-3394eafa/somegood
2. 查看最新部署是否成功
3. 检查部署日志是否有错误

#### 方案 B: 使用代理访问

如果 Vercel 被墙，需要使用代理：

1. 配置系统代理
2. 或使用 VPN
3. 重新测试

#### 方案 C: 本地开发模式

如果无法访问 Vercel，可以使用本地 API：

1. 启动本地服务器：
   ```cmd
   node local-api-server.js
   ```

2. 修改 `lib/ApiClient.ts` 的 API 地址：
   ```typescript
   const API_BASE_URL = 'http://localhost:3000/api';
   ```

---

### 问题 4: AccessKey 无效

**错误信息**:
```
InvalidAccessKeyId.NotFound
```

**原因**: AccessKey 配置错误或未激活

**解决方案**:

1. **检查 AccessKey 是否正确**
   ```cmd
   node test-env-keys.js
   ```

2. **确认 AccessKey 已激活**
   - 登录阿里云控制台
   - 访问：https://ram.console.aliyun.com/manage/ak
   - 确认 AccessKey 状态为"启用"

3. **检查权限**
   - 确保 AccessKey 有 OCR 服务权限
   - 检查账户余额是否充足

4. **重新生成 AccessKey**
   - 如果确认配置正确但仍然失败
   - 删除旧的 AccessKey
   - 生成新的 AccessKey
   - 更新 `.env.local` 和 Vercel 环境变量

---

## 🛠️ 快速修复步骤

### 步骤 1: 运行诊断

```cmd
node diagnose-timeout.js
```

### 步骤 2: 根据诊断结果采取行动

#### 如果是 DNS 问题：
```cmd
# 更换 DNS 或配置代理
setup-proxy.bat
```

#### 如果是超时问题：
```cmd
# 已自动增加超时时间，重新部署
vercel --prod
```

#### 如果是 AccessKey 问题：
```cmd
# 检查环境变量
node test-env-keys.js

# 更新 AccessKey（参考 UPDATE_API_KEYS.md）
```

### 步骤 3: 重新测试

```cmd
# 重新运行诊断
node diagnose-timeout.js

# 或直接测试应用
npm run web
```

---

## 📊 性能优化建议

### 1. 使用缓存

应用已集成缓存系统，相同图片会直接从缓存读取，响应时间 < 100ms。

### 2. 压缩图片

上传前图片会自动压缩到 0.5MB 以下，减少上传时间。

### 3. 请求队列

多个请求会自动排队，避免并发过载。

### 4. 本地开发

如果网络问题无法解决，可以使用本地 API 服务器：

```cmd
# 启动本地服务器
node local-api-server.js

# 在另一个终端启动应用
npm run web
```

---

## 🔧 高级配置

### 配置代理（Node.js）

在 `.env.local` 中添加：

```env
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### 配置代理（Git）

```cmd
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

### 取消代理

```cmd
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## 📞 仍然无法解决？

### 检查清单

- [ ] 运行了 `node diagnose-timeout.js`
- [ ] 检查了 DNS 设置
- [ ] 尝试了配置代理
- [ ] 检查了防火墙设置
- [ ] 确认了 AccessKey 正确且已激活
- [ ] 增加了超时时间
- [ ] 检查了 Vercel 部署状态
- [ ] 尝试了本地开发模式

### 收集信息

如果问题仍然存在，收集以下信息：

1. **诊断脚本输出**
   ```cmd
   node diagnose-timeout.js > diagnosis.txt
   ```

2. **网络环境**
   - 是否在公司/学校网络？
   - 是否使用 VPN？
   - 是否有防火墙限制？

3. **错误截图**
   - 应用错误提示
   - 浏览器控制台错误
   - Vercel 部署日志

---

## 💡 临时解决方案

如果网络问题短期无法解决，可以：

### 方案 1: 使用移动热点

1. 开启手机热点
2. 电脑连接手机热点
3. 重新测试应用

### 方案 2: 更换网络环境

1. 尝试在家里/咖啡厅等其他网络环境
2. 确认是否是特定网络的问题

### 方案 3: 使用 Mock 数据

临时使用 Mock 数据进行开发：

```typescript
// 在 lib/ApiClient.ts 中
const USE_MOCK = true; // 开启 Mock 模式
```

---

**更新时间**: 2026-01-19  
**相关文档**: 
- `diagnose-timeout.js` - 诊断脚本
- `setup-proxy.bat` - 代理配置脚本
- `UPDATE_API_KEYS.md` - API Keys 更新指南
