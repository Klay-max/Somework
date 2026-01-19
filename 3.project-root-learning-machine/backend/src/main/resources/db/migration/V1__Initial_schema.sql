-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- User profiles table
CREATE TABLE user_profiles (
    user_id VARCHAR(255) PRIMARY KEY,
    nickname VARCHAR(255),
    avatar VARCHAR(500),
    grade VARCHAR(100),
    preferences JSONB,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Courses table
CREATE TABLE courses (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    cover_image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);

-- Learning units table
CREATE TABLE learning_units (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    "order" INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    video_url VARCHAR(500),
    text_content TEXT,
    images JSONB,
    duration INTEGER,
    knowledge_points JSONB,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_learning_units_course ON learning_units(course_id);
CREATE INDEX idx_learning_units_order ON learning_units(course_id, "order");

-- Exercises table
CREATE TABLE exercises (
    id VARCHAR(255) PRIMARY KEY,
    unit_id VARCHAR(255),
    course_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    explanation TEXT NOT NULL,
    knowledge_points JSONB NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    review_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES learning_units(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercises_unit ON exercises(unit_id);
CREATE INDEX idx_exercises_course ON exercises(course_id);
CREATE INDEX idx_exercises_source ON exercises(source);
CREATE INDEX idx_exercises_review_status ON exercises(review_status);

-- Learning records table
CREATE TABLE learning_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    unit_id VARCHAR(255) NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_position INTEGER,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES learning_units(id) ON DELETE CASCADE,
    UNIQUE(user_id, unit_id)
);

CREATE INDEX idx_learning_records_user ON learning_records(user_id);
CREATE INDEX idx_learning_records_course ON learning_records(course_id);
CREATE INDEX idx_learning_records_unit ON learning_records(unit_id);

-- Exercise history table
CREATE TABLE exercise_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    exercise_id VARCHAR(255) NOT NULL,
    user_answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    submitted_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_history_user ON exercise_history(user_id);
CREATE INDEX idx_exercise_history_exercise ON exercise_history(exercise_id);
CREATE INDEX idx_exercise_history_submitted ON exercise_history(submitted_at);

-- Wrong answers table
CREATE TABLE wrong_answers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    exercise_id VARCHAR(255) NOT NULL,
    user_answer VARCHAR(500) NOT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    knowledge_points JSONB NOT NULL,
    is_mastered BOOLEAN NOT NULL DEFAULT FALSE,
    redo_count INTEGER NOT NULL DEFAULT 0,
    last_redo_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_wrong_answers_user ON wrong_answers(user_id);
CREATE INDEX idx_wrong_answers_exercise ON wrong_answers(exercise_id);
CREATE INDEX idx_wrong_answers_mastered ON wrong_answers(is_mastered);

-- AI conversations table
CREATE TABLE ai_conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    messages JSONB NOT NULL,
    context JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Reminders table
CREATE TABLE reminders (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    time VARCHAR(10) NOT NULL,
    days_of_week JSONB NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    message VARCHAR(500) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_enabled ON reminders(is_enabled);

-- System notifications table
CREATE TABLE system_notifications (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    target_user_ids JSONB NOT NULL,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivery_rate DOUBLE PRECISION,
    read_rate DOUBLE PRECISION
);

CREATE INDEX idx_system_notifications_scheduled ON system_notifications(scheduled_at);
CREATE INDEX idx_system_notifications_sent ON system_notifications(sent_at);
