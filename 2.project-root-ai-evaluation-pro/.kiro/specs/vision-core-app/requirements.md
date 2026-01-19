# Requirements Document

## Introduction

VISION-CORE 是一个赛博朋克风格的教育测评应用，支持 Web 和移动端（Android/iOS）双平台。系统通过视觉扫描功能进行教育评估，提供沉浸式的科幻用户体验。

## Glossary

- **System**: VISION-CORE 应用系统
- **Dashboard**: 首页仪表盘界面
- **Scan_Terminal**: 混合扫描终端（相机/上传界面）
- **Bento_Grid**: 瀑布流栅格布局风格
- **Viewfinder**: 扫描取景框
- **Matrix_Animation**: 矩阵代码流动画效果

## Requirements

### Requirement 1: 项目基础设施

**User Story:** 作为开发者，我希望建立一个跨平台的 React Native 项目基础，以便能够同时支持 Web 和移动端开发。

#### Acceptance Criteria

1. THE System SHALL 使用 Expo 框架和 TypeScript 进行初始化
2. WHEN 项目创建完成 THEN THE System SHALL 包含 expo-router 用于路由管理
3. THE System SHALL 集成 NativeWind 和 TailwindCSS 用于样式管理
4. THE System SHALL 包含 react-native-reanimated 用于动画效果
5. THE System SHALL 支持 Web 平台编译和运行

### Requirement 2: 样式系统配置

**User Story:** 作为开发者，我希望配置 Tailwind CSS 样式系统，以便能够使用实用类快速构建赛博朋克风格的 UI。

#### Acceptance Criteria

1. WHEN Tailwind 配置文件创建 THEN THE System SHALL 正确扫描 app 目录下的所有组件文件
2. THE System SHALL 在 Babel 配置中包含 NativeWind 插件
3. WHEN 应用启动 THEN THE System SHALL 正确应用 Tailwind 样式类
4. THE System SHALL 支持自定义赛博朋克主题色（青色、绿色、深灰）

### Requirement 3: 全局主题布局

**User Story:** 作为用户，我希望应用具有统一的深色赛博朋克主题，以便获得沉浸式的视觉体验。

#### Acceptance Criteria

1. THE Dashboard SHALL 使用纯黑色背景 (#000000)
2. THE System SHALL 隐藏默认的导航栏 Header
3. WHEN 应用加载 THEN THE System SHALL 全局应用深色主题
4. THE System SHALL 在所有页面保持一致的主题风格

### Requirement 4: 首页仪表盘界面

**User Story:** 作为用户，我希望看到一个科幻风格的仪表盘首页，以便快速了解系统状态并启动扫描功能。

#### Acceptance Criteria

1. THE Dashboard SHALL 使用 Bento Grid 瀑布流栅格布局
2. WHEN Dashboard 加载 THEN THE System SHALL 显示顶部状态栏，包含 "SYSTEM ONLINE" 文本和绿色呼吸灯动画
3. THE Dashboard SHALL 在中央显示一个带发光效果的主控按钮，文案为 "启动视觉诊断 (INITIATE SCAN)"
4. THE Dashboard SHALL 在底部显示模拟数据区，包含 "近期准确率 89%" 等统计信息
5. THE Dashboard SHALL 使用深灰色卡片 (#111) 配合极细的青色边框
6. WHEN 用户点击主控按钮 THEN THE System SHALL 导航至扫描终端页面 (/camera)

### Requirement 5: 平台检测与适配

**User Story:** 作为系统，我需要检测当前运行平台，以便为 Web 和移动端提供不同的扫描体验。

#### Acceptance Criteria

1. WHEN Scan_Terminal 加载 THEN THE System SHALL 检测当前平台类型（Web 或移动端）
2. IF 平台为 Web THEN THE System SHALL 渲染文件上传拖拽区
3. IF 平台为移动端 THEN THE System SHALL 渲染相机视图组件
4. THE System SHALL 为两种平台提供一致的视觉风格和交互逻辑

### Requirement 6: Web 端文件上传功能

**User Story:** 作为 Web 端用户，我希望通过拖拽或选择文件的方式上传图片，以便进行视觉诊断。

#### Acceptance Criteria

1. WHEN 平台为 Web THEN THE Scan_Terminal SHALL 显示一个科幻风格的文件上传拖拽区
2. THE System SHALL 支持通过 `<input type="file">` 选择图片文件
3. WHEN 用户拖拽文件到上传区 THEN THE System SHALL 提供视觉反馈
4. WHEN 文件上传成功 THEN THE System SHALL 触发扫描分析流程

### Requirement 7: 移动端相机功能

**User Story:** 作为移动端用户，我希望使用设备相机进行实时扫描，以便快速完成视觉诊断。

#### Acceptance Criteria

1. WHEN 平台为移动端 THEN THE Scan_Terminal SHALL 使用 expo-camera 的 CameraView 组件
2. THE System SHALL 全屏显示相机预览
3. THE System SHALL 请求相机权限
4. WHEN 用户拒绝相机权限 THEN THE System SHALL 显示友好的错误提示
5. THE System SHALL 提供拍照按钮用于捕获图像

### Requirement 8: 扫描取景框视觉效果

**User Story:** 作为用户，我希望在扫描界面看到科幻风格的取景框，以便明确扫描区域并增强沉浸感。

#### Acceptance Criteria

1. THE Scan_Terminal SHALL 在相机/上传区上方叠加一个 Viewfinder 组件
2. THE Viewfinder SHALL 仅显示四个角的青色边框（不是完整矩形）
3. THE Viewfinder SHALL 居中显示并保持合适的尺寸比例
4. THE Viewfinder SHALL 不阻挡用户与相机/上传区的交互

### Requirement 9: 扫描动画与结果展示

**User Story:** 作为用户，我希望在启动扫描后看到动态的分析过程，以便了解系统正在工作并获得反馈。

#### Acceptance Criteria

1. WHEN 用户触发扫描 THEN THE System SHALL 显示矩阵代码流动画效果
2. THE Matrix_Animation SHALL 持续 3 秒钟
3. WHEN 动画完成 THEN THE System SHALL 显示模拟的分析结果
4. THE System SHALL 通过 Alert 或 Modal 展示结果信息
5. THE System SHALL 在结果中包含模拟的评估数据

### Requirement 10: 图标系统集成

**User Story:** 作为开发者，我希望使用统一的图标库，以便快速添加符合赛博朋克风格的图标元素。

#### Acceptance Criteria

1. THE System SHALL 集成 lucide-react-native 图标库
2. THE System SHALL 在界面中使用图标增强视觉表达
3. THE System SHALL 为图标应用青色或绿色主题色
4. THE System SHALL 确保图标在 Web 和移动端都能正常显示

### Requirement 11: 学情诊断报告页面路由

**User Story:** 作为用户，我希望在扫描完成后能够查看详细的诊断报告，以便了解我的学习情况和改进方向。

#### Acceptance Criteria

1. THE System SHALL 支持动态路由 `/report/[id]` 用于显示诊断报告
2. WHEN 扫描完成 THEN THE System SHALL 导航至对应的报告页面
3. THE System SHALL 根据报告 ID 加载相应的数据
4. THE System SHALL 支持可滚动的长页面布局
5. THE System SHALL 使用 Bento_Grid 布局组织报告内容

### Requirement 12: 核心计分板模块

**User Story:** 作为用户，我希望在报告顶部看到醒目的得分和正确率展示，以便快速了解本次测评的整体表现。

#### Acceptance Criteria

1. THE System SHALL 在报告页面顶部显示核心计分板
2. THE System SHALL 使用带霓虹光晕的环形进度条展示数据
3. THE System SHALL 在环形中心显示本次得分（数值）
4. THE System SHALL 在环形上显示正确率百分比
5. THE System SHALL 在计分板下方显示 3 个横向对比进度条
6. THE System SHALL 对比展示全国平均、本省平均、本市平均数据
7. THE System SHALL 使用青色或绿色高亮用户数据，灰色显示对比数据

### Requirement 13: 五维能力雷达图

**User Story:** 作为用户，我希望通过雷达图直观地看到我在各个能力维度的表现，以便识别优势和弱项。

#### Acceptance Criteria

1. THE System SHALL 集成图表库（react-native-svg 或 react-native-gifted-charts）
2. THE System SHALL 绘制五维能力雷达图
3. THE System SHALL 包含以下五个维度：听力、语法、阅读、完形、逻辑
4. THE System SHALL 使用透明背景和深灰色网格线
5. THE System SHALL 使用半透明青色填充数据区域
6. THE System SHALL 使用高亮青色边框描绘能力轮廓
7. WHEN 雷达图加载 THEN THE System SHALL 显示动画效果

### Requirement 14: 深度归因分析模块

**User Story:** 作为用户，我希望了解错误的深层原因，而不仅仅是表面现象，以便进行针对性改进。

#### Acceptance Criteria

1. THE System SHALL 将错误原因分为表层病灶和深层病根两类
2. THE System SHALL 使用 Tag 标签样式展示表层病灶（如"涂改痕迹"、"计算粗心"）
3. THE System SHALL 使用红色警告框样式展示深层病根（如"长难句逻辑缺失"）
4. THE System SHALL 显示 AI 点评文本
5. WHEN AI 点评加载 THEN THE System SHALL 模拟打字机效果逐字显示
6. THE System SHALL 确保点评内容专业且具有指导性

### Requirement 15: 知识点矩阵模块

**User Story:** 作为用户，我希望看到详细的知识点掌握情况列表，以便了解具体哪些知识点需要加强。

#### Acceptance Criteria

1. THE System SHALL 显示紧凑的知识点数据列表
2. THE System SHALL 为每个知识点显示：名称、难度星级、掌握状态
3. WHEN 知识点已掌握 THEN THE System SHALL 显示绿色实心圆点指示灯
4. WHEN 知识点未掌握 THEN THE System SHALL 显示红色呼吸灯指示灯
5. WHEN 用户点击知识点行 THEN THE System SHALL 展开显示详细解释
6. THE System SHALL 支持折叠和展开交互
7. THE System SHALL 使用难度星级（1-5星）表示知识点难度

### Requirement 16: 提分路径规划模块

**User Story:** 作为用户，我希望获得清晰的学习路径规划，以便知道如何一步步提升成绩。

#### Acceptance Criteria

1. THE System SHALL 使用技能树或时间轴样式展示提分路径
2. THE System SHALL 将路径分为多个阶段（如：基础修复、强化训练、冲刺提升）
3. THE System SHALL 为每个阶段提供具体的学习内容
4. THE System SHALL 支持嵌入视频课程链接
5. THE System SHALL 显示每个阶段的预计完成时间
6. THE System SHALL 使用连接线或箭头表示阶段之间的递进关系
7. WHEN 用户点击某个阶段 THEN THE System SHALL 显示该阶段的详细内容

### Requirement 17: 图表库集成

**User Story:** 作为开发者，我希望集成专业的图表库，以便绘制雷达图、进度条等数据可视化组件。

#### Acceptance Criteria

1. THE System SHALL 集成 react-native-svg 用于自定义图形绘制
2. THE System SHALL 集成 react-native-gifted-charts 或类似图表库用于标准图表
3. THE System SHALL 确保图表在 Web 和移动端都能正常渲染
4. THE System SHALL 支持图表动画效果
5. THE System SHALL 使用赛博朋克配色方案（青色、绿色、红色、深灰）

### Requirement 18: 报告数据模型

**User Story:** 作为开发者，我希望定义清晰的数据模型，以便管理和展示诊断报告数据。

#### Acceptance Criteria

1. THE System SHALL 定义报告数据的 TypeScript 接口
2. THE System SHALL 包含以下数据字段：报告ID、得分、正确率、对比数据、能力维度、错误分析、知识点列表、学习路径
3. THE System SHALL 支持模拟数据生成用于开发和测试
4. THE System SHALL 为未来的 API 集成预留接口
5. THE System SHALL 确保数据类型安全

### Requirement 19: 报告页面性能优化

**User Story:** 作为用户，我希望报告页面加载流畅，即使包含大量数据和图表也不会卡顿。

#### Acceptance Criteria

1. THE System SHALL 使用虚拟化列表渲染长列表数据
2. THE System SHALL 延迟加载非首屏可见的图表组件
3. THE System SHALL 优化图表渲染性能
4. WHEN 报告页面滚动 THEN THE System SHALL 保持 60fps 的流畅度
5. THE System SHALL 在数据加载时显示骨架屏或加载动画

### Requirement 20: 报告分享功能

**User Story:** 作为用户，我希望能够分享我的诊断报告，以便与老师或家长讨论学习情况。

#### Acceptance Criteria

1. THE System SHALL 在报告页面提供分享按钮
2. WHEN 用户点击分享 THEN THE System SHALL 生成报告截图或链接
3. THE System SHALL 支持通过系统分享功能分享报告
4. THE System SHALL 在分享内容中包含报告摘要信息
5. THE System SHALL 确保分享功能在 Web 和移动端都可用
