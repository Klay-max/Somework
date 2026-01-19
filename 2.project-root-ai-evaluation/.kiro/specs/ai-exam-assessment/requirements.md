# Requirements Document

## Introduction

AI 试卷拍照测评工具是一款面向中国 K12 场景的商用 MVP 产品。学生上传真实学校试卷照片后，系统通过 OCR、结构化解析、AI 诊断等技术，自动完成试卷结构理解、作答识别、能力诊断，并生成 4 页高转化测评报告，支持导出为 HTML 和 PDF 格式，用于家长沟通与销售转化。

## Glossary

- **System**: AI 试卷拍照测评工具
- **Android_App**: Android 移动应用
- **Backend**: Python FastAPI 后端服务
- **OCR_Module**: 光学字符识别模块，负责识别印刷体和手写文字
- **Parser**: 试卷结构解析模块
- **Analyzer**: 学生作答判定模块
- **Teacher_Review**: 教师人工审核模块
- **DeepSeek_Engine**: DeepSeek AI 诊断与报告生成模块
- **Report_Generator**: 测评报告生成器
- **Frontend**: React/Next.js 前端应用（Web 端）
- **Student_Answer**: 学生在试卷上的作答内容
- **Exam_Image**: 学生上传的试卷照片
- **Assessment_Report**: 4 页测评报告
- **Evidence_Field**: 支撑结论的证据字段

## Requirements

### Requirement 1: Android 应用与用户认证

**User Story:** 作为用户，我想通过 Android 应用注册账号、登录系统，以便使用试卷测评功能。

#### Acceptance Criteria

1. THE Android_App SHALL provide user registration with phone number and verification code
2. WHEN a user registers THEN THE System SHALL validate phone number format and send SMS verification code
3. THE Android_App SHALL provide login functionality with phone number and password
4. WHEN a user logs in THEN THE System SHALL issue a JWT token valid for 7 days
5. WHEN a token expires THEN THE System SHALL prompt user to re-authenticate
6. THE Android_App SHALL store user credentials securely using Android Keystore
7. WHEN a user logs out THEN THE System SHALL invalidate the JWT token

### Requirement 2: 试卷拍照与上传

**User Story:** 作为学生或家长，我想通过 Android 应用拍摄或上传试卷照片，以便系统进行分析。

#### Acceptance Criteria

1. THE Android_App SHALL integrate device camera for direct exam photo capture
2. WHEN capturing photos THEN THE Android_App SHALL provide real-time guidance for optimal image quality (lighting, angle, clarity)
3. THE Android_App SHALL support selecting existing photos from device gallery
4. WHEN a photo is selected THEN THE System SHALL validate image format (JPG, PNG, HEIC) and size (maximum 10MB)
5. THE Android_App SHALL support offline photo capture and queue uploads when network is available
6. WHEN uploading an exam THEN THE System SHALL display upload progress and estimated time
7. WHEN upload is complete THEN THE System SHALL associate the exam with the user's account and return a unique exam ID

### Requirement 3: 图像预处理与质量检测

**User Story:** 作为系统，我需要验证和预处理上传的试卷图像，以便确保后续识别的准确性。

#### Acceptance Criteria

1. WHEN an exam image is received THEN THE System SHALL validate image quality (resolution, blur, brightness)
2. IF image quality is insufficient THEN THE System SHALL reject the image and provide specific feedback (too blurry, too dark, etc.)
3. WHEN image quality is acceptable THEN THE System SHALL preprocess the image (deskew, denoise, enhance contrast)
4. WHEN preprocessing is complete THEN THE System SHALL store both original and processed images with unique identifiers
5. THE System SHALL extract image metadata (capture time, device info) for audit purposes

### Requirement 4: OCR 文字识别（印刷体 + 手写）

**User Story:** 作为系统，我需要准确识别试卷上的印刷文字和手写内容，以便后续进行结构化解析。

#### Acceptance Criteria

1. WHEN THE OCR_Module processes an exam image THEN THE System SHALL recognize both printed text and handwritten content
2. WHEN text is recognized THEN THE OCR_Module SHALL output structured text with bounding box coordinates for each text region
3. WHEN OCR processing is complete THEN THE System SHALL distinguish between question text (printed) and student answers (handwritten)
4. IF OCR confidence is below 0.6 for critical content THEN THE System SHALL flag the content for manual review
5. WHEN OCR outputs data THEN THE System SHALL NOT make educational judgments in the OCR layer

### Requirement 5: 试卷结构解析

**User Story:** 作为系统，我需要理解试卷的结构（题型、分值、知识点、难度），以便准确评估学生表现。

#### Acceptance Criteria

1. WHEN THE Parser receives OCR output THEN THE System SHALL identify exam metadata (subject, grade, total score, exam type)
2. WHEN parsing questions THEN THE Parser SHALL extract question ID, section, question type (objective/subjective), score value, and correct answer
3. WHEN analyzing questions THEN THE System SHALL tag each question with knowledge points based on content analysis
4. WHEN assigning difficulty THEN THE System SHALL estimate difficulty level (0.0-1.0) based on question complexity and knowledge requirements
5. WHEN structure parsing is complete THEN THE System SHALL output a standardized JSON structure conforming to the exam_meta schema
6. IF the exam format is non-standard THEN THE System SHALL attempt intelligent parsing and flag ambiguous sections for review

### Requirement 6: 学生作答识别与 AI 初判

**User Story:** 作为系统，我需要识别学生的作答内容并进行 AI 初步判定，以便快速完成基础评估。

#### Acceptance Criteria

1. WHEN THE Analyzer receives parsed exam data THEN THE System SHALL extract student answers from handwritten regions
2. WHEN comparing objective question answers THEN THE Analyzer SHALL determine correctness using exact matching or fuzzy matching
3. WHEN evaluating subjective questions THEN THE System SHALL use DeepSeek to assess answer quality and assign initial correctness judgment
4. WHEN AI judgment is complete THEN THE System SHALL compute confidence score (0.0-1.0) for each judgment
5. IF confidence score is below 0.8 THEN THE System SHALL flag the answer as "待人工审核" and add to teacher review queue
6. WHEN an answer is judged incorrect THEN THE Analyzer SHALL classify the error reason (logic error, careless mistake, knowledge gap, misreading question)
7. WHEN initial analysis is complete THEN THE System SHALL populate the question_analysis array with all required fields including review_status (ai_pending_review, ai_confident)

### Requirement 7: 教师人工审核

**User Story:** 作为教师，我想审核 AI 标记的低置信度答案，并进行人工判定，以便提高测评准确性。

#### Acceptance Criteria

1. WHEN AI flags an answer for review THEN THE System SHALL add it to the teacher review queue with priority based on confidence score
2. THE Teacher_Review module SHALL display the original exam image, highlighted student answer region, AI judgment, confidence score, and suggested error reason
3. WHEN a teacher reviews an answer THEN THE System SHALL allow selection of correct/incorrect status and modification of error reason
4. WHEN a teacher adds comments THEN THE System SHALL store the comments for inclusion in the final report
5. WHEN a teacher submits a review THEN THE System SHALL update the question_analysis with human-verified results and set review_status to "human_verified"
6. WHEN teacher review affects diagnostic conclusions THEN THE System SHALL trigger regeneration of affected report sections
7. THE System SHALL track teacher review statistics (review count, accuracy improvement, average review time) for quality monitoring
8. WHEN multiple teachers are available THEN THE System SHALL distribute review tasks based on subject expertise and current workload

### Requirement 8: 书写规范与习惯分析

**User Story:** 作为系统，我需要分析学生的书写质量和答题习惯，以便提供非智力因素诊断。

#### Acceptance Criteria

1. WHEN analyzing handwriting THEN THE System SHALL compute a messiness score (0.0-1.0) based on stroke clarity, spacing, and consistency
2. WHEN detecting modifications THEN THE System SHALL count cross-outs, erasures, and overwriting instances on the exam
3. WHEN evaluating layout THEN THE System SHALL identify alignment issues, boundary violations, and answer placement problems
4. WHEN assessing readability THEN THE System SHALL estimate the risk of machine misreading (low/medium/high) based on handwriting quality
5. WHEN handwriting analysis is complete THEN THE System SHALL populate the handwriting_metrics object with all computed metrics

### Requirement 9: AI 深度诊断与归因（DeepSeek）

**User Story:** 作为系统，我需要使用 DeepSeek 进行深度诊断和归因分析，以便生成专业的测评结论。

#### Acceptance Criteria

1. WHEN THE DeepSeek_Engine receives structured exam data THEN THE System SHALL perform multi-dimensional capability assessment (comprehension, application, analysis, synthesis, evaluation)
2. WHEN diagnosing errors THEN THE DeepSeek_Engine SHALL distinguish between surface issues (30%: careless mistakes, time management) and deep issues (70%: knowledge gaps, logical thinking, learning methods)
3. WHEN generating diagnostic conclusions THEN THE System SHALL ensure all conclusions are supported by specific Evidence_Field references (question IDs, error patterns, handwriting metrics)
4. WHEN making recommendations THEN THE DeepSeek_Engine SHALL NOT assign scores directly but SHALL provide diagnostic reasoning and improvement pathways
5. IF a conclusion lacks sufficient evidence THEN THE System SHALL mark the conclusion as "需要更多信息" rather than making unsupported claims
6. WHEN calculating capability dimensions THEN THE System SHALL use weighted scoring based on question difficulty and knowledge importance

### Requirement 10: 测评报告生成（4 页结构）

**User Story:** 作为家长或教师，我想获得一份专业的 4 页测评报告，以便了解学生的学业能力、知识漏洞和改进方案。

#### Acceptance Criteria

1. WHEN generating a report THEN THE Report_Generator SHALL create exactly 4 pages with predefined structure and professional visual design
2. WHEN creating Page 1 (学业综合能力画像) THEN THE System SHALL display:
   - Overall score with visual emphasis
   - Objective vs subjective question accuracy rates
   - Five-dimension capability radar chart (comprehension, application, analysis, synthesis, evaluation)
   - Handwriting and error pattern diagnosis with AI visual analysis
   - Target school gap prediction (score difference and admission probability)
3. WHEN creating Page 2 (知识漏洞 × 学习习惯双维诊断) THEN THE System SHALL present:
   - Iceberg model visualization (30% surface issues / 70% deep issues)
   - Detailed breakdown of "careless mistakes" into specific categories (handwriting, stability, logical gaps)
   - Evidence references for each identified issue
   - Long-term consequences of unaddressed issues
   - Classification of issues as AI-addressable or requiring human intervention
4. WHEN creating Page 3 (AI 托管 vs 真人名师分流策略) THEN THE System SHALL provide:
   - Clear division of responsibilities (AI handles 30% repetitive/mechanical tasks, human handles 70% complex/strategic tasks)
   - Specific examples of what AI can and cannot do
   - Rationale for human teacher necessity without diminishing AI value
5. WHEN creating Page 4 (10 课时靶向突击行动方案) THEN THE System SHALL generate:
   - Phase-by-phase action plan (10 sessions) with specific learning objectives
   - Expected score improvement range for each phase
   - Concrete, executable action items for each session
   - Clear CTA (call-to-action) for booking diagnostic session
6. WHEN writing report content THEN THE System SHALL use professional, restrained language with diagnostic authority
7. WHEN describing issues THEN THE System SHALL avoid encouragement fluff and MAY create rational anxiety without exaggeration
8. WHEN report generation is complete THEN THE System SHALL validate that all claims are supported by evidence fields

### Requirement 11: 报告导出与分享（HTML + PDF）

**User Story:** 作为用户，我想将测评报告导出为 HTML 和 PDF 格式，以便分享和打印。

#### Acceptance Criteria

1. WHEN a report is complete THEN THE System SHALL render the report as responsive HTML with mobile-friendly layout
2. WHEN HTML rendering is complete THEN THE Android_App SHALL provide in-app preview and PDF export option
3. WHEN exporting to PDF THEN THE System SHALL preserve all visual elements, charts, colors, and formatting with high fidelity
4. WHEN export is requested THEN THE System SHALL generate the PDF file within 10 seconds
5. WHEN export is complete THEN THE System SHALL provide a download link valid for 24 hours and allow sharing via common channels (WeChat, email)
6. THE Android_App SHALL cache reports locally for offline viewing

### Requirement 12: 用户历史记录与报告管理

**User Story:** 作为用户，我想查看我的历史测评记录和报告，以便跟踪学习进展。

#### Acceptance Criteria

1. THE Android_App SHALL display user's exam history in chronological order with thumbnail previews
2. WHEN viewing history THEN THE System SHALL show exam date, subject, score, and processing status for each exam
3. WHEN a user selects a historical exam THEN THE System SHALL load and display the corresponding report
4. THE System SHALL allow users to compare reports across different time periods to track progress
5. WHEN a user deletes an exam THEN THE System SHALL remove the exam and associated report from user's account (soft delete with 30-day recovery period)

### Requirement 13: 系统架构与模块化设计

**User Story:** 作为开发者，我需要一个模块化、可扩展的系统架构，支持 Web 和 Android 平台，以便支持未来的商业化扩展。

#### Acceptance Criteria

1. THE Backend SHALL use Python FastAPI with modular design and clear separation of concerns
2. THE Frontend SHALL use React or Next.js for web UI and report preview (optional web portal)
3. THE Android_App SHALL provide native mobile experience with Kotlin/Java implementation
4. THE System SHALL implement an OCR abstraction layer supporting multiple OCR providers (Baidu, Tencent, Alibaba)
5. THE System SHALL separate concerns into independent modules: OCR layer, parsing module, analysis module, teacher review module, DeepSeek module, report generation module
6. WHEN modules communicate THEN THE System SHALL use standardized JSON schemas for data exchange via RESTful APIs
7. THE System SHALL support horizontal scaling for concurrent exam processing through message queue (Redis/RabbitMQ)
8. THE Android_App SHALL communicate with Backend through secure HTTPS APIs with request signing

### Requirement 14: 数据真实性与可追溯性

**User Story:** 作为产品负责人，我需要确保系统不使用 mock 数据，所有结论都有证据支撑，以便建立用户信任。

#### Acceptance Criteria

1. THE System SHALL NOT use mock data in any production or demo environment
2. WHEN making a diagnostic conclusion THEN THE System SHALL include references to specific Evidence_Field data (question IDs, error patterns, metrics)
3. WHEN displaying scores or metrics THEN THE System SHALL show the calculation basis or data source
4. IF evidence is insufficient for a conclusion THEN THE System SHALL mark the conclusion as "需要更多信息" rather than making unsupported guesses
5. WHEN storing analysis results THEN THE System SHALL maintain audit trails for all AI decisions and teacher reviews
6. THE System SHALL log all data transformations and decision points for debugging and quality improvement

### Requirement 15: DeepSeek 集成与 Prompt 管理

**User Story:** 作为系统，我需要高效集成 DeepSeek API 并管理可复用的 Prompt 模板，以便保证 AI 输出质量和一致性。

#### Acceptance Criteria

1. WHEN calling DeepSeek API THEN THE System SHALL use structured prompts with clear role definitions and output format specifications
2. WHEN generating diagnostic content THEN THE DeepSeek_Engine SHALL use reusable prompt templates stored in configuration files
3. WHEN DeepSeek returns a response THEN THE System SHALL validate the response structure against expected schema before processing
4. IF DeepSeek API fails THEN THE System SHALL retry up to 3 times with exponential backoff (1s, 2s, 4s)
5. IF all retries fail THEN THE System SHALL log the error and return a graceful degradation response
6. WHEN prompt templates are updated THEN THE System SHALL version control the templates for rollback capability
7. THE System SHALL monitor DeepSeek API usage, latency, and error rates for performance optimization

### Requirement 16: 性能与并发处理

**User Story:** 作为系统管理员，我需要系统能够高效处理多个并发请求，以便支持商业化运营。

#### Acceptance Criteria

1. WHEN processing an exam THEN THE System SHALL complete OCR, parsing, analysis, and report generation within 60 seconds for standard exams
2. WHEN multiple users upload exams simultaneously THEN THE System SHALL handle at least 10 concurrent requests without degradation
3. WHEN system load is high THEN THE System SHALL queue requests and provide estimated wait time to users
4. WHEN processing is complete THEN THE System SHALL notify users via push notification (Android) or polling mechanism
5. THE System SHALL monitor and log processing time for each module to identify bottlenecks
6. THE System SHALL implement caching for frequently accessed data (exam templates, knowledge point mappings) to improve performance
