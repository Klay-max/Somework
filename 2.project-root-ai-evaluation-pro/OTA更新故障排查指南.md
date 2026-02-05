# OTA 更新故障排查指南

## 问题：点击"检查更新"没有反应

### 可能的原因和解决方案

#### 1. 在开发模式下运行 ❌
**症状**: 点击"检查更新"后弹出提示"当前环境不支持 OTA 更新（开发模式下不可用）"

**原因**: 
- 通过 `npx expo start` 或 Expo Go 运行应用
- OTA 更新只在生产构建（EAS Build）中可用

**解决方案**:
- 必须使用 EAS Build 构建的 APK 文件
- 下载并安装最新的 APK：https://expo.dev/accounts/klay215/projects/anfudao/builds/906a4c6f-de1e-401b-accd-aeeeaee351fc

#### 2. 网络连接问题 🌐
**症状**: 长时间显示"正在检查更新..."，然后超时或失败

**原因**:
- 手机没有连接到互联网
- 网络速度太慢
- 防火墙或代理阻止了连接

**解决方案**:
- 确保手机连接到稳定的 WiFi 或移动网络
- 尝试切换网络（WiFi ↔ 移动数据）
- 关闭 VPN 或代理

#### 3. 已经是最新版本 ✅
**症状**: 弹出提示"当前已是最新版本"

**原因**:
- 应用已经是最新版本
- 没有新的 OTA 更新发布

**解决方案**:
- 这是正常的！说明你的应用已经是最新的
- 等待新功能发布后再检查更新

#### 4. 缓存问题 🔄
**症状**: 明明发布了新版本，但检查更新说已是最新

**原因**:
- Expo 更新服务器缓存
- 本地应用缓存

**解决方案**:
```bash
# 方法 1: 完全关闭应用
1. 从后台清除应用（不是最小化，是完全关闭）
2. 重新打开应用
3. 等待 3 秒自动检查更新

# 方法 2: 清除应用数据（会丢失所有本地数据）
1. 进入手机设置 → 应用管理
2. 找到"安辅导"应用
3. 清除数据和缓存
4. 重新打开应用
```

## 如何验证 OTA 更新是否可用

### 方法 1: 查看控制台日志（开发者）
如果你通过 USB 连接手机并运行 `adb logcat`，可以看到详细的日志：

```
OTA 更新已禁用: { isDev: false, isEnabled: true }
自动检查更新...
更新检查结果: { isAvailable: true, manifest: {...} }
发现新版本，开始下载...
更新下载完成: {...}
```

### 方法 2: 查看 EAS Dashboard
访问：https://expo.dev/accounts/klay215/projects/anfudao/updates

可以看到所有已发布的更新：
- Update Group ID
- 发布时间
- 消息
- 平台（Android/iOS）

### 方法 3: 强制重新加载
在应用中添加一个隐藏的重新加载按钮（仅用于测试）：

```typescript
import * as Updates from 'expo-updates';

// 在设置页面添加
<TouchableOpacity onPress={async () => {
  await Updates.reloadAsync();
}}>
  <Text>强制重新加载</Text>
</TouchableOpacity>
```

## 最新更新信息

### 当前最新版本
- **Update Group ID**: `20906b0c-3142-462d-9730-8ca5a1e3fbb3`
- **发布时间**: 2026-02-05
- **更新内容**: 
  - 首页快捷统计卡片
  - 历史记录搜索功能
  - 深色模式切换
  - 改进的更新检查（带详细调试信息）

### 如何确认更新成功
更新成功后，你应该能看到：
1. ✅ 首页顶部有三个统计卡片（总测评、平均分、最高分）
2. ✅ 历史记录页面有搜索框
3. ✅ 设置页面有"深色模式"开关
4. ✅ 点击"检查更新"会显示更详细的信息

## 测试步骤

### 完整测试流程
1. **确认使用正确的 APK**
   - 不是通过 Expo Go 运行
   - 不是通过 `npx expo start` 运行
   - 是通过 EAS Build 构建的 APK

2. **完全关闭应用**
   - 从后台清除应用
   - 不要只是最小化

3. **重新打开应用**
   - 等待 3 秒
   - 应该会自动检查更新

4. **手动检查更新**
   - 进入设置页面
   - 点击"检查更新"按钮
   - 观察提示信息

5. **查看新功能**
   - 返回首页，查看统计卡片
   - 进入历史记录，查看搜索框
   - 进入设置，查看深色模式开关

## 常见错误信息

### "当前环境不支持 OTA 更新"
```
环境信息：
- 开发模式: 是
- Updates.isEnabled: false
- Platform: android

OTA 更新仅在生产构建中可用。
请使用 EAS Build 构建的 APK 测试更新功能。
```
**解决**: 使用 EAS Build 构建的 APK

### "检查更新失败：Network request failed"
**解决**: 检查网络连接

### "当前已是最新版本"
**解决**: 这是正常的，说明没有新更新

## 紧急情况：如果更新导致应用崩溃

### 回滚到上一个版本
```bash
# 1. 查看更新历史
npx eas-cli update:list --branch preview2

# 2. 回滚到上一个版本
npx eas-cli update:republish --group <previous-update-group-id>
```

### 或者重新安装 APK
下载并重新安装原始 APK：
https://expo.dev/accounts/klay215/projects/anfudao/builds/906a4c6f-de1e-401b-accd-aeeeaee351fc

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：
1. 手机型号和 Android 版本
2. 应用安装方式（EAS Build APK / Expo Go / 其他）
3. 网络环境（WiFi / 移动数据）
4. 错误提示的完整截图
5. 是否能看到新功能（统计卡片、搜索框、深色模式开关）

---

**最后更新**: 2026-02-05  
**文档版本**: 1.0
