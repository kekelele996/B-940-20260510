# 任务发布接单系统 - 产品需求文档 (PRD)

## 1. 文档信息

| 项目名称 | 任务发布接单系统 |
|---------|----------------|
| 版本    | v1.0           |
| 创建日期 | 2026-01-20     |
| 技术栈   | React + PHP + MySQL |

---

## 2. 项目概述

### 2.1 项目背景

构建一个在线任务发布与接单平台，允许用户发布任务、接受任务并完成后进行评价。系统支持多种用户角色，实现任务的全生命周期管理。

### 2.2 目标用户

- **任务发布者**：需要外包工作或寻求帮助的用户
- **任务接单者**：希望通过完成任务获得报酬的用户
- **管理员**：负责平台管理和运营的人员

### 2.3 核心价值

- 提供便捷的任务发布和接单流程
- 建立可信赖的评价体系
- 确保交易双方权益

---

## 3. 功能需求

### 3.1 用户角色

| 角色 | 权限描述 |
|-----|---------|
| 普通用户 | 发布任务、接单、评价、查看历史 |
| 管理员 | 用户管理、任务审核、系统配置 |

### 3.2 功能模块

#### 3.2.1 用户模块

**注册功能**

- 用户名（唯一性校验）
- 密码（最少6位）
- 邮箱
- 手机号（可选）

**登录功能**

- 用户名/邮箱 + 密码登录
- 登录状态保持（JWT Token）
- 退出登录

**个人中心**

- 查看/编辑个人信息
- 查看我发布的任务
- 查看我接受的任务
- 查看我的评价

#### 3.2.2 任务模块

**发布任务**

- 任务标题（必填）
- 任务描述（必填，支持富文本）
- 任务分类（下拉选择）
- 任务预算（必填，数字）
- 截止日期（必填）
- 技能要求（可选，多选标签）

**任务列表**

- 分页展示
- 按分类筛选
- 按状态筛选
- 按时间/预算排序
- 关键词搜索

**任务详情**

- 完整任务信息
- 发布者信息
- 接单状态
- 评价信息

**任务状态流转**

```
待接单 → 进行中 → 待验收 → 已完成
         ↓
       已取消
```

#### 3.2.3 接单模块

**接单功能**

- 一键接单
- 接单确认弹窗
- 仅允许接单非本人发布的任务

**我的接单**

- 查看已接任务列表
- 提交任务成果
- 查看验收状态

**任务交付**

- 提交交付说明
- 支持附件上传（可选）

#### 3.2.4 评价模块

**评价功能**

- 仅任务发布者可评价接单者
- 仅已完成任务可评价
- 评分（1-5星）
- 评价内容（文字）
- 评价后不可修改

**评价展示**

- 任务详情页显示评价
- 用户个人页显示收到的评价

#### 3.2.5 管理模块

**用户管理**

- 用户列表（分页）
- 用户搜索
- 禁用/启用用户
- 查看用户详情

**任务管理**

- 任务列表（全部）
- 任务审核
- 删除违规任务

**默认管理员账号**

- 用户名：admin
- 密码：root123

---

## 4. 非功能需求

### 4.1 性能要求

- 页面加载时间 < 3秒
- API响应时间 < 500ms

### 4.2 安全要求

- 密码使用 bcrypt 加密存储
- API使用JWT认证
- 防止SQL注入（通过 Eloquent ORM 参数绑定）
- XSS防护
- 使用 ORM 避免 SQL 注入风险

### 4.3 兼容性

- 支持Chrome、Firefox、Safari、Edge最新版
- 响应式设计，支持移动端访问

---

## 5. 技术架构

### 5.1 技术栈

| 层次 | 技术选型 |
|-----|---------|
| 前端 | React 18 + Vite + TypeScript + TailwindCSS 3 + RadixUI |
| 后端 | PHP 8.2-fpm |
| ORM | Eloquent ORM (Illuminate Database) |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose (All-in-one) |

### 5.1.1 架构模式

- **MVC 架构**: 采用 Model-View-Controller 分层架构
  - **Model 层**: 使用 Eloquent ORM 进行数据访问，封装业务逻辑
  - **Controller 层**: 处理 HTTP 请求，调用 Model 层方法，返回响应
  - **View 层**: React 前端组件负责 UI 渲染

- **ORM 数据访问**: 使用 Eloquent ORM 管理数据库操作
  - 严禁拼接原始 SQL 字符串
  - 所有数据库操作通过 Eloquent Model 进行
  - 支持关联查询、数据验证、类型转换等特性

### 5.2 项目结构

```
vibe-react-php-mysql-tasksystem/
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面
│   │   ├── api/            # API调用
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── stores/         # 状态管理
│   │   └── utils/          # 工具函数
│   ├── Dockerfile
│   └── package.json
├── backend/                # 后端项目
│   ├── public/             # 入口文件
│   ├── src/
│   │   ├── Config/         # 配置文件（数据库、Eloquent）
│   │   ├── Controllers/    # 控制器层（处理请求逻辑）
│   │   ├── Models/         # 模型层（业务逻辑封装）
│   │   │   └── Eloquent/  # Eloquent ORM 模型
│   │   ├── Middleware/     # 中间件（认证、授权等）
│   │   └── Utils/          # 工具类
│   ├── vendor/             # Composer 依赖
│   ├── composer.json       # PHP 依赖管理
│   └── Dockerfile
├── database/               # 数据库
│   └── init.sql            # 初始化脚本
├── docker-compose.yml
└── README.md
```

### 5.3 数据库设计

#### users 用户表

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名，唯一 |
| password_hash | VARCHAR(255) | 密码哈希 |
| email | VARCHAR(100) | 邮箱 |
| phone | VARCHAR(20) | 手机号 |
| role | ENUM | user/admin |
| status | TINYINT | 0禁用/1启用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### tasks 任务表

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | INT | 主键 |
| title | VARCHAR(200) | 任务标题 |
| description | TEXT | 任务描述 |
| category | VARCHAR(50) | 任务分类 |
| budget | DECIMAL(10,2) | 预算金额 |
| deadline | DATE | 截止日期 |
| skills | JSON | 技能要求 |
| status | ENUM | pending/in_progress/submitted/completed/cancelled |
| publisher_id | INT | 发布者ID，外键 |
| worker_id | INT | 接单者ID，外键 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### task_submissions 任务提交表

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | INT | 主键 |
| task_id | INT | 任务ID，外键 |
| content | TEXT | 提交内容 |
| attachment_url | VARCHAR(500) | 附件链接 |
| created_at | DATETIME | 创建时间 |

#### reviews 评价表

| 字段 | 类型 | 说明 |
|-----|------|-----|
| id | INT | 主键 |
| task_id | INT | 任务ID，外键 |
| reviewer_id | INT | 评价者ID |
| reviewee_id | INT | 被评价者ID |
| rating | TINYINT | 评分1-5 |
| content | TEXT | 评价内容 |
| created_at | DATETIME | 创建时间 |

---

## 6. API设计

### 6.1 认证相关

| 方法 | 路径 | 说明 |
|-----|------|-----|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 退出登录 |
| GET | /api/auth/me | 获取当前用户信息 |

### 6.2 任务相关

| 方法 | 路径 | 说明 |
|-----|------|-----|
| GET | /api/tasks | 获取任务列表 |
| GET | /api/tasks/:id | 获取任务详情 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |
| POST | /api/tasks/:id/accept | 接受任务 |
| POST | /api/tasks/:id/submit | 提交任务 |
| POST | /api/tasks/:id/complete | 完成任务 |
| POST | /api/tasks/:id/cancel | 取消任务 |

### 6.3 评价相关

| 方法 | 路径 | 说明 |
|-----|------|-----|
| POST | /api/tasks/:id/review | 创建评价 |
| GET | /api/users/:id/reviews | 获取用户评价 |

### 6.4 用户相关

| 方法 | 路径 | 说明 |
|-----|------|-----|
| GET | /api/users/:id | 获取用户信息 |
| PUT | /api/users/:id | 更新用户信息 |
| GET | /api/users/:id/tasks | 获取用户发布的任务 |
| GET | /api/users/:id/accepted | 获取用户接受的任务 |

### 6.5 管理员相关

| 方法 | 路径 | 说明 |
|-----|------|-----|
| GET | /api/admin/users | 用户列表 |
| PUT | /api/admin/users/:id/status | 更新用户状态 |
| GET | /api/admin/tasks | 任务列表（全部） |
| DELETE | /api/admin/tasks/:id | 删除任务 |

---

## 7. UI设计规范

### 7.1 设计风格

- **主色调**：白色为主，搭配浅灰色边框
- **强调色**：深灰色/黑色用于重要操作按钮
- **字体**：系统默认无衬线字体
- **圆角**：8px 统一圆角
- **阴影**：轻微阴影增加层次感

### 7.2 页面列表

1. 登录页
2. 注册页
3. 首页（任务列表）
4. 任务详情页
5. 发布任务页
6. 我的任务页
7. 我的接单页
8. 个人中心页
9. 管理后台 - 用户管理
10. 管理后台 - 任务管理

---

## 8. 交付标准

### 8.1 Docker化交付

- 提供完整的 `docker-compose.yml`
- 包含 frontend、backend、db 三个服务
- 执行 `docker compose up` 即可启动

### 8.2 端口规划

| 服务 | 端口 |
|-----|------|
| 前端 | 3000 |
| 后端API | 8080 |
| MySQL | 3306 |

### 8.3 验收标准

- ✅ `docker compose up` 一键启动
- ✅ 前端可正常访问 <http://localhost:3000>
- ✅ 用户注册/登录功能正常
- ✅ 任务发布/接单/评价流程完整
- ✅ 管理员可正常管理用户和任务
- ✅ UI整洁美观，以白色为主

---

## 9. 里程碑计划

| 阶段 | 内容 | 预期产出 |
|-----|------|---------|
| M1 | 环境搭建 | Docker配置、项目骨架 |
| M2 | 后端开发 | 完整API |
| M3 | 前端开发 | 完整UI |
| M4 | 集成测试 | 功能验证 |
| M5 | 交付 | 完整文档 |
