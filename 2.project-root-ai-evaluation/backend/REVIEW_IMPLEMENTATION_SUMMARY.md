# 教师审核服务实现总结

## 概述

教师审核服务（Teacher Review Service）已成功实现，用于管理教师审核队列，处理人工判定，确保 AI 判定的准确性。

## 实现的功能

### 1. 数据模型（`app/models/review.py`）

- **ReviewPriority**: 审核优先级枚举
  - HIGH: confidence < 0.5
  - MEDIUM: 0.5 <= confidence < 0.8
  - LOW: confidence >= 0.8

- **ReviewStatus**: 审核状态枚举
  - PENDING: 待审核
  - IN_PROGRESS: 进行中
  - COMPLETED: 已完成
  - CANCELLED: 已取消

- **ReviewTask**: 审核任务模型
  - `review_id`: 审核任务 ID（UUID）
  - `exam_id`: 试卷 ID
  - `question_id`: 题目 ID
  - `assigned_to`: 分配给的教师 ID
  - `priority`: 优先级
  - `status`: 状态
  - `ai_judgment`: AI 判定信息（JSONB）
  - `teacher_judgment`: 教师判定信息（JSONB）
  - `teacher_comment`: 教师评论
  - `created_at`: 创建时间
  - `assigned_at`: 分配时间
  - `completed_at`: 完成时间

### 2. Schema 模型（`app/schemas/review.py`）

- **AIJudgment**: AI 判定信息
  - `is_correct`: 是否正确
  - `confidence`: 置信度
  - `error_reason`: 错误原因
  - `student_answer`: 学生答案
  - `correct_answer`: 正确答案

- **TeacherJudgment**: 教师判定信息
  - `is_correct`: 是否正确
  - `error_reason`: 错误原因
  - `score_obtained`: 获得分数
  - `confidence`: 置信度（默认 1.0）

- **ReviewTaskDetail**: 审核任务详情
- **ReviewQueueResponse**: 审核队列响应
- **ReviewSubmitRequest/Response**: 审核提交请求/响应
- **ReviewStatsResponse**: 审核统计响应

### 3. 审核服务（`app/services/review_service.py`）

#### 核心方法

1. **determine_priority()**: 根据置信度确定审核优先级
   - confidence < 0.5 → HIGH
   - 0.5 <= confidence < 0.8 → MEDIUM
   - confidence >= 0.8 → LOW

2. **create_review_task()**: 创建审核任务
   - 从 QuestionAnalysis 提取信息
   - 确定优先级
   - 构建 AI 判定信息
   - 返回审核任务数据

3. **assign_review()**: 分配审核任务
   - 更新 assigned_to 字段
   - 设置 assigned_at 时间
   - 更新状态为 IN_PROGRESS

4. **select_teacher()**: 选择合适的教师
   - 优先选择学科匹配的教师
   - 选择工作量最少的教师
   - 返回教师 ID

5. **update_analysis_with_review()**: 用教师审核结果更新分析
   - 更新 is_correct、error_reason、confidence
   - 设置 review_status 为 "human_verified"
   - 更新得分

6. **should_trigger_report_regeneration()**: 判断是否需要重新生成报告
   - 对错判定改变 → 需要重新生成
   - 错误原因改变 → 需要重新生成
   - 得分改变 → 需要重新生成

7. **compute_review_stats()**: 计算审核统计
   - 总审核数、已完成数、待审核数
   - 平均审核时间
   - 完成率

### 4. API 端点（`app/api/v1/reviews.py`）

- **GET /api/v1/reviews/queue**: 获取审核队列
  - 支持优先级过滤
  - 支持状态过滤
  - 支持分页（limit, offset）
  - 返回审核任务列表和统计信息

- **POST /api/v1/reviews/{review_id}/submit**: 提交审核结果
  - 需要 JWT 认证
  - 更新审核任务状态
  - 更新试卷的分析结果
  - 设置 review_status 为 "human_verified"
  - 更新试卷状态为 "reviewed"

- **GET /api/v1/reviews/stats**: 获取审核统计
  - 返回总审核数、已完成数、待审核数
  - 返回平均审核时间
  - 返回准确率提升（待实现）

- **POST /api/v1/reviews/{review_id}/assign**: 分配审核任务
  - 手动分配审核任务给指定教师
  - 更新任务状态为 IN_PROGRESS

### 5. 数据库迁移

- 创建 `review_tasks` 表
- 创建 `reviewpriority` 枚举类型
- 创建 `reviewstatus` 枚举类型
- 创建索引：
  - review_id, exam_id, question_id
  - assigned_to, priority, status
  - created_at

## 属性测试（Property-Based Testing）

使用 Hypothesis 框架实现了 5 个属性测试，每个测试运行 100+ 次迭代：

### Property 16: Teacher Review Status Update（教师审核状态更新）

1. **test_property_16_teacher_review_status_update**: 状态更新验证
   - 教师审核后，review_status 应该是 "human_verified"
   - 置信度应该是 1.0（教师审核）
   - 判定结果应该被更新

### 其他属性测试

2. **test_priority_determination_consistency**: 优先级判定一致性
   - 验证置信度到优先级的映射规则

3. **test_report_regeneration_trigger_on_correctness_change**: 对错判定改变触发重新生成
   - 验证对错判定改变时触发报告重新生成

4. **test_report_regeneration_trigger_on_score_change**: 得分改变触发重新生成
   - 验证得分改变时触发报告重新生成

5. **test_teacher_selection_prefers_subject_match**: 教师选择优先匹配学科
   - 验证优先选择学科匹配的教师
   - 验证选择工作量最少的教师

## 测试结果

```
5 passed, 1 warning in 1.33s
```

所有属性测试通过，代码覆盖率 70%（review_service.py）。

## 验证的需求

- **Requirement 7.1**: 创建审核任务和队列管理 ✅
- **Requirement 7.2**: 审核队列 API ✅
- **Requirement 7.3**: 审核提交 API ✅
- **Requirement 7.5**: 教师审核状态更新 ✅（Property 16）
- **Requirement 7.6**: 报告重新生成触发 ✅
- **Requirement 7.7**: 审核统计 ✅
- **Requirement 7.8**: 教师任务分配 ✅

## 工作流程

### 1. 创建审核任务

```python
# 当 AI 判定置信度 < 0.8 时，自动创建审核任务
if question_analysis.confidence < 0.8:
    review_task_data = ReviewService.create_review_task(
        exam_id=exam_id,
        question_analysis=question_analysis,
        image_url=exam.original_image_url
    )
    # 保存到数据库
```

### 2. 教师获取审核队列

```
GET /api/v1/reviews/queue?priority=high&limit=10
```

### 3. 教师提交审核结果

```
POST /api/v1/reviews/{review_id}/submit
{
    "is_correct": true,
    "error_reason": "无错误",
    "teacher_comment": "答案基本正确",
    "score_obtained": 8.5
}
```

### 4. 系统更新分析结果

- 更新 QuestionAnalysis
- 设置 review_status 为 "human_verified"
- 置信度设置为 1.0
- 更新试卷状态为 "reviewed"

### 5. 触发报告重新生成（如需要）

- 检查对错判定是否改变
- 检查错误原因是否改变
- 检查得分是否改变
- 如果有改变，触发报告重新生成

## 优先级策略

| 置信度范围 | 优先级 | 说明 |
|-----------|--------|------|
| < 0.5 | HIGH | 低置信度，需要优先审核 |
| 0.5 - 0.8 | MEDIUM | 中等置信度，需要审核 |
| >= 0.8 | LOW | 高置信度，可选审核 |

## 教师分配策略

1. **学科匹配优先**: 优先分配给学科专长匹配的教师
2. **工作量平衡**: 选择当前工作量最少的教师
3. **手动分配**: 支持管理员手动分配任务

## 下一步

Task 9 已完成，可以继续：

- **Task 10**: 实现书写分析服务
- **Task 11**: 实现 DeepSeek 诊断引擎
- **Task 12**: Checkpoint - 确保诊断功能正常

## 文件清单

### 新增文件
- `backend/app/models/review.py` - 审核任务模型
- `backend/app/schemas/review.py` - 审核数据模型
- `backend/app/services/review_service.py` - 审核服务
- `backend/app/api/v1/reviews.py` - 审核 API
- `backend/tests/test_review_properties.py` - 属性测试
- `backend/alembic/versions/005_create_review_tasks_table.py` - 数据库迁移

### 修改文件
- `backend/app/api/v1/__init__.py` - 注册审核路由

## 技术亮点

1. **优先级自动判定**: 根据置信度自动确定审核优先级
2. **智能教师分配**: 优先匹配学科，平衡工作量
3. **状态追踪**: 完整的审核状态追踪（pending → in_progress → completed）
4. **报告重新生成触发**: 智能判断是否需要重新生成报告
5. **审核统计**: 实时统计审核数据，监控质量
6. **属性测试**: 100+ 次迭代验证通用正确性属性
7. **证据保留**: 保留 AI 判定和教师判定，便于审计

## 注意事项

1. 审核任务创建应该在分析服务中自动触发
2. 教师需要有相应的权限才能访问审核队列
3. 报告重新生成是异步任务，需要后续实现
4. 审核统计中的准确率提升需要更复杂的计算逻辑
5. 教师分配可以进一步优化，考虑教师的在线状态、历史表现等因素
