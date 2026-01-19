# 需求文档 - AI 功能集成

## 简介

本文档定义 VISION-CORE 项目的 AI 功能集成需求，包括答题卡识别、错误分析和个性化学习路径生成。系统将集成阿里云 OCR API 用于图像识别，DeepSeek API 用于智能分析。

## 术语表

- **System**: VISION-CORE 应用系统
- **OCR_Service**: 阿里云 OCR 服务
- **AI_Service**: DeepSeek 大语言模型服务
- **Answer_Sheet**: 答题卡图像
- **Recognition_Result**: OCR 识别结果
- **Analysis_Report**: AI 生成的分析报告
- **Learning_Path**: 个性化学习路径
- **API_Client**: API 调用客户端
- **Backend_Service**: 后端服务（处理 API 密钥和敏感操作）

## 需求

### 需求 1: 答题卡图像识别

**用户故事:** 作为用户，我想上传答题卡照片并自动识别答案，这样我就不需要手动输入答案。

#### 验收标准

1. WHEN 用户上传答题卡图像 THEN THE System SHALL 调用 OCR_Service 识别图像内容
2. WHEN OCR_Service 返回识别结果 THEN THE System SHALL 解析并提取选择题答案（A/B/C/D）
3. WHEN 识别结果包含手写内容 THEN THE System SHALL 提取手写文字并标记为主观题答案
4. IF 图像质量不足或识别失败 THEN THE System SHALL 返回明确的错误信息并提示用户重新拍摄
5. WHEN 识别完成 THEN THE System SHALL 在 3 秒内返回结构化的答案数据

### 需求 2: 答案对比与评分

**用户故事:** 作为用户，我想系统自动对比我的答案和标准答案，这样我就能快速知道得分和错题。

#### 验收标准

1. THE System SHALL 存储标准答案库（题目 ID 映射到正确答案）
2. WHEN 识别出用户答案 THEN THE System SHALL 与标准答案逐题对比
3. WHEN 对比完成 THEN THE System SHALL 计算总分、正确率和各维度得分
4. WHEN 发现错题 THEN THE System SHALL 记录错题编号、用户答案和正确答案
5. THE System SHALL 支持多种题型（单选、多选、填空、主观题）

### 需求 3: 错误模式分析

**用户故事:** 作为用户，我想了解我的错误模式和薄弱知识点，这样我就能有针对性地学习。

#### 验收标准

1. WHEN 用户完成答题 THEN THE System SHALL 将错题数据发送给 AI_Service 进行分析
2. WHEN AI_Service 分析错题 THEN THE System SHALL 识别表层错误（如粗心、审题不清）
3. WHEN AI_Service 分析错题 THEN THE System SHALL 识别深层原因（如知识点缺失、逻辑推理弱）
4. WHEN 分析完成 THEN THE System SHALL 生成知识点掌握矩阵（已掌握/待加强）
5. THE System SHALL 为每个知识点标注难度等级（1-5 星）

### 需求 4: AI 智能点评

**用户故事:** 作为用户，我想获得 AI 对我答题情况的专业点评，这样我就能理解自己的优势和不足。

#### 验收标准

1. WHEN 错误分析完成 THEN THE System SHALL 调用 AI_Service 生成个性化点评
2. WHEN 生成点评 THEN THE AI_Service SHALL 分析用户的答题习惯和思维模式
3. WHEN 生成点评 THEN THE AI_Service SHALL 提供具体的改进建议（不少于 3 条）
4. WHEN 点评生成 THEN THE System SHALL 确保点评内容专业、准确且易于理解
5. THE System SHALL 限制点评长度在 200-500 字之间

### 需求 5: 个性化学习路径生成

**用户故事:** 作为用户，我想获得个性化的学习路径规划，这样我就能高效地提升成绩。

#### 验收标准

1. WHEN 错误分析完成 THEN THE System SHALL 调用 AI_Service 生成学习路径
2. WHEN 生成学习路径 THEN THE AI_Service SHALL 根据薄弱知识点制定 3-5 个学习阶段
3. WHEN 生成学习路径 THEN THE System SHALL 为每个阶段提供具体学习内容和预计时长
4. WHEN 生成学习路径 THEN THE System SHALL 推荐相关视频课程链接（如果有）
5. THE System SHALL 按照优先级排序学习内容（先基础后进阶）

### 需求 6: 阿里云 OCR API 集成

**用户故事:** 作为系统，我需要安全地调用阿里云 OCR API，这样我就能识别答题卡图像。

#### 验收标准

1. THE System SHALL 使用阿里云 OCR 通用文字识别 API
2. WHEN 调用 OCR API THEN THE System SHALL 使用 AccessKey 和 AccessSecret 进行身份验证
3. WHEN 上传图像 THEN THE System SHALL 支持 JPEG、PNG 格式，最大 4MB
4. IF API 调用失败 THEN THE System SHALL 重试最多 3 次，间隔 1 秒
5. THE System SHALL 将 API 密钥存储在后端环境变量中，不暴露给前端

### 需求 7: DeepSeek API 集成

**用户故事:** 作为系统，我需要安全地调用 DeepSeek API，这样我就能生成智能分析和建议。

#### 验收标准

1. THE System SHALL 使用 DeepSeek Chat API（deepseek-chat 模型）
2. WHEN 调用 DeepSeek API THEN THE System SHALL 使用 API Key 进行身份验证
3. WHEN 发送分析请求 THEN THE System SHALL 构造结构化的 prompt（包含错题数据和分析要求）
4. WHEN 接收 AI 响应 THEN THE System SHALL 解析 JSON 格式的分析结果
5. THE System SHALL 将 API Key 存储在后端环境变量中，不暴露给前端
6. THE System SHALL 设置合理的 token 限制（max_tokens: 2000）和温度参数（temperature: 0.7）

### 需求 8: 后端 API 服务

**用户故事:** 作为系统架构师，我需要一个后端服务来处理敏感的 API 调用，这样前端就不会暴露 API 密钥。

#### 验收标准

1. THE System SHALL 提供后端 API 服务（使用 Node.js/Express 或 Serverless 函数）
2. THE Backend_Service SHALL 提供 `/api/ocr` 端点用于 OCR 识别
3. THE Backend_Service SHALL 提供 `/api/analyze` 端点用于 AI 分析
4. THE Backend_Service SHALL 提供 `/api/generate-path` 端点用于生成学习路径
5. WHEN 前端调用后端 API THEN THE Backend_Service SHALL 验证请求来源和用户身份
6. THE Backend_Service SHALL 实现请求频率限制（每用户每分钟最多 10 次请求）

### 需求 9: 数据存储与历史记录

**用户故事:** 作为用户，我想查看我的历史测评记录，这样我就能追踪学习进度。

#### 验收标准

1. THE System SHALL 将每次测评结果存储到数据库（或本地存储）
2. WHEN 用户完成测评 THEN THE System SHALL 保存完整的报告数据（得分、错题、分析、路径）
3. WHEN 用户访问历史记录 THEN THE System SHALL 显示按时间倒序排列的测评列表
4. WHEN 用户点击历史记录 THEN THE System SHALL 加载并显示完整的历史报告
5. THE System SHALL 支持导出报告为 PDF 或图片格式

### 需求 10: 错误处理与用户反馈

**用户故事:** 作为用户，当系统出错时我想获得清晰的提示，这样我就知道如何解决问题。

#### 验收标准

1. IF OCR 识别失败 THEN THE System SHALL 显示 "图像识别失败，请确保答题卡清晰可见并重新拍摄"
2. IF AI 分析超时 THEN THE System SHALL 显示 "分析超时，请稍后重试" 并保存已识别的答案
3. IF 网络连接失败 THEN THE System SHALL 显示 "网络连接失败，请检查网络设置"
4. IF API 配额不足 THEN THE System SHALL 显示 "服务暂时不可用，请联系管理员"
5. WHEN 处理请求 THEN THE System SHALL 显示加载动画和进度提示

### 需求 11: 性能与响应时间

**用户故事:** 作为用户，我希望系统响应迅速，这样我就能快速获得分析结果。

#### 验收标准

1. WHEN 上传图像 THEN THE System SHALL 在 5 秒内完成 OCR 识别
2. WHEN 请求 AI 分析 THEN THE System SHALL 在 10 秒内返回分析结果
3. WHEN 生成学习路径 THEN THE System SHALL 在 8 秒内返回完整路径
4. THE System SHALL 使用缓存机制减少重复 API 调用
5. THE System SHALL 支持并发处理多个用户请求

### 需求 12: 安全与隐私

**用户故事:** 作为用户，我希望我的答题数据和个人信息得到保护，这样我就能放心使用系统。

#### 验收标准

1. THE System SHALL 使用 HTTPS 加密所有网络通信
2. THE System SHALL 不在前端代码中硬编码任何 API 密钥
3. WHEN 存储用户数据 THEN THE System SHALL 加密敏感信息
4. THE System SHALL 提供用户数据删除功能（符合隐私法规）
5. THE System SHALL 在隐私政策中明确说明数据使用方式

### 需求 13: 答题卡模板配置

**用户故事:** 作为管理员，我想配置不同的答题卡模板，这样系统就能识别多种格式的答题卡。

#### 验收标准

1. THE System SHALL 支持标准答题卡模板（选择题区域定位）
2. WHEN 管理员上传新模板 THEN THE System SHALL 保存模板配置（题号位置、选项位置）
3. WHEN 识别答题卡 THEN THE System SHALL 根据模板配置提取答案
4. THE System SHALL 支持至少 3 种常见答题卡格式
5. WHERE 自定义模板 THE System SHALL 提供可视化配置工具

### 需求 14: 标准答案管理

**用户故事:** 作为教师，我想上传标准答案，这样系统就能自动批改学生的答题卡。

#### 验收标准

1. THE System SHALL 提供标准答案录入界面
2. WHEN 教师录入答案 THEN THE System SHALL 支持批量导入（Excel/CSV 格式）
3. WHEN 教师录入答案 THEN THE System SHALL 验证答案格式的正确性
4. THE System SHALL 为每套试卷分配唯一 ID
5. WHEN 学生扫描答题卡 THEN THE System SHALL 要求输入试卷 ID 以匹配标准答案

### 需求 15: 多语言支持

**用户故事:** 作为用户，我希望系统支持中英文界面，这样不同语言背景的用户都能使用。

#### 验收标准

1. THE System SHALL 支持中文和英文两种界面语言
2. WHEN 用户切换语言 THEN THE System SHALL 更新所有界面文本
3. WHEN 调用 AI 分析 THEN THE System SHALL 根据用户语言设置生成对应语言的点评
4. THE System SHALL 将语言偏好保存到用户配置中
5. THE System SHALL 默认使用系统语言或浏览器语言

### 需求 16: 离线模式支持

**用户故事:** 作为用户，当网络不可用时我希望能查看历史记录，这样我就能随时复习。

#### 验收标准

1. WHEN 网络不可用 THEN THE System SHALL 允许用户查看已缓存的历史报告
2. WHEN 网络不可用 THEN THE System SHALL 禁用需要网络的功能（OCR、AI 分析）
3. WHEN 网络恢复 THEN THE System SHALL 自动同步本地数据到云端
4. THE System SHALL 在离线模式下显示明确的状态提示
5. THE System SHALL 使用 Service Worker 实现离线缓存

### 需求 17: 批量处理

**用户故事:** 作为教师，我想批量上传多张答题卡，这样我就能快速批改整个班级的作业。

#### 验收标准

1. THE System SHALL 支持一次上传最多 50 张答题卡图像
2. WHEN 批量上传 THEN THE System SHALL 显示处理进度（已完成/总数）
3. WHEN 批量处理 THEN THE System SHALL 并行调用 OCR API 提高效率
4. WHEN 批量处理完成 THEN THE System SHALL 生成汇总报告（班级平均分、错题统计）
5. THE System SHALL 支持导出批量处理结果为 Excel 文件

### 需求 18: 实时反馈与进度显示

**用户故事:** 作为用户，我想看到处理进度，这样我就知道系统正在工作而不是卡住了。

#### 验收标准

1. WHEN 上传图像 THEN THE System SHALL 显示上传进度条
2. WHEN OCR 识别中 THEN THE System SHALL 显示 "正在识别答题卡..." 动画
3. WHEN AI 分析中 THEN THE System SHALL 显示 "AI 正在分析错题..." 动画
4. WHEN 生成路径中 THEN THE System SHALL 显示 "正在生成学习路径..." 动画
5. THE System SHALL 在每个阶段完成后显示成功提示

### 需求 19: API 成本优化

**用户故事:** 作为系统管理员，我想优化 API 调用成本，这样系统就能可持续运营。

#### 验收标准

1. THE System SHALL 缓存相同图像的 OCR 识别结果（基于图像哈希）
2. THE System SHALL 缓存相同错题模式的 AI 分析结果
3. WHEN 用户重复查看报告 THEN THE System SHALL 从缓存加载而不重新调用 API
4. THE System SHALL 记录 API 调用次数和成本统计
5. THE System SHALL 提供成本监控仪表板（管理员可见）

### 需求 20: 测试与质量保证

**用户故事:** 作为开发者，我需要完善的测试覆盖，这样我就能确保系统稳定可靠。

#### 验收标准

1. THE System SHALL 提供 OCR 识别准确率测试（使用标准测试集）
2. THE System SHALL 提供 AI 分析质量测试（人工评估样本）
3. THE System SHALL 提供端到端集成测试（模拟完整用户流程）
4. THE System SHALL 提供 API 错误处理测试（模拟各种失败场景）
5. THE System SHALL 达到至少 80% 的代码测试覆盖率
