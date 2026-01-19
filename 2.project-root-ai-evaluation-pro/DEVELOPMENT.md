# VISION-CORE 开发文档

## 组件使用说明

### UI 基础组件

#### Card
赛博朋克风格卡片组件。

```tsx
import { Card } from '@/components/ui/Card';

<Card className="p-4">
  <Text>内容</Text>
</Card>
```

#### Button
带霓虹光晕效果的按钮。

```tsx
import { Button } from '@/components/ui/Button';

<Button 
  variant="primary"  // 或 "secondary"
  onPress={() => console.log('pressed')}
>
  按钮文本
</Button>
```

#### StatusIndicator
状态指示灯（支持呼吸灯动画）。

```tsx
import { StatusIndicator } from '@/components/ui/StatusIndicator';

<StatusIndicator 
  status="success"  // 或 "error", "warning"
  size={12}
  animated={true}
/>
```

#### ProgressBar
横向进度条（支持动画）。

```tsx
import { ProgressBar } from '@/components/ui/ProgressBar';

<ProgressBar
  value={75}
  color="cyan"  // 或 "green", "gray"
  showLabel={true}
  label="进度"
/>
```

### 报告组件

#### ScoreCore
核心计分板（环形进度条 + 对比数据）。

```tsx
import { ScoreCore } from '@/components/report/ScoreCore';

<ScoreCore data={scoreData} />
```

#### AbilityRadar
五维能力雷达图。

```tsx
import { AbilityRadar } from '@/components/report/AbilityRadar';

<AbilityRadar data={abilityData} />
```

#### DeepAnalysis
深度归因分析（表层/深层 + AI 点评）。

```tsx
import { DeepAnalysis } from '@/components/report/DeepAnalysis';

<DeepAnalysis data={analysisData} />
```

#### KnowledgeMatrix
知识点矩阵（状态指示灯 + 可展开）。

```tsx
import { KnowledgeMatrix } from '@/components/report/KnowledgeMatrix';

<KnowledgeMatrix data={knowledgePoints} />
```

#### UpgradePath
提分路径规划（时间轴样式）。

```tsx
import { UpgradePath } from '@/components/report/UpgradePath';

<UpgradePath data={pathStages} />
```

## 数据模型说明

### ReportData
完整报告数据结构。

```typescript
interface ReportData {
  id: string;               // 报告 ID
  timestamp: string;        // 生成时间
  score: ScoreData;         // 得分数据
  ability: AbilityData;     // 能力维度
  analysis: AnalysisData;   // 错误分析
  knowledge: KnowledgePoint[]; // 知识点列表
  path: PathStage[];        // 学习路径
}
```

### 生成模拟数据

```typescript
import { generateMockReport } from '@/lib/mockData';

const report = generateMockReport('report-123');
```

## 样式系统

### Tailwind CSS 类名

项目使用 NativeWind，支持 Tailwind CSS 类名。

**赛博朋克主题色**：
- `text-cyan-400` - 青色文本
- `text-green-400` - 绿色文本
- `bg-black` - 纯黑背景
- `bg-[#111111]` - 深灰背景
- `border-cyan-500/30` - 半透明青色边框

**常用组合**：
```tsx
// 卡片样式
className="bg-[#111111] border border-cyan-500/30 rounded-lg p-4"

// 按钮样式
className="bg-cyan-500/20 border-2 border-cyan-500 px-6 py-4 rounded-lg"

// 文本样式
className="text-cyan-400 text-lg font-bold tracking-wider"
```

## 动画

### react-native-reanimated

项目使用 `react-native-reanimated` 实现流畅动画。

**示例：淡入动画**

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withTiming(1, { duration: 1000 });
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

<Animated.View style={animatedStyle}>
  <Text>内容</Text>
</Animated.View>
```

## 平台检测

### 判断运行平台

```typescript
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// 条件渲染
{isWeb ? <WebComponent /> : <MobileComponent />}
```

## 路由导航

### Expo Router

项目使用 `expo-router` 进行文件系统路由。

**导航到页面**：
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// 导航到扫描页面
router.push('/camera');

// 导航到报告页面（带参数）
router.push(`/report/${reportId}`);

// 返回上一页
router.back();
```

**获取路由参数**：
```typescript
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

## 调试技巧

### 查看日志

```bash
# Web 端：浏览器控制台
# 移动端：Metro Bundler 终端

# 或使用 React Native Debugger
```

### 常见问题

1. **样式不生效**：检查 Tailwind 类名是否正确，确保 NativeWind 配置正确
2. **动画卡顿**：使用 `react-native-reanimated` 而不是 `Animated` API
3. **图片不显示**：检查 assets 目录中的文件是否存在

## 性能优化建议

1. **使用 memo**：对复杂组件使用 `React.memo` 避免不必要的重渲染
2. **懒加载**：对大型组件使用 `React.lazy` 和 `Suspense`
3. **虚拟化列表**：长列表使用 `FlatList` 而不是 `ScrollView`
4. **图片优化**：压缩图片，使用适当的格式和尺寸

## 测试

### 运行测试

```bash
npm test
```

### 编写测试

```typescript
import { render } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button>Test</Button>);
    expect(getByText('Test')).toBeTruthy();
  });
});
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License
