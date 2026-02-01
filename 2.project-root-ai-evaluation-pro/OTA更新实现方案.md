# OTA 自动更新实现方案

## 什么是 OTA 更新？

Over-The-Air (OTA) 更新允许你：
- 📱 更新应用代码，无需重新安装 APK
- 🚀 用户打开应用时自动检查更新
- ⚡ 后台下载，重启后生效
- 🎯 快速修复 Bug 和发布新功能

## 限制

⚠️ **只能更新 JavaScript 代码**，不能更新：
- 原生代码（Java/Kotlin）
- 应用权限
- 原生依赖
- app.json 中的某些配置

如果需要更新这些，仍需发布新的 APK。

---

## 方案 1：Expo Updates（推荐）✨

### 优点
- ✅ Expo 官方支持
- ✅ 配置简单
- ✅ 免费（每月 50GB 流量）
- ✅ 自动检测更新
- ✅ 支持回滚

### 实现步骤

#### 1. 安装依赖
```bash
npx expo install expo-updates
```

#### 2. 配置 app.json
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/你的项目ID"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

#### 3. 添加更新检查代码
在 `app/_layout.tsx` 中添加：

```typescript
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // 提示用户重启应用
          Alert.alert(
            '发现新版本',
            '应用将重启以应用更新',
            [{ text: '立即更新', onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (e) {
        console.log('检查更新失败:', e);
      }
    }
    
    checkForUpdates();
  }, []);
  
  // ... 其他代码
}
```

#### 4. 发布更新
```bash
# 发布到 Expo 服务器
eas update --branch production --message "修复了网络问题"
```

#### 5. 用户体验流程
1. 用户打开应用
2. 应用自动检查更新（后台进行）
3. 如果有更新，下载到本地
4. 提示用户"发现新版本"
5. 用户点击"立即更新"
6. 应用重启，新代码生效

---

## 方案 2：自建更新系统

如果你想完全自主控制，可以自己实现：

### 实现思路

1. **创建版本检查 API**
```typescript
// api/check-version.ts
export default async function handler(req, res) {
  res.json({
    latestVersion: '1.0.1',
    downloadUrl: 'https://your-server.com/app-v1.0.1.apk',
    updateMessage: '修复了网络连接问题',
    forceUpdate: false
  });
}
```

2. **应用启动时检查版本**
```typescript
async function checkVersion() {
  const response = await fetch('https://your-api.com/check-version');
  const { latestVersion, downloadUrl, updateMessage } = await response.json();
  
  const currentVersion = '1.0.0'; // 从 app.json 读取
  
  if (latestVersion > currentVersion) {
    Alert.alert(
      '发现新版本',
      updateMessage,
      [
        { text: '稍后更新', style: 'cancel' },
        { text: '立即更新', onPress: () => Linking.openURL(downloadUrl) }
      ]
    );
  }
}
```

3. **下载和安装**
- Android: 使用 `react-native-fs` 下载 APK
- 使用 `react-native-install-apk` 安装

### 缺点
- 需要自己托管 APK 文件
- 需要处理下载进度
- 需要处理安装权限
- 更新的是整个 APK，不是代码

---

## 方案 3：CodePush（微软）

### 优点
- 功能最强大
- 支持分阶段发布
- 详细的分析数据

### 缺点
- 配置复杂
- 需要 Azure 账号
- 对 Expo 支持不完善

---

## 推荐实施方案

### 阶段 1：使用 Expo Updates（立即可用）
1. 配置 Expo Updates
2. 实现自动检查更新
3. 测试更新流程

### 阶段 2：优化用户体验
1. 添加更新进度显示
2. 支持静默更新（后台下载）
3. 添加更新日志展示

### 阶段 3：混合方案（可选）
- 小更新：使用 Expo Updates（JS 代码）
- 大更新：提示下载新 APK（原生代码）

---

## 成本分析

### Expo Updates
- **免费额度**：50GB/月 流量
- **付费**：超出后 $0.30/GB
- **估算**：假设每次更新 5MB，可支持 10,000 次更新/月

### 自建系统
- **服务器**：$5-20/月
- **CDN**：$10-50/月
- **开发时间**：2-3 天

---

## 我的建议

1. **先用 Expo Updates**
   - 快速实现
   - 零成本
   - 满足大部分需求

2. **解决网络问题**
   - 配置国内 CDN
   - 优化 API 超时设置
   - 添加重试机制

3. **长期规划**
   - 如果用户量大，考虑自建
   - 如果需要更多控制，考虑 CodePush

---

## 下一步

你想让我：
1. ✅ 立即配置 Expo Updates？
2. ✅ 先解决网络连接问题？
3. ✅ 两个都做？

我建议先解决网络问题，然后配置 OTA 更新，这样你就有了一个完整的解决方案！
