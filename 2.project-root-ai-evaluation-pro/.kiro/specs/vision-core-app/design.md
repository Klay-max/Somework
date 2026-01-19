# Design Document: VISION-CORE

## Overview

VISION-CORE 是一个基于 Expo 和 React Native 构建的跨平台教育测评应用，采用赛博朋克视觉风格。系统支持 Web 和移动端（Android/iOS），通过视觉扫描功能进行教育评估，并生成详细的 AI 学情诊断报告。

核心技术栈：
- **框架**: Expo SDK 51+ with TypeScript
- **路由**: expo-router (file-based routing)
- **样式**: NativeWind (Tailwind CSS for React Native)
- **动画**: react-native-reanimated
- **图表**: react-native-svg + react-native-gifted-charts
- **相机**: expo-camera (CameraView API)
- **图标**: lucide-react-native

## Architecture

### 项目结构

```
project-root/
├── app/                          # Expo Router 页面目录
│   ├── _layout.tsx              # 全局布局（深色主题配置）
│   ├── index.tsx                # 首页仪表盘
│   ├── camera.tsx               # 混合扫描终端
│   └── report/
│       └── [id].tsx             # 动态报告页面
├── components/                   # 可复用组件
│   ├── ui/                      # UI 基础组件
│   │   ├── Card.tsx            # 赛博朋克卡片
│   │   ├── Button.tsx          # 发光按钮
│   │   ├── StatusIndicator.tsx # 状态指示灯
│   │   └── ProgressBar.tsx     # 进度条
│   ├── dashboard/               # 仪表盘组件
│   │   ├── StatusBar.tsx       # 顶部状态栏
│   │   ├── MainControl.tsx     # 主控按钮
│   │   └── DataPanel.tsx       # 数据面板
│   ├── scanner/                 # 扫描相关组件
│   │   ├── Viewfinder.tsx      # 取景框
│   │   ├── MatrixAnimation.tsx # 矩阵动画
│   │   ├── WebUploader.tsx     # Web 上传组件
│   │   └── CameraView.tsx      # 移动端相机
│   └── report/                  # 报告组件
│       ├── ScoreCore.tsx       # 核心计分板
│       ├── AbilityRadar.tsx    # 五维雷达图
│       ├── DeepAnalysis.tsx    # 深度归因分析
│       ├── KnowledgeMatrix.tsx # 知识点矩阵
│       └── UpgradePath.tsx     # 提分路径
├── lib/                         # 工具库
│   ├── types.ts                # TypeScript 类型定义
│   ├── mockData.ts             # 模拟数据
│   └── utils.ts                # 工具函数
├── tailwind.config.js          # Tailwind 配置
├── babel.config.js             # Babel 配置
└── package.json
```

### 数据流架构

```
用户交互 → 页面组件 → 数据模型 → UI 渲染
                ↓
          平台检测逻辑
                ↓
        Web / 移动端分支
```

## Components and Interfaces

### 1. 全局布局组件 (`app/_layout.tsx`)

**职责**: 
- 配置全局深色主题
- 隐藏默认导航栏
- 设置 Stack 导航器

**实现要点**:
```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      />
    </>
  );
}
```

### 2. 首页仪表盘 (`app/index.tsx`)

**职责**:
- 展示 Bento Grid 布局
- 渲染状态栏、主控按钮、数据面板
- 处理导航至扫描页面

**布局结构**:
```
┌─────────────────────────────┐
│  StatusBar (SYSTEM ONLINE)  │ ← 绿色呼吸灯
├─────────────────────────────┤
│                             │
│    [主控按钮]               │ ← 发光效果
│    启动视觉诊断             │
│                             │
├─────────────────────────────┤
│  近期准确率: 89%            │ ← 模拟数据
│  扫描次数: 24               │
└─────────────────────────────┘
```

**关键样式**:
- 背景: `bg-black`
- 卡片: `bg-[#111111] border border-cyan-500/30`
- 主按钮: `shadow-[0_0_20px_rgba(0,255,255,0.5)]`

### 3. 混合扫描终端 (`app/camera.tsx`)

**职责**:
- 检测运行平台（Web vs 移动端）
- 渲染对应的扫描界面
- 处理扫描动画和结果展示

**平台检测逻辑**:
```typescript
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

return (
  <View className="flex-1 bg-black">
    {isWeb ? (
      <WebUploader onUpload={handleScan} />
    ) : (
      <CameraView onCapture={handleScan} />
    )}
    <Viewfinder />
    {isScanning && <MatrixAnimation />}
  </View>
);
```

**Web 上传组件** (`WebUploader.tsx`):
- 使用 `<input type="file" accept="image/*">`
- 拖拽区域视觉反馈
- 科幻风格边框和文案

**移动端相机组件** (`CameraView.tsx`):
- 使用 `expo-camera` 的 `CameraView`
- 请求相机权限
- 全屏预览 + 拍照按钮

### 4. 取景框组件 (`Viewfinder.tsx`)

**职责**:
- 在扫描区域上方叠加四角边框
- 不阻挡用户交互（`pointerEvents="none"`）

**实现**:
```typescript
<View className="absolute inset-0 items-center justify-center" pointerEvents="none">
  <View className="w-64 h-64 relative">
    {/* 左上角 */}
    <View className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
    {/* 右上角 */}
    <View className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
    {/* 左下角 */}
    <View className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
    {/* 右下角 */}
    <View className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
  </View>
</View>
```

### 5. 矩阵动画组件 (`MatrixAnimation.tsx`)

**职责**:
- 显示 3 秒矩阵代码流动画
- 使用 `react-native-reanimated` 实现

**实现思路**:
```typescript
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

// 生成随机字符流
const matrixChars = '01アイウエオカキクケコ';
// 使用 Animated.View 实现垂直滚动效果
```

### 6. 报告页面 (`app/report/[id].tsx`)

**职责**:
- 接收动态路由参数 `id`
- 加载对应报告数据
- 渲染可滚动的 Bento Grid 布局

**布局结构**:
```
ScrollView
├── ScoreCore (核心计分板)
├── AbilityRadar (五维雷达图)
├── DeepAnalysis (深度归因分析)
├── KnowledgeMatrix (知识点矩阵)
└── UpgradePath (提分路径)
```

### 7. 核心计分板 (`ScoreCore.tsx`)

**职责**:
- 显示环形进度条（得分 + 正确率）
- 显示横向对比进度条（全国/本省/本市）

**实现**:
- 使用 `react-native-svg` 绘制环形进度
- 使用 `react-native-reanimated` 实现动画效果

**数据结构**:
```typescript
interface ScoreData {
  score: number;        // 本次得分
  accuracy: number;     // 正确率 (0-100)
  national: number;     // 全国平均
  province: number;     // 本省平均
  city: number;         // 本市平均
}
```

### 8. 五维能力雷达图 (`AbilityRadar.tsx`)

**职责**:
- 绘制五维雷达图
- 支持动画加载效果

**维度**:
```typescript
interface AbilityData {
  listening: number;    // 听力 (0-100)
  grammar: number;      // 语法
  reading: number;      // 阅读
  cloze: number;        // 完形
  logic: number;        // 逻辑
}
```

**实现**:
- 使用 `react-native-gifted-charts` 的 `RadarChart`
- 配色: 半透明青色填充 + 高亮边框

### 9. 深度归因分析 (`DeepAnalysis.tsx`)

**职责**:
- 展示表层病灶（Tag 标签）
- 展示深层病根（红色警告框）
- 显示 AI 点评（打字机效果）

**数据结构**:
```typescript
interface AnalysisData {
  surface: string[];      // 表层病灶
  root: string[];         // 深层病根
  aiComment: string;      // AI 点评
}
```

**打字机效果实现**:
```typescript
const [displayedText, setDisplayedText] = useState('');

useEffect(() => {
  let index = 0;
  const interval = setInterval(() => {
    if (index < aiComment.length) {
      setDisplayedText(aiComment.slice(0, index + 1));
      index++;
    } else {
      clearInterval(interval);
    }
  }, 50); // 每 50ms 显示一个字符
  
  return () => clearInterval(interval);
}, [aiComment]);
```

### 10. 知识点矩阵 (`KnowledgeMatrix.tsx`)

**职责**:
- 显示知识点列表
- 支持展开/折叠详情
- 显示状态指示灯

**数据结构**:
```typescript
interface KnowledgePoint {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;  // 难度星级
  mastered: boolean;               // 是否掌握
  detail: string;                  // 详细解释
}
```

**状态指示灯**:
- 已掌握: `bg-green-500` (实心圆点)
- 未掌握: `bg-red-500 animate-pulse` (呼吸灯)

### 11. 提分路径 (`UpgradePath.tsx`)

**职责**:
- 展示技能树/时间轴样式的学习路径
- 支持点击展开阶段详情

**数据结构**:
```typescript
interface PathStage {
  id: string;
  title: string;           // 阶段标题
  content: string[];       // 学习内容
  videoLinks: string[];    // 视频课程链接
  duration: string;        // 预计完成时间
}
```

**视觉实现**:
- 使用连接线表示阶段递进
- 使用青色高亮当前阶段
- 使用灰色表示未完成阶段

## Data Models

### 报告数据模型

```typescript
// lib/types.ts

export interface ReportData {
  id: string;
  timestamp: string;
  score: ScoreData;
  ability: AbilityData;
  analysis: AnalysisData;
  knowledge: KnowledgePoint[];
  path: PathStage[];
}

export interface ScoreData {
  score: number;
  accuracy: number;
  national: number;
  province: number;
  city: number;
}

export interface AbilityData {
  listening: number;
  grammar: number;
  reading: number;
  cloze: number;
  logic: number;
}

export interface AnalysisData {
  surface: string[];
  root: string[];
  aiComment: string;
}

export interface KnowledgePoint {
  id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  mastered: boolean;
  detail: string;
}

export interface PathStage {
  id: string;
  title: string;
  content: string[];
  videoLinks: string[];
  duration: string;
}
```

### 模拟数据生成

```typescript
// lib/mockData.ts

export function generateMockReport(id: string): ReportData {
  return {
    id,
    timestamp: new Date().toISOString(),
    score: {
      score: 92,
      accuracy: 79,
      national: 75,
      province: 78,
      city: 80,
    },
    ability: {
      listening: 85,
      grammar: 90,
      reading: 88,
      cloze: 75,
      logic: 82,
    },
    analysis: {
      surface: ['涂改痕迹', '计算粗心', '审题不清'],
      root: ['长难句逻辑缺失', '缺乏验算机制'],
      aiComment: '本次测评显示你在基础知识掌握方面表现优秀，但在复杂问题的逻辑推理上仍有提升空间。建议加强长难句分析训练，并养成验算习惯。',
    },
    knowledge: [
      {
        id: '1',
        name: '一般现在时',
        difficulty: 2,
        mastered: true,
        detail: '用于描述经常发生的动作或状态',
      },
      {
        id: '2',
        name: '虚拟语气',
        difficulty: 4,
        mastered: false,
        detail: '用于表达假设、愿望或与事实相反的情况',
      },
      // ... 更多知识点
    ],
    path: [
      {
        id: '1',
        title: '基础修复',
        content: ['复习虚拟语气基础', '完成 20 道练习题'],
        videoLinks: ['https://example.com/video1'],
        duration: '2 周',
      },
      {
        id: '2',
        title: '强化训练',
        content: ['长难句分析训练', '模拟测试 5 套'],
        videoLinks: ['https://example.com/video2'],
        duration: '3 周',
      },
      // ... 更多阶段
    ],
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: 平台检测正确性
*For any* 运行环境，系统应该正确检测平台类型（Web 或移动端），并根据平台类型渲染对应的扫描界面组件
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 2: 导航一致性
*For any* 用户交互触发的导航操作，系统应该正确导航到目标页面，并传递必要的参数
**Validates: Requirements 4.6, 11.2**

### Property 3: 报告数据加载正确性
*For any* 有效的报告 ID，系统应该加载对应的报告数据，并且数据结构符合 TypeScript 接口定义
**Validates: Requirements 11.3, 18.2, 18.5**

### Property 4: 文件上传事件处理
*For any* 文件上传操作（拖拽或选择），系统应该提供视觉反馈并触发扫描分析流程
**Validates: Requirements 6.3, 6.4**

### Property 5: 相机权限处理
*For any* 相机权限请求结果（允许或拒绝），系统应该正确处理并显示相应的 UI 状态
**Validates: Requirements 7.3, 7.4**

### Property 6: 扫描动画流程
*For any* 扫描触发操作，系统应该显示矩阵动画 3 秒钟，然后显示分析结果
**Validates: Requirements 9.1, 9.2, 9.3, 9.5**

### Property 7: 图标跨平台渲染
*For any* 使用的图标组件，应该在 Web 和移动端都能正常渲染
**Validates: Requirements 10.4**

### Property 8: 计分板数据渲染
*For any* 有效的得分数据，核心计分板应该正确显示得分、正确率和对比数据
**Validates: Requirements 12.3, 12.4, 12.6**

### Property 9: 雷达图维度完整性
*For any* 能力数据，雷达图应该包含且仅包含五个维度（听力、语法、阅读、完形、逻辑）
**Validates: Requirements 13.3**

### Property 10: 雷达图动画触发
*For any* 雷达图组件加载，应该触发动画效果
**Validates: Requirements 13.7**

### Property 11: 错误分析分类
*For any* 分析数据，系统应该将错误原因正确分为表层病灶和深层病根两类，并使用不同的样式渲染
**Validates: Requirements 14.1, 14.2, 14.3**

### Property 12: AI 点评渲染
*For any* AI 点评文本，系统应该完整显示点评内容
**Validates: Requirements 14.4**

### Property 13: 打字机效果
*For any* AI 点评文本，系统应该模拟打字机效果逐字显示
**Validates: Requirements 14.5**

### Property 14: 知识点数据完整性
*For any* 知识点，系统应该显示名称、难度星级和掌握状态三个字段
**Validates: Requirements 15.2**

### Property 15: 知识点状态指示
*For any* 知识点，根据掌握状态应该显示对应颜色的指示灯（已掌握=绿色，未掌握=红色）
**Validates: Requirements 15.3, 15.4**

### Property 16: 知识点展开交互
*For any* 知识点行，点击后应该切换展开/折叠状态并显示详细解释
**Validates: Requirements 15.5, 15.6**

### Property 17: 难度星级渲染
*For any* 知识点难度值（1-5），系统应该渲染对应数量的星级图标
**Validates: Requirements 15.7**

### Property 18: 学习路径阶段结构
*For any* 学习路径数据，每个阶段应该包含标题、学习内容、视频链接和预计完成时间
**Validates: Requirements 16.2, 16.3, 16.4, 16.5**

### Property 19: 阶段展开交互
*For any* 学习路径阶段，点击后应该显示该阶段的详细内容
**Validates: Requirements 16.7**

### Property 20: 图表跨平台渲染
*For any* 图表组件，应该在 Web 和移动端都能正常渲染
**Validates: Requirements 17.3**

### Property 21: 图表动画支持
*For any* 图表组件，应该支持动画效果
**Validates: Requirements 17.4**

### Property 22: 模拟数据生成
*For any* 报告 ID，模拟数据生成函数应该返回符合 ReportData 接口的完整数据对象
**Validates: Requirements 18.3**

### Property 23: 延迟加载行为
*For any* 非首屏可见的图表组件，应该在滚动到可见区域时才加载
**Validates: Requirements 19.2**

### Property 24: 加载状态显示
*For any* 数据加载过程，系统应该显示骨架屏或加载动画
**Validates: Requirements 19.5**

### Property 25: 分享功能触发
*For any* 分享按钮点击，系统应该生成报告截图或链接
**Validates: Requirements 20.2**

### Property 26: 分享内容完整性
*For any* 分享操作，分享内容应该包含报告摘要信息
**Validates: Requirements 20.4**

### Property 27: 分享跨平台支持
*For any* 平台（Web 或移动端），分享功能应该可用
**Validates: Requirements 20.5**

## Error Handling

### 1. 相机权限错误
- **场景**: 用户拒绝相机权限
- **处理**: 显示友好的错误提示，说明需要相机权限才能使用扫描功能
- **UI**: 使用赛博朋克风格的错误对话框，红色边框 + 警告图标

### 2. 文件上传错误
- **场景**: 用户上传非图片文件或文件过大
- **处理**: 验证文件类型和大小，显示错误提示
- **UI**: 在上传区域显示红色边框和错误信息

### 3. 数据加载错误
- **场景**: 报告数据加载失败或 ID 无效
- **处理**: 显示错误页面，提供返回首页的按钮
- **UI**: 使用赛博朋克风格的错误页面，包含错误代码和描述

### 4. 平台不支持错误
- **场景**: 某些功能在特定平台不可用
- **处理**: 优雅降级，提供替代方案或说明
- **UI**: 显示信息提示，不阻断用户流程

### 5. 网络错误（未来 API 集成）
- **场景**: API 请求失败
- **处理**: 重试机制 + 错误提示
- **UI**: 显示重试按钮和错误信息

## Testing Strategy

### 单元测试 (Unit Tests)

使用 **Jest** 和 **React Native Testing Library** 进行单元测试。

**测试重点**:
1. **组件渲染测试**: 验证组件正确渲染预期的 UI 元素
2. **交互测试**: 验证用户交互（点击、输入）触发正确的行为
3. **条件渲染测试**: 验证基于 props 或 state 的条件渲染逻辑
4. **错误处理测试**: 验证错误场景下的 UI 和行为

**示例测试**:
```typescript
// components/dashboard/MainControl.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { MainControl } from './MainControl';

describe('MainControl', () => {
  it('should render button with correct text', () => {
    const { getByText } = render(<MainControl onPress={() => {}} />);
    expect(getByText('启动视觉诊断 (INITIATE SCAN)')).toBeTruthy();
  });

  it('should call onPress when button is clicked', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MainControl onPress={onPress} />);
    fireEvent.press(getByText('启动视觉诊断 (INITIATE SCAN)'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### 属性测试 (Property-Based Tests)

使用 **fast-check** 进行属性测试，验证通用属性在各种输入下都成立。

**配置**: 每个属性测试运行 **100 次迭代**

**测试重点**:
1. **数据转换属性**: 验证数据处理函数的正确性
2. **UI 渲染属性**: 验证组件在各种数据输入下都能正确渲染
3. **交互属性**: 验证用户交互在各种状态下都能正确处理
4. **跨平台属性**: 验证功能在不同平台下的一致性

**示例测试**:
```typescript
// lib/mockData.test.ts
import fc from 'fast-check';
import { generateMockReport } from './mockData';

describe('generateMockReport', () => {
  it('Property 22: should generate valid report data for any ID', () => {
    // Feature: vision-core-app, Property 22: 模拟数据生成
    fc.assert(
      fc.property(fc.string(), (id) => {
        const report = generateMockReport(id);
        
        // 验证数据结构完整性
        expect(report.id).toBe(id);
        expect(report.score).toBeDefined();
        expect(report.ability).toBeDefined();
        expect(report.analysis).toBeDefined();
        expect(report.knowledge).toBeInstanceOf(Array);
        expect(report.path).toBeInstanceOf(Array);
        
        // 验证数据类型
        expect(typeof report.score.score).toBe('number');
        expect(typeof report.score.accuracy).toBe('number');
        expect(typeof report.ability.listening).toBe('number');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// components/report/ScoreCore.test.tsx
import fc from 'fast-check';
import { render } from '@testing-library/react-native';
import { ScoreCore } from './ScoreCore';

describe('ScoreCore', () => {
  it('Property 8: should render score data correctly for any valid input', () => {
    // Feature: vision-core-app, Property 8: 计分板数据渲染
    fc.assert(
      fc.property(
        fc.record({
          score: fc.integer({ min: 0, max: 100 }),
          accuracy: fc.integer({ min: 0, max: 100 }),
          national: fc.integer({ min: 0, max: 100 }),
          province: fc.integer({ min: 0, max: 100 }),
          city: fc.integer({ min: 0, max: 100 }),
        }),
        (scoreData) => {
          const { getByText } = render(<ScoreCore data={scoreData} />);
          
          // 验证得分显示
          expect(getByText(scoreData.score.toString())).toBeTruthy();
          
          // 验证正确率显示
          expect(getByText(`${scoreData.accuracy}%`)).toBeTruthy();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 集成测试

**测试重点**:
1. **页面导航流程**: 验证从首页 → 扫描页 → 报告页的完整流程
2. **数据流转**: 验证数据在组件间正确传递
3. **平台适配**: 验证 Web 和移动端的功能一致性

### 端到端测试 (E2E)

使用 **Detox** (移动端) 或 **Playwright** (Web) 进行端到端测试。

**测试场景**:
1. 用户打开应用 → 点击主控按钮 → 进入扫描页面
2. 用户上传图片 → 查看扫描动画 → 查看报告
3. 用户在报告页面滚动 → 展开知识点 → 点击学习路径

## Performance Considerations

### 1. 列表虚拟化
- 使用 `FlatList` 或 `FlashList` 渲染长列表
- 只渲染可见区域的项目，减少内存占用

### 2. 图表懒加载
- 使用 `React.lazy` 和 `Suspense` 延迟加载图表组件
- 在滚动到可见区域时才渲染图表

### 3. 动画优化
- 使用 `react-native-reanimated` 在 UI 线程运行动画
- 避免在动画过程中进行复杂计算

### 4. 图片优化
- 压缩上传的图片
- 使用适当的图片格式和尺寸

### 5. 代码分割
- 使用动态 import 分割代码
- 按路由分割，减少初始加载时间

## Deployment Strategy

### Web 部署
```bash
# 构建 Web 版本
npx expo export:web

# 部署到静态托管服务（Vercel, Netlify, etc.）
```

### 移动端部署
```bash
# 构建 Android APK
eas build --platform android

# 构建 iOS IPA
eas build --platform ios

# 提交到应用商店
eas submit
```

## Future Enhancements

1. **后端 API 集成**: 替换模拟数据为真实 API 调用
2. **用户认证**: 添加登录/注册功能
3. **历史记录**: 保存和查看历史扫描记录
4. **数据同步**: 跨设备同步用户数据
5. **离线支持**: 支持离线查看报告
6. **多语言支持**: 国际化（i18n）
7. **主题切换**: 支持多种赛博朋克主题
8. **社交分享**: 分享到社交媒体平台
9. **推送通知**: 学习提醒和进度通知
10. **AI 对话**: 与 AI 助手对话，获取学习建议
