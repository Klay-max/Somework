# UI 风格更新说明

## 已完成的更改

### 1. 配色方案更新 ✅

从赛博朋克风格改为教育风格：

**旧配色（赛博朋克）：**
- 背景：纯黑 (#000000)
- 主色：青色 (#00ffff)
- 强调色：绿色 (#00ff00)
- 风格：科技感、未来感

**新配色（教育风格）：**
- 背景：浅灰 (#F5F7FA)
- 主色：清新蓝 (#4A90E2)
- 强调色：橙色 (#FF9500)
- 辅助色：绿色 (#52C41A)
- 风格：清新、友好、专业

### 2. UI 组件更新 ✅

- **首页 (app/index.tsx)**：
  - 背景从黑色改为浅灰色
  - 按钮从霓虹边框改为实心圆角卡片
  - 添加阴影效果，增加层次感
  - 文字颜色从青色改为深灰/蓝色

- **全局布局 (app/_layout.tsx)**：
  - 状态栏从 light 改为 dark（适配浅色背景）
  - 全局背景色更新

- **应用配置 (app.json)**：
  - 主题从 dark 改为 light
  - 启动画面背景色更新为蓝色
  - 自适应图标背景色更新

### 3. 图标设计 ✅

已创建 SVG 图标设计文件：`icon-design.svg`

**设计元素：**
- 📚 书本：代表学习和教育
- 🤖 AI 标记：橙色圆形 + "AI" 文字
- 🎨 配色：蓝色渐变背景 + 白色书本 + 橙色 AI

## 生成图标的步骤

由于 Windows 上安装 canvas 比较复杂，建议使用以下方法：

### 方法 1：使用在线工具（推荐）

1. 打开 `icon-design.svg` 文件
2. 访问在线 SVG 转 PNG 工具：
   - https://svgtopng.com/
   - https://cloudconvert.com/svg-to-png
   - https://www.aconvert.com/image/svg-to-png/

3. 上传 `icon-design.svg`，生成以下尺寸：
   - `icon.png`: 1024x1024
   - `adaptive-icon.png`: 1024x1024
   - `favicon.png`: 48x48

4. 将生成的图片保存到 `assets/` 文件夹

### 方法 2：使用 Figma/Sketch

1. 在 Figma 中创建 1024x1024 画布
2. 参考 `icon-design.svg` 的设计
3. 导出为 PNG（1024x1024）
4. 保存到 `assets/` 文件夹

### 方法 3：使用 Photoshop/GIMP

1. 打开 `icon-design.svg`
2. 调整尺寸为 1024x1024
3. 导出为 PNG
4. 保存到 `assets/` 文件夹

## 启动画面 (Splash Screen)

启动画面需要 1284x2778 尺寸，建议：

1. 使用蓝色渐变背景 (#4A90E2 到 #67B8F7)
2. 中央放置图标
3. 下方添加 "安辅导" 文字
4. 副标题："AI 智能作业批改助手"

可以使用 Figma 或 Photoshop 创建。

## 测试新 UI

### 本地测试

```bash
# 重新生成 Android 项目
npx expo prebuild --platform android --clean

# 本地构建
cd android
.\gradlew assembleRelease --no-daemon
```

### EAS 构建

```bash
# 提交更改
git add .
git commit -m "UI 风格更新：从赛博朋克改为教育风格"
git push origin main

# 构建新 APK
eas build --platform android --profile preview2
```

## 效果预览

### 首页变化

**之前（赛博朋克）：**
- 黑色背景
- 青色霓虹边框
- 科技感强

**之后（教育风格）：**
- 浅灰背景
- 蓝色实心按钮
- 白色卡片
- 清新友好

### 配色对比

| 元素 | 旧配色 | 新配色 |
|------|--------|--------|
| 背景 | #000000 (黑) | #F5F7FA (浅灰) |
| 主按钮 | #00ffff (青) | #4A90E2 (蓝) |
| 状态指示 | #00ff00 (绿) | #52C41A (绿) |
| 强调色 | #00ffff (青) | #FF9500 (橙) |
| 文字 | #00ffff (青) | #333333 (深灰) |

## 下一步

1. ✅ 生成新图标（使用上述方法）
2. ✅ 提交代码更改
3. ⏳ 构建新 APK
4. ⏳ 测试 OTA 更新功能

## 注意事项

- 图标更改需要重新构建 APK（不能通过 OTA 更新）
- UI 样式更改可以通过 OTA 更新
- 建议先测试 UI 更改，确认满意后再生成图标

---

**当前状态：** UI 代码已更新，等待生成图标并构建新 APK
