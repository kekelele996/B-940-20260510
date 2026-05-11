# 任务发布与接单系统

这是一个基于 React + PHP + MySQL 的现代化任务发布与接单平台。支持任务发布、接单、提交验收、评价等完整流程。

## 🛠 技术栈

- **Frontend**: React, TypeScript, TailwindCSS, Radix UI, Zustand, Vite
- **Backend**: PHP 8.2 (Pure, No Framework), Nginx
- **ORM**: Eloquent ORM (Illuminate Database)
- **Database**: MySQL 8.0
- **Infrastructure**: Docker, Docker Compose

## 🏗 架构设计

- **MVC 架构**: 采用 Model-View-Controller 分层架构
  - **Model 层**: 使用 Eloquent ORM 进行数据访问，封装业务逻辑
  - **Controller 层**: 处理 HTTP 请求，调用 Model 层方法，返回响应
  - **View 层**: React 前端组件负责 UI 渲染

- **ORM 数据访问**: 使用 Eloquent ORM 管理数据库操作
  - 严禁拼接原始 SQL 字符串
  - 所有数据库操作通过 Eloquent Model 进行
  - 支持关联查询、数据验证、类型转换等特性

## 🚀 快速开始

### 前置要求

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 安装与启动

1. 确保 Docker 正在运行。
2. 在项目根目录下运行：

```bash
docker compose up -d --build
```

### 访问应用

- **前端地址**: <http://localhost:3000>
- **API 地址**: <http://localhost:3000/api>

## 🔑 测试账号

系统初始化时会自动创建以下账号：

| 角色 | 用户名 | 密码 | 说明 |
|------|-----------|----------|------|
| 管理员 | `admin` | `root123` | 拥有后台管理权限 |
| 普通用户 | `testuser` | `123456` | 用于测试发布和接单 |

你也可以在登录页面注册新账号。

## 📂 项目结构

```
.
├── backend/                # PHP 后端代码
│   ├── public/            # 入口文件
│   ├── src/               # 源代码
│   │   ├── Config/        # 配置文件（数据库、Eloquent）
│   │   ├── Controllers/   # 控制器层（处理请求逻辑）
│   │   ├── Models/        # 模型层（业务逻辑封装）
│   │   │   └── Eloquent/  # Eloquent ORM 模型
│   │   ├── Middleware/    # 中间件（认证、授权等）
│   │   └── Utils/         # 工具类
│   ├── Dockerfile         # 后端容器构建文件
│   └── nginx.conf         # 后端 Nginx 配置
├── frontend/               # React 前端代码
│   ├── src/               # 源代码 (Components, Pages, Stores)
│   ├── Dockerfile         # 前端容器构建文件
│   └── nginx.conf         # 前端 Nginx 配置
├── database/               # 数据库相关
│   └── init.sql           # 数据库初始化脚本
├── docker-compose.yml      # Docker 编排文件
```

## 📝 功能特性

- **用户系统**: 注册、登录、个人详情编辑
- **任务大厅**: 任务列表、筛选（状态、分类）、搜索
- **任务管理**:
  - 发布任务
  - 接单（普通用户）
  - 提交验收（接单者）
  - 确认完成（发布者）
  - 取消任务
- **评价系统**: 任务完成后双方评价
- **管理后台**: 用户管理（禁用/启用）、任务管理（删除）、数据统计
