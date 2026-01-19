-- 插入测试用户
INSERT INTO users (id, username, email, password_hash, role, status, created_at, updated_at)
VALUES 
    ('test-user-1', 'student', 'student@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'ACTIVE', NOW(), NOW()),
    ('test-admin-1', 'admin', 'admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'ACTIVE', NOW(), NOW());
-- 密码都是: password123

-- 插入测试课程
INSERT INTO courses (id, name, description, cover_image, category, difficulty, status, created_by, created_at, updated_at)
VALUES 
    ('course-1', 'Kotlin编程入门', '学习Kotlin编程语言的基础知识，适合初学者', 'https://picsum.photos/400/300?random=1', '编程', 'BEGINNER', 'PUBLISHED', 'test-admin-1', NOW(), NOW()),
    ('course-2', 'Android开发实战', '深入学习Android应用开发，包括Jetpack Compose', 'https://picsum.photos/400/300?random=2', '移动开发', 'INTERMEDIATE', 'PUBLISHED', 'test-admin-1', NOW(), NOW()),
    ('course-3', 'Spring Boot微服务', '构建企业级Spring Boot微服务应用', 'https://picsum.photos/400/300?random=3', '后端开发', 'ADVANCED', 'PUBLISHED', 'test-admin-1', NOW(), NOW());

-- 插入学习单元
INSERT INTO learning_units (id, course_id, title, "order", content_type, video_url, text_content, images, duration, knowledge_points)
VALUES 
    -- Kotlin课程单元
    ('unit-1-1', 'course-1', 'Kotlin简介', 1, 'TEXT', NULL, 
     'Kotlin是一种现代的编程语言，由JetBrains开发。它简洁、安全、可与Java互操作，是Android开发的首选语言。', 
     NULL, 10, '["Kotlin特性", "语言优势"]'),
    ('unit-1-2', 'course-1', '变量和数据类型', 2, 'MIXED', 'https://www.example.com/video1.mp4',
     'Kotlin支持类型推断，使用val声明不可变变量，var声明可变变量。', 
     '["https://picsum.photos/600/400?random=10"]', 15, '["变量声明", "数据类型", "类型推断"]'),
    ('unit-1-3', 'course-1', '函数和Lambda', 3, 'TEXT', NULL,
     '函数是Kotlin的一等公民。可以使用fun关键字定义函数，支持默认参数、命名参数和Lambda表达式。',
     NULL, 20, '["函数定义", "Lambda表达式", "高阶函数"]'),
    
    -- Android课程单元
    ('unit-2-1', 'course-2', 'Android架构概述', 1, 'TEXT', NULL,
     'Android应用采用组件化架构，包括Activity、Service、BroadcastReceiver和ContentProvider四大组件。',
     NULL, 15, '["Android架构", "四大组件"]'),
    ('unit-2-2', 'course-2', 'Jetpack Compose基础', 2, 'MIXED', 'https://www.example.com/video2.mp4',
     'Jetpack Compose是Android的现代UI工具包，使用声明式编程构建原生UI。',
     '["https://picsum.photos/600/400?random=11"]', 25, '["Compose", "声明式UI", "Composable"]'),
    
    -- Spring Boot课程单元
    ('unit-3-1', 'course-3', 'Spring Boot入门', 1, 'TEXT', NULL,
     'Spring Boot简化了Spring应用的开发，提供了自动配置和起步依赖。',
     NULL, 20, '["Spring Boot", "自动配置", "起步依赖"]');

-- 插入练习题
INSERT INTO exercises (id, unit_id, course_id, question, options, correct_answer, explanation, knowledge_points, difficulty, source, review_status, created_at)
VALUES 
    ('ex-1-1', 'unit-1-2', 'course-1', 
     '在Kotlin中，如何声明一个不可变变量？', 
     '["var name = \"John\"", "val name = \"John\"", "const name = \"John\"", "let name = \"John\""]',
     'val name = "John"',
     'val关键字用于声明不可变变量（只读变量），一旦赋值后不能修改。var用于声明可变变量。',
     '["变量声明", "val关键字"]',
     'BEGINNER', 'MANUAL', 'APPROVED', NOW()),
    
    ('ex-1-2', 'unit-1-3', 'course-1',
     'Lambda表达式的正确语法是？',
     '["{ x -> x * 2 }", "lambda x: x * 2", "function(x) { return x * 2 }", "(x) => x * 2"]',
     '{ x -> x * 2 }',
     'Kotlin的Lambda表达式使用花括号包围，参数在箭头左侧，函数体在右侧。',
     '["Lambda表达式", "语法"]',
     'BEGINNER', 'MANUAL', 'APPROVED', NOW()),
    
    ('ex-2-1', 'unit-2-2', 'course-2',
     'Jetpack Compose中，@Composable注解的作用是什么？',
     '["标记可组合函数", "标记Activity", "标记ViewModel", "标记数据类"]',
     '标记可组合函数',
     '@Composable注解用于标记可组合函数，这些函数可以发出UI并描述应用的UI层次结构。',
     '["Composable", "注解"]',
     'INTERMEDIATE', 'MANUAL', 'APPROVED', NOW());
