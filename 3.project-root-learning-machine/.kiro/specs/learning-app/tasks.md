# 实施计划

- [x] 1. 搭建项目基础架构


  - 创建安卓项目结构，配置Kotlin和Jetpack Compose
  - 创建后端Spring Boot项目结构
  - 创建Web管理后台React项目结构
  - 配置依赖注入和模块化架构
  - 设置开发环境和构建配置
  - _需求: 18.1, 18.2_

- [x] 2. 实现核心数据模型和数据库



  - [x] 2.1 定义所有数据实体类


    - 实现User、Course、LearningUnit、Exercise等核心实体
    - 添加数据验证注解
    - _需求: 1.1, 2.1, 3.1_
  
  - [x] 2.2 创建数据库Schema


    - 设计PostgreSQL数据库表结构
    - 创建索引和外键约束
    - 编写数据库迁移脚本
    - _需求: 4.4, 7.1_
  
  - [x] 2.3 实现Room本地数据库（安卓）


    - 创建DAO接口
    - 配置数据库实例
    - 实现数据库迁移
    - _需求: 2.4, 4.4, 7.1_
  
  - [ ]* 2.4 编写属性测试：数据往返一致性
    - **属性 6: 学习进度往返一致性**
    - **验证需求: 2.4, 2.5**
  
  - [ ]* 2.5 编写属性测试：学习记录持久化
    - **属性 15: 学习记录持久化往返性**
    - **验证需求: 4.4**

- [x] 3. 实现用户认证和授权



  - [x] 3.1 实现用户注册和登录API


    - 创建UserService和UserController
    - 实现密码哈希和验证
    - 生成JWT令牌
    - _需求: 12.1, 13.1_
  
  - [x] 3.2 实现JWT认证中间件


    - 创建JWT工具类
    - 实现令牌验证过滤器
    - 配置安全规则
    - _需求: 12.1_
  
  - [x] 3.3 实现安卓端认证逻辑


    - 创建AuthRepository和AuthViewModel
    - 实现令牌存储和自动刷新
    - 处理认证错误
    - _需求: 12.1_
  
  - [ ]* 3.4 编写属性测试：管理员认证
    - **属性 43: 管理员认证有效性**
    - **验证需求: 12.1**
  
  - [ ]* 3.5 编写单元测试
    - 测试密码哈希和验证
    - 测试JWT生成和解析
    - 测试认证失败场景

- [x] 4. 实现课程管理功能（后端和管理后台）



  - [x] 4.1 实现课程CRUD API


    - 创建CourseService和CourseController
    - 实现创建、查询、更新、删除课程
    - 实现课程发布功能
    - _需求: 12.2, 12.5, 12.6_
  
  - [x] 4.2 实现学习单元管理API


    - 创建LearningUnitService
    - 实现单元的增删改查
    - 实现文件上传功能
    - _需求: 12.3_
  
  - [x] 4.3 实现练习题管理API


    - 创建ExerciseService
    - 实现题目的增删改查
    - 关联知识点
    - _需求: 12.4_
  
  - [x] 4.4 实现Web管理后台课程管理界面


    - 创建课程列表和详情页面
    - 实现课程编辑表单
    - 实现学习单元和练习题管理界面
    - _需求: 12.2, 12.3, 12.4_
  
  - [ ]* 4.5 编写属性测试：课程数据完整性
    - **属性 44: 课程创建数据完整性**
    - **属性 45: 学习单元创建数据完整性**
    - **属性 46: 练习题创建数据完整性**
    - **验证需求: 12.2, 12.3, 12.4**
  
  - [ ]* 4.6 编写属性测试：课程发布和更新
    - **属性 47: 课程发布状态更新性**
    - **属性 48: 课程编辑更新一致性**
    - **验证需求: 12.5, 12.6**

- [ ] 5. 实现课程浏览和学习功能（安卓）
  - [x] 5.1 扩展后端课程API


    - 在CourseController添加GET /api/courses端点（学生端）
    - 在CourseController添加GET /api/courses/{courseId}/units端点
    - 实现分页支持
    - _需求: 1.1, 1.2_
  
  - [x] 5.2 实现安卓课程Repository和ViewModel



    - 扩展ApiService添加课程相关接口
    - 创建CourseRepository
    - 创建CourseViewModel
    - 实现课程数据状态管理
    - _需求: 1.1, 1.2_
  
  - [x] 5.3 实现课程列表界面



    - 创建CourseListScreen Composable
    - 实现课程卡片UI组件
    - 实现分页加载
    - 实现下拉刷新
    - _需求: 1.1_
  
  - [x] 5.4 实现课程详情界面


    - 创建CourseDetailScreen Composable
    - 实现学习单元列表展示
    - 实现课程添加到学习列表功能
    - 实现导航到学习界面
    - _需求: 1.2, 1.3_
  
  - [x] 5.5 实现学习内容展示界面


    - 创建LearningScreen Composable
    - 实现文本、图片内容展示
    - 集成ExoPlayer实现视频播放
    - 实现播放控制（播放、暂停、快进、后退）
    - 实现内容顺序展示
    - _需求: 2.1, 2.2_
  
  - [ ]* 5.6 编写属性测试：课程数据
    - **属性 1: 课程列表数据完整性**
    - **属性 2: 课程详情查询一致性**
    - **属性 3: 学习列表添加幂等性**
    - **验证需求: 1.1, 1.2, 1.3**
  
  - [ ]* 5.7 编写属性测试：内容顺序
    - **属性 4: 学习内容顺序性**
    - **验证需求: 2.1**

- [ ] 6. 实现学习进度跟踪
  - [x] 6.1 创建学习记录后端服务


    - 创建LearningRecordService
    - 创建LearningRecordController
    - 实现POST /api/learning/progress端点
    - 实现GET /api/learning/records端点
    - 实现POST /api/learning/units/{unitId}/complete端点
    - _需求: 2.3, 2.4, 2.5_
  
  - [x] 6.2 实现安卓端进度跟踪Repository和ViewModel



    - 扩展ApiService添加学习记录接口
    - 创建LearningRecordRepository
    - 创建LearningViewModel
    - 实现本地进度保存到Room数据库
    - 实现进度同步逻辑
    - 实现进度恢复功能
    - _需求: 2.4, 2.5_
  
  - [x] 6.3 在学习界面集成进度跟踪

    - 在LearningScreen中集成进度保存
    - 实现视频播放位置保存
    - 实现单元完成标记
    - 实现进度恢复
    - _需求: 2.3, 2.4, 2.5_
  
  - [x] 6.4 实现学习记录查询界面



    - 创建LearningRecordScreen Composable
    - 显示课程完成百分比
    - 显示单元完成状态
    - 实现学习历史查看
    - _需求: 4.1, 4.2_
  
  - [ ]* 6.5 编写属性测试：进度跟踪
    - **属性 5: 单元完成状态传播**
    - **属性 12: 课程完成度计算准确性**
    - **属性 13: 学习记录数据完整性**
    - **验证需求: 2.3, 4.1, 4.2**

- [ ] 7. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 8. 实现练习题功能
  - [ ] 8.1 扩展练习题后端API
    - 在ExerciseService添加答案提交方法
    - 创建POST /api/exercises/submit端点
    - 实现答案判断逻辑
    - 实现GET /api/exercises/history端点
    - 计算正确率和总分
    - _需求: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 8.2 实现安卓端练习Repository和ViewModel
    - 扩展ApiService添加练习相关接口
    - 创建ExerciseRepository
    - 创建ExerciseViewModel
    - 实现答题状态管理
    - _需求: 3.1, 3.2_
  
  - [ ] 8.3 实现练习答题界面
    - 创建ExerciseScreen Composable
    - 显示题目和选项
    - 实现答案选择UI
    - 实现答案提交
    - 显示答题反馈和解析
    - 实现题目导航（上一题/下一题）
    - _需求: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 8.4 实现练习历史记录
    - 在ExerciseRepository实现历史查询
    - 创建ExerciseHistoryScreen Composable
    - 显示历史成绩统计
    - 显示正确率和总分
    - _需求: 4.3_
  
  - [ ]* 8.5 编写属性测试：练习题功能
    - **属性 7: 练习题数据完整性**
    - **属性 8: 答案判断正确性**
    - **属性 9: 正确答题统计递增性**
    - **属性 10: 错误答案反馈完整性**
    - **属性 11: 正确率计算准确性**
    - **验证需求: 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ]* 8.6 编写属性测试：练习历史
    - **属性 14: 练习历史数据完整性**
    - **验证需求: 4.3**

- [ ] 9. 实现错题库功能
  - [ ] 9.1 创建错题库后端服务
    - 创建WrongAnswerService
    - 创建WrongAnswerController
    - 实现错题自动收集逻辑（在答题错误时触发）
    - 实现GET /api/wrong-answers端点
    - 实现GET /api/wrong-answers/{id}端点
    - 实现POST /api/wrong-answers/{id}/redo端点
    - 实现PUT /api/wrong-answers/{id}/master端点
    - _需求: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 9.2 实现安卓端错题库Repository和ViewModel
    - 扩展ApiService添加错题库接口
    - 创建WrongAnswerRepository
    - 创建WrongAnswerViewModel
    - 实现错题数据状态管理
    - _需求: 9.1, 9.2_
  
  - [ ] 9.3 实现错题库界面
    - 创建WrongAnswerBankScreen Composable
    - 显示错题列表
    - 按知识点分类显示
    - 实现错题详情查看
    - 实现错题重做功能
    - 显示掌握状态
    - _需求: 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 9.4 编写属性测试：错题库
    - **属性 28: 错题自动收集一致性**
    - **属性 29: 错题数据完整性**
    - **属性 30: 错题详情数据完整性**
    - **属性 31: 错题重做题目一致性**
    - **属性 32: 错题掌握状态更新性**
    - **属性 33: 错题知识点分类准确性**
    - **验证需求: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

- [ ] 10. 集成AI服务
  - [ ] 10.1 配置AI服务连接
    - 选择AI服务提供商（OpenAI或自建）
    - 在application.yml配置API密钥和端点
    - 创建AIService类
    - 实现AI客户端封装
    - 实现错误处理和重试机制
    - _需求: 8.2, 16.1, 16.2_
  
  - [ ] 10.2 实现AI答疑后端API
    - 在AIService实现askQuestion方法
    - 创建AIController
    - 实现POST /api/ai/ask端点
    - 实现上下文管理（课程、知识点）
    - 处理AI响应格式化
    - 实现超时和错误处理
    - _需求: 8.2, 8.3, 8.5, 8.6_
  
  - [ ] 10.3 实现安卓端AI答疑Repository和ViewModel
    - 扩展ApiService添加AI接口
    - 创建AIRepository
    - 创建AIViewModel
    - 实现对话历史管理
    - 实现加载状态管理
    - _需求: 8.1, 8.2_
  
  - [ ] 10.4 实现AI答疑界面
    - 创建AIAssistantScreen Composable
    - 实现对话消息列表UI
    - 实现消息输入框
    - 显示加载状态
    - 显示错误提示
    - 实现上下文信息显示
    - _需求: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 10.5 编写属性测试：AI答疑
    - **属性 25: AI问题请求发送完整性**
    - **属性 26: AI响应数据完整性**
    - **属性 27: AI上下文传递完整性**
    - **验证需求: 8.2, 8.3, 8.5**

- [ ] 11. 实现AI个性化练习生成
  - [ ] 11.1 实现错题分析后端逻辑
    - 在AIService实现analyzeWrongAnswers方法
    - 实现GET /api/ai/wrong-answers/analysis端点
    - 分析用户错题库
    - 识别薄弱知识点
    - 计算知识点掌握度
    - _需求: 10.1_
  
  - [ ] 11.2 实现AI练习题生成后端
    - 在AIService实现generateExercises方法
    - 实现POST /api/ai/exercises/generate端点
    - 调用AI服务生成题目
    - 保存生成的练习题到数据库
    - 标记为待审核状态（source=AI_GENERATED, reviewStatus=PENDING）
    - _需求: 10.2, 10.3, 15.1_
  
  - [ ] 11.3 实现个性化练习功能
    - 创建个性化练习集查询接口
    - 实现练习完成后的掌握度更新逻辑
    - 实现学习单元推荐算法
    - 实现推荐接口
    - _需求: 10.3, 10.4, 10.5_
  
  - [ ] 11.4 实现安卓端个性化练习界面
    - 在ExerciseViewModel添加个性化练习支持
    - 创建PersonalizedExerciseScreen Composable
    - 显示薄弱知识点分析
    - 实现生成练习按钮
    - 显示推荐学习单元
    - _需求: 10.1, 10.2, 10.3, 10.5_
  
  - [ ]* 11.5 编写属性测试：AI练习生成
    - **属性 34: 薄弱知识点识别准确性**
    - **属性 35: AI练习生成请求完整性**
    - **属性 36: AI生成练习保存一致性**
    - **属性 37: 知识点掌握度更新性**
    - **属性 38: 持续答错推荐触发性**
    - **验证需求: 10.1, 10.2, 10.3, 10.4, 10.5**

- [ ] 12. 实现AI学习报告
  - [ ] 12.1 实现学习数据分析后端
    - 在AIService实现generateLearningReport方法
    - 实现GET /api/ai/learning-report端点
    - 统计学习时长
    - 分析知识点掌握情况
    - 识别薄弱环节
    - 调用AI服务生成学习建议
    - 生成个性化学习计划
    - 实现内容推荐逻辑
    - _需求: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 12.2 实现安卓端学习报告Repository和ViewModel
    - 扩展ApiService添加学习报告接口
    - 在AIRepository添加报告查询方法
    - 创建LearningReportViewModel
    - 实现报告数据状态管理
    - _需求: 11.1, 11.2_
  
  - [ ] 12.3 实现学习报告界面
    - 创建LearningReportScreen Composable
    - 显示学习时长统计
    - 显示知识点掌握情况图表
    - 显示薄弱环节分析
    - 显示AI学习建议
    - 显示推荐内容
    - _需求: 11.2, 11.3_
  
  - [ ]* 12.4 编写属性测试：学习报告
    - **属性 39: 学习报告生成完整性**
    - **属性 40: 学习报告数据完整性**
    - **属性 41: 学习建议包含性**
    - **属性 42: 优秀表现推荐高难度性**
    - **验证需求: 11.1, 11.2, 11.3, 11.5**

- [ ] 13. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 14. 实现收藏和提醒功能
  - [ ] 14.1 实现收藏后端服务
    - 创建FavoriteService
    - 创建FavoriteController
    - 实现POST /api/favorites端点（添加收藏）
    - 实现GET /api/favorites端点（查询收藏列表）
    - 实现DELETE /api/favorites/{id}端点（取消收藏）
    - _需求: 5.1, 5.2, 5.4_
  
  - [ ] 14.2 实现安卓端收藏功能
    - 扩展ApiService添加收藏接口
    - 创建FavoriteRepository
    - 在相关ViewModel中集成收藏功能
    - 创建FavoriteListScreen Composable
    - 在学习界面添加收藏按钮
    - _需求: 5.1, 5.2, 5.4_
  
  - [ ] 14.3 实现提醒后端服务
    - 创建ReminderService
    - 创建ReminderController
    - 实现POST /api/reminders端点（设置提醒）
    - 实现GET /api/reminders端点（查询提醒）
    - 实现PUT /api/reminders/{id}端点（更新提醒）
    - 实现DELETE /api/reminders/{id}端点（删除提醒）
    - _需求: 6.1, 6.4_
  
  - [ ] 14.4 实现安卓端学习提醒功能
    - 扩展ApiService添加提醒接口
    - 创建ReminderRepository
    - 实现安卓AlarmManager通知调度
    - 创建ReminderSettingsScreen Composable
    - 实现通知点击事件处理
    - 实现提醒开关功能
    - _需求: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 14.5 编写属性测试：收藏功能
    - **属性 16: 收藏列表添加一致性**
    - **属性 17: 收藏项数据完整性**
    - **属性 18: 取消收藏移除一致性**
    - **验证需求: 5.1, 5.2, 5.4**
  
  - [ ]* 14.6 编写属性测试：提醒功能
    - **属性 19: 提醒配置往返一致性**
    - **属性 20: 提醒取消清空性**
    - **验证需求: 6.1, 6.4**

- [ ] 15. 实现离线学习功能
  - [ ] 15.1 实现课程下载后端支持
    - 在CourseController添加POST /api/courses/{courseId}/download端点
    - 返回课程完整数据和媒体文件URL列表
    - _需求: 7.1_
  
  - [ ] 15.2 实现安卓端下载管理器
    - 创建DownloadManager类
    - 实现课程数据下载到Room数据库
    - 实现媒体文件下载到本地存储
    - 实现下载进度跟踪
    - 创建DownloadScreen显示下载进度
    - _需求: 7.1_
  
  - [ ] 15.3 实现离线数据访问逻辑
    - 在Repository层添加网络状态检测
    - 实现离线时从本地数据库查询
    - 实现未下载内容的错误提示
    - 在UI层显示离线模式指示器
    - _需求: 7.2, 7.3_
  
  - [ ] 15.4 实现离线学习记录和同步
    - 在LearningRecordRepository实现本地优先保存
    - 实现离线练习结果本地保存
    - 创建SyncService实现数据同步
    - 在网络恢复时自动同步数据
    - _需求: 7.4_
  
  - [ ]* 15.5 编写属性测试：离线功能
    - **属性 21: 课程下载本地可访问性**
    - **属性 22: 离线已下载内容可访问性**
    - **属性 23: 离线未下载内容错误提示**
    - **属性 24: 离线学习数据本地记录性**
    - **验证需求: 7.1, 7.2, 7.3, 7.4**

- [ ] 16. 实现用户管理功能（管理后台）
  - [ ] 16.1 实现用户管理后端API
    - 在UserService添加管理功能方法
    - 创建AdminUserController
    - 实现GET /api/admin/users端点（用户列表）
    - 实现GET /api/admin/users/search端点（搜索用户）
    - 实现GET /api/admin/users/{userId}端点（用户详情）
    - 实现PUT /api/admin/users/{userId}/status端点（更新状态）
    - 实现POST /api/admin/users/{userId}/reset-password端点（重置密码）
    - _需求: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [ ] 16.2 实现Web管理后台用户管理界面
    - 创建用户管理API客户端（user.ts）
    - 创建UserListPage组件
    - 实现用户搜索功能
    - 创建UserDetailPage组件
    - 实现账户禁用/启用操作
    - 实现密码重置功能
    - 显示用户学习数据和活跃度
    - _需求: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 16.3 编写属性测试：用户管理
    - **属性 49: 用户列表数据完整性**
    - **属性 50: 用户搜索结果匹配性**
    - **属性 51: 用户详情数据完整性**
    - **属性 52: 账户禁用登录阻止性**
    - **属性 53: 密码重置生成性**
    - **验证需求: 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ] 17. 实现数据分析功能（管理后台）
  - [ ] 17.1 实现数据分析后端服务
    - 创建AnalyticsService
    - 创建AnalyticsController
    - 实现GET /api/admin/analytics/overview端点（总览数据）
    - 实现GET /api/admin/analytics/courses端点（课程数据）
    - 实现GET /api/admin/analytics/knowledge-points端点（知识点分析）
    - 实现用户活跃度统计逻辑
    - 实现课程完成率统计逻辑
    - 实现练习正确率统计逻辑
    - 实现时间范围过滤
    - _需求: 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 17.2 实现报告导出功能
    - 实现POST /api/admin/analytics/export端点
    - 集成Apache POI实现Excel导出
    - 集成iText实现PDF导出
    - _需求: 14.5_
  
  - [ ] 17.3 实现Web管理后台数据分析界面
    - 创建数据分析API客户端（analytics.ts）
    - 创建AnalyticsPage组件
    - 实现时间范围选择器
    - 使用ECharts显示统计图表
    - 显示用户活跃度、课程完成率、练习正确率
    - 实现课程详细数据展示
    - 实现知识点分析展示
    - 实现报告导出按钮
    - _需求: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 17.4 编写属性测试：数据分析
    - **属性 54: 统计数据计算准确性**
    - **属性 55: 时间过滤数据范围性**
    - **属性 56: 课程统计数据完整性**
    - **属性 57: 知识点统计分组准确性**
    - **属性 58: 报告导出数据包含性**
    - **验证需求: 14.1, 14.2, 14.3, 14.4, 14.5**

- [ ] 18. 实现AI内容审核功能（管理后台）
  - [ ] 18.1 实现内容审核后端API
    - 在AIService添加reviewAIContent方法
    - 创建ContentReviewController
    - 实现GET /api/admin/ai/pending-review端点（待审核内容）
    - 实现POST /api/admin/ai/review端点（审核操作）
    - 实现审核状态更新逻辑（APPROVED/REJECTED）
    - 实现拒绝原因记录
    - _需求: 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 18.2 实现Web管理后台审核界面
    - 创建内容审核API客户端（review.ts）
    - 创建ContentReviewListPage组件
    - 创建ContentReviewDetailPage组件
    - 实现待审核内容列表展示
    - 实现审核操作界面（批准/拒绝/修改）
    - 实现拒绝原因输入
    - 显示AI生成内容详情
    - _需求: 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 18.3 编写属性测试：内容审核
    - **属性 59: AI生成内容待审核状态**
    - **属性 60: 待审核列表过滤准确性**
    - **属性 61: 内容审核状态更新性**
    - **属性 62: 内容批准状态更新性**
    - **属性 63: 内容拒绝原因记录性**
    - **验证需求: 15.1, 15.2, 15.3, 15.4, 15.5**

- [ ] 19. 实现AI配置管理（管理后台）
  - [ ] 19.1 实现AI配置后端API
    - 创建AIConfigService
    - 创建AIConfigController
    - 实现GET /api/admin/ai/config端点（查询配置）
    - 实现PUT /api/admin/ai/config端点（更新配置）
    - 实现配置持久化到数据库
    - 实现模板管理逻辑
    - 实现难度参数配置
    - 实现错误告警配置
    - _需求: 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [ ] 19.2 实现Web管理后台AI配置界面
    - 创建AI配置API客户端（aiConfig.ts）
    - 创建AIConfigPage组件
    - 实现模型选择下拉框
    - 实现答疑响应模板编辑器
    - 实现题目生成难度参数调整
    - 实现错误告警配置表单
    - 实现配置保存和重置功能
    - _需求: 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [ ]* 19.3 编写属性测试：AI配置
    - **属性 64: AI配置查询返回性**
    - **属性 65: AI配置更新往返性**
    - **属性 66: AI模板应用一致性**
    - **属性 67: 题目难度分布符合性**
    - **验证需求: 16.1, 16.2, 16.3, 16.4**

- [ ] 20. 实现通知管理功能
  - [ ] 20.1 实现通知后端服务
    - 创建NotificationService
    - 创建NotificationController
    - 实现POST /api/admin/notifications端点（创建通知）
    - 实现GET /api/admin/notifications/history端点（通知历史）
    - 实现POST /api/admin/notifications/schedule端点（定时通知）
    - 实现通知发送逻辑
    - 集成推送服务（Firebase或其他）
    - 实现定时通知调度（使用Spring Scheduler）
    - 实现送达率和阅读率统计
    - _需求: 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 20.2 实现Web管理后台通知管理界面
    - 创建通知管理API客户端（notification.ts）
    - 创建NotificationManagePage组件
    - 实现通知创建表单
    - 实现目标用户选择
    - 实现定时发送设置
    - 创建NotificationHistoryPage组件
    - 显示送达率和阅读率统计
    - _需求: 17.1, 17.2, 17.3_
  
  - [ ] 20.3 实现安卓端通知接收
    - 扩展ApiService添加通知接口
    - 创建NotificationRepository
    - 实现Firebase Cloud Messaging接收
    - 创建NotificationReceiver处理推送
    - 实现应用内通知显示
    - 创建NotificationListScreen Composable
    - 实现通知已读标记
    - _需求: 17.5_
  
  - [ ]* 20.4 编写属性测试：通知功能
    - **属性 68: 通知创建数据完整性**
    - **属性 69: 通知发送接收一致性**
    - **属性 70: 通知历史统计完整性**
    - **属性 71: 用户通知接收可见性**
    - **验证需求: 17.1, 17.2, 17.3, 17.5**

- [ ] 21. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 22. 实现错误处理和用户体验优化
  - [ ] 22.1 实现后端统一错误处理
    - 创建GlobalExceptionHandler
    - 实现统一错误响应格式（ApiError）
    - 实现错误日志记录
    - 配置日志框架（Logback）
    - _需求: 18.4_
  
  - [ ] 22.2 实现安卓端错误处理和加载状态
    - 在所有ViewModel中实现统一的加载状态管理
    - 创建LoadingIndicator Composable组件
    - 创建ErrorDialog Composable组件
    - 实现网络错误重试机制
    - 实现超时处理
    - _需求: 18.2, 18.3_
  
  - [ ] 22.3 实现Web管理后台错误处理
    - 在API客户端实现统一错误拦截
    - 创建全局错误提示组件
    - 实现加载状态显示
    - 实现请求重试机制
    - _需求: 18.2, 18.3_
  
  - [ ] 22.4 优化性能和响应时间
    - 在后端实现Redis缓存（课程列表、课程详情）
    - 优化数据库查询（添加索引、使用连接查询）
    - 在安卓端实现图片懒加载
    - 实现分页数据预加载
    - 配置数据库连接池
    - _需求: 18.1_

- [ ] 23. 实现安全功能
  - [ ] 23.1 实现数据加密
    - 配置后端HTTPS（SSL证书）
    - 在安卓端使用SQLCipher加密Room数据库
    - 在后端实现敏感字段加密（密码使用BCrypt）
    - 实现API传输加密
  
  - [ ] 23.2 实现API安全
    - 在Spring Security配置请求验证
    - 实现速率限制（使用Bucket4j或Redis）
    - 配置CORS策略
    - 实现SQL注入防护（使用参数化查询）
    - 实现XSS防护（输入验证和输出转义）
    - 实现CSRF防护
  
  - [ ] 23.3 实现AI内容安全
    - 创建ContentFilterService
    - 实现敏感词检测和过滤
    - 实现AI响应内容验证
    - 实现提示注入防护（输入清理和长度限制）
    - 实现异常请求模式监控

- [ ]* 24. 编写集成测试
  - 测试完整的用户学习流程
  - 测试课程管理流程
  - 测试AI功能集成
  - 测试离线同步流程

- [ ]* 25. 编写UI测试
  - 测试关键用户界面
  - 测试表单验证
  - 测试导航流程
  - 测试错误状态显示

- [ ] 26. 实现导航和主界面（安卓）
  - [ ] 26.1 实现应用导航架构
    - 集成Jetpack Navigation Compose
    - 定义导航图和路由
    - 实现底部导航栏
    - 实现屏幕间导航逻辑
  
  - [ ] 26.2 实现主界面和个人中心
    - 创建HomeScreen Composable（主页）
    - 创建ProfileScreen Composable（个人中心）
    - 实现用户信息显示
    - 实现设置入口
    - 实现退出登录功能

- [ ] 27. 部署和监控配置
  - [ ] 27.1 配置生产环境
    - 编写后端Dockerfile
    - 编写docker-compose.yml
    - 配置Kubernetes部署文件（可选）
    - 配置生产数据库连接
    - 配置Redis连接
    - 配置文件存储（MinIO或S3）
  
  - [ ] 27.2 配置监控和日志
    - 实现Spring Boot Actuator健康检查
    - 配置日志收集（ELK或其他）
    - 配置性能监控（Prometheus + Grafana）
    - 配置告警规则
    - 实现应用性能指标收集
  
  - [ ] 27.3 配置备份和恢复
    - 配置PostgreSQL自动备份脚本
    - 配置备份存储位置
    - 编写数据恢复文档
    - 测试恢复流程

- [ ] 28. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户
