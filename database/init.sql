-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    status TINYINT DEFAULT 1 COMMENT '0:禁用 1:启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    deadline DATE NOT NULL,
    skills JSON,
    status ENUM('pending', 'in_progress', 'submitted', 'completed', 'cancelled') DEFAULT 'pending',
    publisher_id INT NOT NULL,
    worker_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_publisher (publisher_id),
    INDEX idx_worker (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务提交表
CREATE TABLE IF NOT EXISTS task_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL UNIQUE,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviewee (reviewee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入管理员账号 (用户名: admin, 密码: root123)
-- 密码哈希由 password_hash('root123', PASSWORD_BCRYPT) 生成
INSERT INTO users (username, password_hash, email, role, status) VALUES
('admin', '$2y$10$u/3RdzjGi92P4CtNRq7tUObPoNHNArxQ0ZxrL2axm7RF8LLURNnIa', 'admin@tasksystem.com', 'admin', 1);

-- 插入测试用户 (用户名: testuser, 密码: 123456)
-- 密码哈希由 password_hash('123456', PASSWORD_BCRYPT) 生成
INSERT INTO users (username, password_hash, email, role, status) VALUES
('testuser', '$2y$10$I67ZklvsKKaQxx17v95eSeP9g9oaalyVmaoJxao2CnatsuebvwNtq', 'test@tasksystem.com', 'user', 1);

-- 插入示例任务
INSERT INTO tasks (title, description, category, budget, deadline, skills, status, publisher_id) VALUES
('网站首页设计', '需要设计一个现代化的企业官网首页，要求简洁大气，响应式布局', '设计创意', 2000.00, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '["Figma", "UI设计", "响应式设计"]', 'pending', 1),
('Python数据分析脚本', '编写一个数据清洗和分析的Python脚本，处理Excel数据并生成报表', '技术开发', 1500.00, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '["Python", "Pandas", "数据分析"]', 'pending', 1),
('产品介绍视频脚本', '为新产品撰写一份2分钟的介绍视频脚本，需要突出产品特点', '文案写作', 800.00, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '["文案", "视频脚本"]', 'pending', 1);
