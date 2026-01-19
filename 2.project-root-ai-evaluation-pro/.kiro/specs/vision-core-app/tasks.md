# Implementation Plan: VISION-CORE

## Overview

本实现计划将 VISION-CORE 赛博朋克风格教育测评应用分解为可执行的开发任务。项目使用 Expo + TypeScript + React Native 技术栈，支持 Web 和移动端双平台。

## Tasks

- [x] 1. 项目初始化和基础配置
  - 使用 `npx create-expo-app@latest` 创建 TypeScript 项目
  - 安装核心依赖：expo-router, nativewind, tailwindcss, react-native-reanimated
  - 安装功能依赖：expo-camera, lucide-react-native, react-native-svg, react-native-gifted-charts
  - 配置 tailwind.config.js（扫描 app 目录，添加赛博朋克主题色）
  - 配置 babel.config.js（添加 nativewind/babel 插件）
  - 配置 package.json 脚本（web, android, ios）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.4, 10.1, 13.1, 17.1, 17.2_

- [ ]* 1.1 编写配置文件验证测试
  - 验证 tailwind.config.js 包含正确的 content 路径
  - 验证 babel.config.js 包含 nativewind 插件
  - 验证 package.json 包含所有必需依赖
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2_

- [x] 2. 创建类型定义和数据模型
  - [x] 2.1 创建 lib/types.ts 文件
    - 定义 ReportData, ScoreData, AbilityData, AnalysisData 接口
    - 定义 KnowledgePoint, PathStage 接口
    - 确保所有字段类型安全
    - _Requirements: 18.1, 18.2, 18.5_

  - [x] 2.2 创建 lib/mockData.ts 文件
    - 实现 generateMockReport 函数
    - 生成符合接口定义的模拟数据
    - _Requirements: 18.3_

  - [ ]* 2.3 编写属性测试验证数据模型
    - **Property 22: 模拟数据生成**
    - **Validates: Requirements 18.3**
    - 使用 fast-check 验证 generateMockReport 对任意 ID 都返回有效数据

- [x] 3. 创建全局布局和主题配置
  - [x] 3.1 创建 app/_layout.tsx
    - 配置 Stack 导航器，隐藏 header
    - 设置全局黑色背景 (#000000)
    - 配置 StatusBar 为 light 模式
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 3.2 编写布局组件测试
    - 验证 headerShown 为 false
    - 验证背景色为 #000000
    - _Requirements: 3.1, 3.2_

- [x] 4. 实现 UI 基础组件
  - [x] 4.1 创建 components/ui/Card.tsx
    - 实现赛博朋克风格卡片（深灰背景 + 青色边框）
    - 支持自定义样式和子组件
    - _Requirements: 4.5_

  - [x] 4.2 创建 components/ui/Button.tsx
    - 实现带发光效果的按钮
    - 使用 shadow 实现霓虹光晕
    - 支持 onPress 回调
    - _Requirements: 4.3_

  - [x] 4.3 创建 components/ui/StatusIndicator.tsx
    - 实现状态指示灯组件（绿色/红色）
    - 支持呼吸灯动画（使用 react-native-reanimated）
    - _Requirements: 15.3, 15.4_

  - [x] 4.4 创建 components/ui/ProgressBar.tsx
    - 实现横向进度条组件
    - 支持自定义颜色和百分比
    - _Requirements: 12.5, 12.6_

- [x] 5. 实现首页仪表盘
  - [x] 5.1 创建 components/dashboard/StatusBar.tsx
    - 显示 "SYSTEM ONLINE" 文本
    - 添加绿色呼吸灯动画
    - _Requirements: 4.2_

  - [x] 5.2 创建 components/dashboard/MainControl.tsx
    - 实现主控按钮，文案 "启动视觉诊断 (INITIATE SCAN)"
    - 添加发光效果
    - 接收 onPress 回调
    - _Requirements: 4.3_

  - [x] 5.3 创建 components/dashboard/DataPanel.tsx
    - 显示模拟数据（近期准确率 89%）
    - 使用 Card 组件包裹
    - _Requirements: 4.4_

  - [x] 5.4 创建 app/index.tsx
    - 组合 StatusBar, MainControl, DataPanel
    - 实现 Bento Grid 布局
    - 处理导航至 /camera
    - _Requirements: 4.1, 4.6_

  - [ ]* 5.5 编写仪表盘组件测试
    - 验证 "SYSTEM ONLINE" 文本存在
    - 验证主控按钮文案正确
    - 验证模拟数据显示
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 5.6 编写导航属性测试
    - **Property 2: 导航一致性**
    - **Validates: Requirements 4.6**
    - 验证点击主控按钮导航至 /camera

- [x] 6. Checkpoint - 验证基础功能
  - 确保项目可以在 Web 和移动端运行
  - 确保首页仪表盘正确显示
  - 确保所有测试通过
  - 如有问题，询问用户

- [x] 7. 实现扫描终端核心组件
  - [x] 7.1 创建 components/scanner/Viewfinder.tsx
    - 实现四角青色边框取景框
    - 使用 pointerEvents="none" 不阻挡交互
    - 居中显示，合适尺寸
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.2 创建 components/scanner/MatrixAnimation.tsx
    - 实现矩阵代码流动画
    - 使用 react-native-reanimated
    - 持续 3 秒钟
    - _Requirements: 9.1, 9.2_

  - [x] 7.3 创建 components/scanner/WebUploader.tsx
    - 实现文件上传拖拽区（仅 Web）
    - 使用 <input type="file" accept="image/*">
    - 提供拖拽视觉反馈
    - 触发 onUpload 回调
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.4 创建 components/scanner/CameraView.tsx
    - 使用 expo-camera 的 CameraView 组件
    - 请求相机权限
    - 处理权限拒绝情况
    - 全屏显示相机预览
    - 提供拍照按钮
    - 触发 onCapture 回调
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 7.5 编写取景框组件测试
    - 验证四个角元素存在
    - 验证 pointerEvents 属性
    - _Requirements: 8.2, 8.4_

  - [ ]* 7.6 编写文件上传属性测试
    - **Property 4: 文件上传事件处理**
    - **Validates: Requirements 6.3, 6.4**
    - 验证文件上传触发回调

  - [ ]* 7.7 编写相机权限属性测试
    - **Property 5: 相机权限处理**
    - **Validates: Requirements 7.3, 7.4**
    - 验证权限请求和错误处理

- [x] 8. 实现扫描终端页面
  - [x] 8.1 创建 app/camera.tsx
    - 检测平台类型（Platform.OS === 'web'）
    - Web 端渲染 WebUploader
    - 移动端渲染 CameraView
    - 叠加 Viewfinder 组件
    - 处理扫描触发，显示 MatrixAnimation
    - 3 秒后显示模拟结果（Alert 或 Modal）
    - 导航至报告页面
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.3, 9.4, 9.5, 11.2_

  - [ ]* 8.2 编写平台检测属性测试
    - **Property 1: 平台检测正确性**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - 验证不同平台渲染对应组件

  - [ ]* 8.3 编写扫描动画属性测试
    - **Property 6: 扫描动画流程**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.5**
    - 验证动画显示 3 秒后显示结果

- [x] 9. Checkpoint - 验证扫描功能
  - 确保扫描页面在 Web 和移动端正确显示
  - 确保平台检测逻辑正确
  - 确保扫描动画和结果展示正常
  - 确保所有测试通过
  - 如有问题，询问用户

- [x] 10. 实现报告页面核心组件 - 计分板
  - [x] 10.1 创建 components/report/ScoreCore.tsx
    - 使用 react-native-svg 绘制环形进度条
    - 显示得分和正确率
    - 显示 3 个横向对比进度条（全国/本省/本市）
    - 使用青色高亮用户数据，灰色显示对比数据
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 10.2 编写计分板属性测试
    - **Property 8: 计分板数据渲染**
    - **Validates: Requirements 12.3, 12.4, 12.6**
    - 验证任意有效数据都能正确渲染

- [x] 11. 实现报告页面核心组件 - 雷达图
  - [x] 11.1 创建 components/report/AbilityRadar.tsx
    - 使用 react-native-gifted-charts 的 RadarChart
    - 包含五个维度：听力、语法、阅读、完形、逻辑
    - 透明背景，深灰色网格线
    - 半透明青色填充，高亮青色边框
    - 添加加载动画
    - _Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ]* 11.2 编写雷达图属性测试
    - **Property 9: 雷达图维度完整性**
    - **Validates: Requirements 13.3**
    - 验证雷达图包含且仅包含五个维度

  - [ ]* 11.3 编写雷达图动画属性测试
    - **Property 10: 雷达图动画触发**
    - **Validates: Requirements 13.7**
    - 验证组件加载时触发动画

- [x] 12. 实现报告页面核心组件 - 深度分析
  - [x] 12.1 创建 components/report/DeepAnalysis.tsx
    - 显示表层病灶（Tag 标签样式）
    - 显示深层病根（红色警告框样式）
    - 显示 AI 点评文本
    - 实现打字机效果（逐字显示）
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 12.2 编写深度分析属性测试
    - **Property 11: 错误分析分类**
    - **Validates: Requirements 14.1, 14.2, 14.3**
    - 验证错误原因正确分类和渲染

  - [ ]* 12.3 编写 AI 点评属性测试
    - **Property 12: AI 点评渲染**
    - **Validates: Requirements 14.4**
    - 验证点评文本完整显示

  - [ ]* 12.4 编写打字机效果属性测试
    - **Property 13: 打字机效果**
    - **Validates: Requirements 14.5**
    - 验证文本逐字显示

- [x] 13. 实现报告页面核心组件 - 知识点矩阵
  - [x] 13.1 创建 components/report/KnowledgeMatrix.tsx
    - 显示知识点列表
    - 显示名称、难度星级、掌握状态
    - 根据掌握状态显示绿色/红色指示灯
    - 支持点击展开/折叠详情
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 13.2 编写知识点数据属性测试
    - **Property 14: 知识点数据完整性**
    - **Validates: Requirements 15.2**
    - 验证所有字段都正确显示

  - [ ]* 13.3 编写知识点状态属性测试
    - **Property 15: 知识点状态指示**
    - **Validates: Requirements 15.3, 15.4**
    - 验证状态指示灯颜色正确

  - [ ]* 13.4 编写知识点交互属性测试
    - **Property 16: 知识点展开交互**
    - **Validates: Requirements 15.5, 15.6**
    - 验证点击切换展开/折叠状态

  - [ ]* 13.5 编写难度星级属性测试
    - **Property 17: 难度星级渲染**
    - **Validates: Requirements 15.7**
    - 验证星级数量正确

- [x] 14. 实现报告页面核心组件 - 提分路径
  - [x] 14.1 创建 components/report/UpgradePath.tsx
    - 使用技能树或时间轴样式
    - 显示多个阶段（基础修复、强化训练、冲刺提升）
    - 每个阶段显示标题、学习内容、视频链接、预计完成时间
    - 使用连接线或箭头表示递进关系
    - 支持点击展开阶段详情
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 14.2 编写学习路径属性测试
    - **Property 18: 学习路径阶段结构**
    - **Validates: Requirements 16.2, 16.3, 16.4, 16.5**
    - 验证每个阶段包含所有必需字段

  - [ ]* 14.3 编写阶段交互属性测试
    - **Property 19: 阶段展开交互**
    - **Validates: Requirements 16.7**
    - 验证点击显示详细内容

- [x] 15. 实现报告页面主页面
  - [x] 15.1 创建 app/report/[id].tsx
    - 接收动态路由参数 id
    - 使用 generateMockReport 加载数据
    - 使用 ScrollView 实现可滚动布局
    - 组合所有报告组件（ScoreCore, AbilityRadar, DeepAnalysis, KnowledgeMatrix, UpgradePath）
    - 使用 Bento Grid 布局
    - 添加分享按钮
    - _Requirements: 11.1, 11.3, 11.4, 11.5, 20.1_

  - [ ]* 15.2 编写报告数据加载属性测试
    - **Property 3: 报告数据加载正确性**
    - **Validates: Requirements 11.3, 18.2, 18.5**
    - 验证任意有效 ID 都能加载正确数据

- [x] 16. Checkpoint - 验证报告页面
  - 确保报告页面正确显示所有模块
  - 确保数据正确渲染
  - 确保交互功能正常
  - 确保所有测试通过
  - 如有问题，询问用户

- [x] 17. 实现性能优化
  - [x] 17.1 实现知识点列表虚拟化
    - 使用 FlatList 替代 ScrollView 渲染知识点列表
    - _Requirements: 19.1_

  - [x] 17.2 实现图表懒加载
    - 使用 React.lazy 和 Suspense 延迟加载图表组件
    - 添加加载骨架屏
    - _Requirements: 19.2, 19.5_

  - [ ]* 17.3 编写懒加载属性测试
    - **Property 23: 延迟加载行为**
    - **Validates: Requirements 19.2**
    - 验证非首屏组件延迟加载

  - [ ]* 17.4 编写加载状态属性测试
    - **Property 24: 加载状态显示**
    - **Validates: Requirements 19.5**
    - 验证加载时显示骨架屏

- [x] 18. 实现分享功能
  - [x] 18.1 创建分享功能
    - 使用 expo-sharing 或 react-native-share
    - 生成报告摘要信息
    - 支持 Web 和移动端
    - _Requirements: 20.2, 20.3, 20.4, 20.5_

  - [ ]* 18.2 编写分享功能属性测试
    - **Property 25: 分享功能触发**
    - **Validates: Requirements 20.2**
    - 验证点击分享按钮触发分享

  - [ ]* 18.3 编写分享内容属性测试
    - **Property 26: 分享内容完整性**
    - **Validates: Requirements 20.4**
    - 验证分享内容包含摘要信息

  - [ ]* 18.4 编写分享跨平台属性测试
    - **Property 27: 分享跨平台支持**
    - **Validates: Requirements 20.5**
    - 验证分享功能在不同平台可用

- [x] 19. 实现跨平台兼容性测试
  - [ ]* 19.1 编写图标跨平台属性测试
    - **Property 7: 图标跨平台渲染**
    - **Validates: Requirements 10.4**
    - 验证图标在 Web 和移动端都能渲染

  - [ ]* 19.2 编写图表跨平台属性测试
    - **Property 20: 图表跨平台渲染**
    - **Validates: Requirements 17.3**
    - 验证图表在 Web 和移动端都能渲染

  - [ ]* 19.3 编写图表动画属性测试
    - **Property 21: 图表动画支持**
    - **Validates: Requirements 17.4**
    - 验证图表支持动画效果

- [x] 20. 最终集成和测试
  - 运行所有单元测试和属性测试
  - 在 Web 端测试完整流程
  - 在 Android 模拟器测试完整流程
  - 在 iOS 模拟器测试完整流程
  - 修复发现的问题
  - 确保所有功能正常工作

- [x] 21. 文档和部署准备
  - ✅ 编写 README.md（项目介绍、安装步骤、运行命令）
  - ✅ 编写开发文档（组件使用说明、数据模型说明）
  - ✅ 准备部署配置（Web 和移动端）
  - ⚠️ 创建示例截图和演示视频（需要真实设备运行后截图）

## Notes

- 任务标记 `*` 的为可选测试任务，可以跳过以加快 MVP 开发
- 每个任务都关联了具体的需求编号，便于追溯
- Checkpoint 任务用于阶段性验证，确保增量开发的正确性
- 属性测试使用 fast-check，每个测试运行 100 次迭代
- 单元测试使用 Jest 和 React Native Testing Library
- 所有测试都应该在实现对应功能后立即编写和运行
