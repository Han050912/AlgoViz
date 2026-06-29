# AlgoViz

> 企业级算法代码可视化与分析平台 — 上传代码，可视化你的算法

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-5.22-0170FE?logo=ant-design)](https://ant.design/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-003B57?logo=python)](https://www.sqlalchemy.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

AlgoViz 是一个面向开发者、教师和算法学习者的可视化分析平台。用户编写或上传算法代码，平台通过 AI 模型分析代码执行过程，生成交互式的逐步骤执行轨迹可视化报告，包括变量状态变化、函数调用栈、复杂度分析和数据结构图形化展示。

本项目采用前后端分离架构：前端基于 React 19 + TypeScript + Vite 6，后端基于 FastAPI + SQLAlchemy 2.0 (async) + MySQL 8.0。

## ✨ 核心功能

### 🔐 认证系统

| 功能 | 描述 |
|------|------|
| 用户登录 | 邮箱 + 密码登录，支持 JWT 认证，可选"记住我"（localStorage / sessionStorage） |
| 用户注册 | 邮箱（支持 Gmail / Outlook / QQ / 163 / Yahoo 快捷选择）+ 密码 + 确认密码 + 模拟人机验证 |
| 忘记密码 | 邮箱验证 → 发送验证码（60 秒倒计时）→ 设置新密码 |
| 自动登录 | 页面加载时检测有效 Token，自动跳转到工作台 |
| Token 刷新 | 401 自动触发 refresh_token 流程，成功后重试原请求；失败则清除 Token 并跳转登录 |

### 🖥️ 工作台（Workspace）

三栏布局（35% / 40% / 25%），从左到右依次为：

| 区域 | 组件 | 功能 |
|------|------|------|
| **代码编辑器** | Monaco Editor | 支持 Python / JavaScript / Java / C++ / Go / Rust 6 种语言的高亮编辑，代码折叠，行号，字体自适应 |
| **轨迹可视化** | Canvas Trace Viewer | 基于原生 Canvas 2D API 渲染的执行轨迹画布，实时展示变量状态和函数调用 |
| **播放控制** | Playback Controls | 播放/暂停、上一步/下一步、步骤滑块、速度调节（0.25x - 4x） |
| **复杂度分析** | Analysis Panel | 时间/空间复杂度徽章（颜色编码）、算法步骤解释、流式分析指示器 |
| **调用栈** | Call Stack Panel | 按层级显示函数调用栈，当前帧高亮 |
| **变量表** | Variable Table | 区分局部变量（金色）和全局变量（蓝色），支持对象 JSON 序列化展示 |
| **输出控制台** | Output Console | 程序输出行显示，固定最大高度可滚动 |
| **数据结构视图** | D3 Force Graph | 基于 D3.js 力导向图渲染树/图等数据结构的可视化 |

### 📁 项目管理

| 功能 | 描述 |
|------|------|
| 侧边栏导航 | 可折叠（240px ↔ 48px），展示我的项目和模板库 |
| 模板库 | 内置 6 种经典算法模板：冒泡排序、快速排序、二分查找、归并排序、DFS/BFS 遍历 |
| 文件上传 | 支持 `.py / .js / .java / .cpp / .go / .rs / .txt` 文件直接上传到编辑器 |
| 语言切换 | 编辑器工具栏一键切换编程语言 |

### 📜 历史记录

| 功能 | 描述 |
|------|------|
| 历史列表 | 卡片网格布局，显示分析标题、语言标签（彩色编码）、步数、时间戳 |
| 历史回放 | 详情页支持完整的播放控制、变量追踪、调用栈查看和复杂度分析回顾 |

### ⚙️ AI 模型设置

| 功能 | 描述 |
|------|------|
| 模型配置 CRUD | 创建、编辑、删除 AI 模型连接配置 |
| 快速预设 | 一键填充 DeepSeek / OpenAI / Ollama / SiliconFlow / Groq 预设 |
| 连接测试 | 模拟测试 API 连接状态 |
| 默认模型 | 标记默认使用的 AI 模型 |
| 连接状态指示 | 绿色圆点表示已连接，灰色表示未测试 |

### 🎨 主题与国际化

| 功能 | 描述 |
|------|------|
| 深色/亮色模式 | 认证页面支持暗色/亮色切换，偏好持久化到 localStorage |
| Ant Design 主题 | 深度定制暗色主题（品牌金色主色调 #D49A20） |
| 中文本地化 | 所有 UI 文本和表单均为简体中文 |
| 品牌视觉 | 深蓝色背景 + 金色强调色 + 紫色辅助色，专业克制的设计风格 |

## 🛠️ 技术栈

### 前端

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | React | 19 | UI 组件库 |
| 语言 | TypeScript | 5.6 | 类型安全 |
| 构建工具 | Vite | 6 | 开发服务器 / 打包 |
| 路由 | React Router DOM | 7 | 客户端路由 |
| UI 组件 | Ant Design | 5.22 | 表单、按钮、卡片等 |
| 样式 | Tailwind CSS | 3.4 | 原子化 CSS |
| 代码编辑器 | Monaco Editor (via @monaco-editor/react) | 4.7 | 语法高亮、代码编辑 |
| 数据可视化 | D3.js | 7.9 | 力导向图渲染 |
| HTTP 客户端 | Axios | 1.7 | API 请求、拦截器 |
| Markdown | marked | 18 | 分析报告中 Markdown 渲染 |
| 字体 | Google Fonts (Inter) + JetBrains Mono / Fira Code | - | 排版 |

### 后端（已实现）

| 类别 | 技术 | 用途 | 状态 |
|------|------|------|------|
| 框架 | FastAPI 0.115 + SQLAlchemy 2.0 (async) | RESTful API + SSE 流式推送 | ✅ |
| 数据库 | MySQL 8.0 + aiomysql | 持久化存储（CHAR(36) UUID 主键） | ✅ |
| 迁移 | Alembic | 数据库版本管理 | ✅ |
| 任务队列 | Celery + Redis | 异步分析任务（预留） | ⏳ |
| 沙箱隔离 | Docker | 代码安全执行（预留） | ⏳ |
| 认证 | JWT + bcrypt(12) | 用户身份验证（access 30min + refresh 7d） | ✅ |
| 加密 | AES-256-GCM | API Key 加密存储 | ✅ |
| SSE | sse-starlette | 实时流式推送（trace + analysis chunks） | ✅ |
| DI | FastAPI Depends | get_db, get_current_user 依赖注入 | ✅ |

### 部署

| 技术 | 用途 |
|------|------|
| Docker + Docker Compose | 容器化部署前后端及服务 |

## 📁 项目结构

```
AlgoViz/
├── backend/                      # 后端源码
│   ├── app/
│   │   ├── main.py               # FastAPI 应用入口（CORS、路由注册、全局异常处理）
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic Settings（读取 .env）
│   │   │   ├── database.py       # SQLAlchemy async engine + session
│   │   │   └── security.py       # JWT + bcrypt + AES-256-GCM
│   │   ├── models/               # SQLAlchemy 数据模型（6 张表）
│   │   │   ├── base.py           #   DeclarativeBase
│   │   │   ├── user.py           #   用户（email 唯一）
│   │   │   ├── api_config.py     #   AI 配置（AES 加密 API Key）
│   │   │   ├── project.py        #   代码项目（SHA-256 哈希）
│   │   │   ├── analysis.py       #   分析任务（status 枚举）
│   │   │   ├── analysis_report.py #  分析报告（1:1 with analyses）
│   │   │   └── execution_trace.py #  执行轨迹（1:1 with analyses）
│   │   ├── schemas/              # Pydantic 请求/响应 schema
│   │   │   ├── common.py         #   APIResponse<T> 统一响应
│   │   │   ├── auth.py           #   注册/登录/刷新/重置 schema
│   │   │   ├── config.py         #   AI 配置 CRUD schema
│   │   │   └── project.py        #   项目 CRUD schema
│   │   ├── api/
│   │   │   ├── deps.py           # DI 依赖（get_db, get_current_user）
│   │   │   └── v1/
│   │   │       ├── auth.py       # 注册 / 登录 / 刷新 / 个人信息 / 密码重置
│   │   │       ├── configs.py    # AI 配置 CRUD + 连接测试 + 设默认
│   │   │       ├── projects.py   # 项目 CRUD + 收藏
│   │   │       ├── analyses.py   # 分析 SSE 流式端点
│   │   │       └── history.py    # 历史记录列表（分页 + 过滤）
│   │   ├── services/
│   │   │   ├── config_service.py # API 配置 CRUD + AES 加解密
│   │   │   ├── project_service.py# 项目 CRUD + 分页
│   │   │   ├── analysis_service.py # 分析流程编排
│   │   │   ├── ai_service.py     # OpenAI SDK 封装 + 分析/追踪提示词
│   │   │   ├── sandbox/          # Docker 沙箱（预留）
│   │   │   └── tasks/            # Celery 异步任务（预留）
│   ├── alembic/                  # 数据库迁移
│   │   ├── env.py                # Alembic 环境配置（自动适配 async→sync URL）
│   │   └── versions/             # 迁移脚本
│   ├── tests/                    # 后端测试（pytest + httpx）
│   ├── init.sql                  # 数据库初始化建表脚本
│   ├── requirements.txt          # Python 依赖
│   └── alembic.ini               # Alembic 配置
├── src/                          # 前端源码（见下方）
│   ├── components/                 # 可复用组件
│   │   ├── AnalysisPanel/          # 复杂度分析面板
│   │   │   ├── AnalysisPanel.tsx   #   分析报告 + 步骤解释
│   │   │   └── ComplexityBadge.tsx #   复杂度徽章（颜色编码）
│   │   ├── ApiConfig/              # AI 模型配置
│   │   │   ├── ConfigCard.tsx      #   配置卡片
│   │   │   ├── ConfigEmptyState.tsx #  空状态 + 快速预设
│   │   │   └── ConfigFormModal.tsx #   新建/编辑模态框
│   │   ├── CodeEditor/             # 代码编辑器
│   │   │   ├── MonacoEditor.tsx    #   Monaco 编辑器封装
│   │   │   ├── EditorToolbar.tsx   #   工具栏（语言/模板/上传）
│   │   │   └── templates.ts        #   6 种算法模板源码
│   │   ├── Layout/                 # 布局组件
│   │   │   ├── MainLayout.tsx      #   全局布局（Header + Sidebar + Content）
│   │   │   ├── Header.tsx          #   顶部导航栏
│   │   │   └── Sidebar.tsx         #   可折叠侧边栏
│   │   ├── TraceViewer/            # 执行轨迹可视化
│   │   │   ├── TraceViewerCanvas.tsx #  Canvas 2D 轨迹画布
│   │   │   ├── PlaybackControls.tsx  #  播放控制栏
│   │   │   ├── CallStackPanel.tsx    #  调用栈面板
│   │   │   ├── VariableTable.tsx       #  变量表
│   │   │   ├── OutputConsole.tsx       #  输出控制台
│   │   │   └── DataStructureView.tsx   #  D3 数据结构图
│   │   ├── auth/                   # 认证页面组件
│   │   │   ├── AuthLayout.tsx      #   65/35 分栏布局容器
│   │   │   ├── LeftPanel.tsx       #   左侧品牌区（粒子动画）
│   │   │   ├── AlgoVizLogo.tsx     #   Logo SVG
│   │   │   └── DarkModeToggle.tsx  #   主题切换按钮
│   │   └── common/                 # 通用组件
│   │       ├── EmptyState.tsx      #   空状态占位
│   │       ├── LoadingSkeleton.tsx #   骨架屏
│   │       └── Logo.tsx            #   通用 Logo
│   ├── hooks/
│   │   └── useAutoLogin.ts         # 自动登录检测 Hook
│   ├── pages/                      # 页面组件
│   │   ├── Login/
│   │   │   └── LoginPage.tsx       # 登录页
│   │   ├── Register/
│   │   │   └── RegisterPage.tsx    # 注册页
│   │   ├── ForgotPassword/
│   │   │   └── ForgotPasswordPage.tsx # 忘记密码页
│   │   ├── Workspace/
│   │   │   └── WorkspacePage.tsx   # 工作台（三栏布局）
│   │   ├── History/
│   │   │   ├── HistoryPage.tsx     # 历史列表
│   │   │   └── HistoryDetailPage.tsx # 历史详情回放
│   │   └── Settings/
│   │       └── SettingsPage.tsx    # AI 模型设置
│   ├── services/
│   │   ├── api.ts                  # Axios 实例 + 请求/响应拦截器
│   │   └── authService.ts          # 认证 API 封装
│   ├── styles/
│   │   ├── global.css              # CSS 变量 + 全局样式 + 滚动条
│   │   ├── animations.css          # 关键帧动画（fadeInUp, pulse, scaleIn 等）
│   │   └── auth.css                # 认证页专用样式（~245 行）
│   ├── theme/
│   │   └── themeConfig.ts          # Ant Design 暗色主题配置
│   ├── types/                      # TypeScript 类型定义
│   │   ├── auth.ts                 #   认证 API 契约
│   │   ├── project.ts              #   项目 & API 配置类型
│   │   ├── trace.ts                #   执行轨迹类型
│   │   └── analysis.ts             #   分析报告类型
│   ├── App.tsx                     # 路由配置
│   └── main.tsx                    # 入口
├── .gitignore
├── CLAUDE.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 20
- npm >= 9（或使用 pnpm / yarn）
- Python >= 3.10
- MySQL 8.0+
- （可选）Docker + Redis — 用于沙箱执行和 Celery 异步任务

### 安装依赖

#### 前端

```bash
npm install
```

#### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 配置环境变量

#### 后端

在 `backend/` 目录下创建 `.env` 文件：

```env
DATABASE_URL=mysql+aiomysql://root:your_password@127.0.0.1:3306/algoviz_db?charset=utf8mb4
SECRET_KEY=your-super-secret-key-change-in-production
ENCRYPTION_KEY=your-base64-encoded-32-byte-key
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=["http://localhost:5173"]
```

#### 前端

在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS algoviz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入建表脚本
mysql -u root -p algoviz_db < backend/init.sql
```

### 数据库迁移 (Alembic)

```bash
cd backend
source .venv/bin/activate   # Windows: .venv\Scripts\activate
alembic upgrade head
```

### 启动后端

```bash
cd backend
source .venv/bin/activate   # Windows: .venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

后端将在 `http://localhost:8000` 启动，API 文档在 `http://localhost:8000/docs`。

### 启动前端

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🌐 路由说明

| 路径 | 页面 | 是否需要登录 |
|------|------|:---:|
| `/login` | 登录 | ❌ |
| `/register` | 注册 | ❌ |
| `/forgot-password` | 忘记密码 | ❌ |
| `/workspace` | 工作台 | ✅ |
| `/workspace/:id` | 打开项目 | ✅ |
| `/history` | 历史记录 | ✅ |
| `/history/:id` | 历史回放 | ✅ |
| `/settings` | AI 模型设置 | ✅ |
| `*` | 重定向到 `/login` | - |

## 🎯 品牌设计

| 元素 | 值 |
|------|------|
| 品牌主色 | `#D49A20`（暖金色） |
| 品牌辅色 | `#6D28D9`（紫罗兰） |
| 页面背景 | `#030712`（深蓝黑） |
| 面板背景 | `#1F2937`（深灰） |
| 文字主色 | `#F9FAFB`（近白） |
| 文字次色 | `#D1D5DB`（浅灰） |
| 字体（正文） | Inter + Microsoft YaHei |
| 字体（代码） | JetBrains Mono + Fira Code + Consolas |

## 📊 数据协议

### 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

- `code = 0`：成功
- `code ≠ 0`：错误

### 执行轨迹 JSON 协议

```json
{
  "version": "1.0",
  "language": "python",
  "execution_mode": "docker|ai_simulation",
  "steps": [
    {
      "step": 1,
      "line": 5,
      "action": "variable_assignment",
      "function": "bubble_sort",
      "call_stack": ["bubble_sort"],
      "locals": { "i": 0, "j": 0, "n": 7 },
      "globals": { "arr": [64, 34, 25, 12, 22, 11, 90] },
      "output": ""
    }
  ],
  "total_steps": 15
}
```

### SSE 流式事件序列

`POST /api/v1/analyses/stream` 返回的事件顺序：

```
status(running) → status(ai_tracing) → trace(step1) → trace(step2) → ...
→ status(ai_analyzing) → analysis(chunk1) → analysis(chunk2) → ...
→ complete
```

## 🌐 API 文档

后端启动后访问：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 主要 API 端点

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 | 否 |
| POST | `/api/v1/auth/login` | 用户登录 | 否 |
| POST | `/api/v1/auth/refresh` | 刷新令牌 | 否 |
| POST | `/api/v1/auth/send-reset-code` | 发送重置验证码 | 否 |
| POST | `/api/v1/auth/reset-password` | 重置密码 | 否 |
| GET | `/api/v1/auth/me` | 获取当前用户 | 是 |
| POST | `/api/v1/configs` | 创建 AI 配置 | 是 |
| GET | `/api/v1/configs` | 列出 AI 配置 | 是 |
| PUT | `/api/v1/configs/{id}` | 更新 AI 配置 | 是 |
| DELETE | `/api/v1/configs/{id}` | 删除 AI 配置 | 是 |
| POST | `/api/v1/configs/{id}/test` | 测试 API 连接 | 是 |
| PUT | `/api/v1/configs/{id}/default` | 设为默认配置 | 是 |
| POST | `/api/v1/projects` | 创建项目 | 是 |
| GET | `/api/v1/projects` | 列出项目（分页） | 是 |
| GET | `/api/v1/projects/{id}` | 获取项目详情 | 是 |
| DELETE | `/api/v1/projects/{id}` | 删除项目 | 是 |
| PUT | `/api/v1/projects/{id}/favorite` | 切换收藏 | 是 |
| POST | `/api/v1/analyses/stream` | SSE 流式分析 | 是 |
| GET | `/api/v1/history` | 分析历史（分页 + 过滤） | 是 |

## 🔒 安全机制

| 机制 | 说明 |
|------|------|
| 密码加密 | bcrypt (cost factor 12) |
| API Key 加密 | AES-256-GCM 存储 |
| Token 管理 | JWT access_token (30min) + refresh_token (7d) |
| 沙箱隔离 | Docker 网络禁用、只读文件系统、超时限制、no-new-privileges |
| 自动登出 | 401 且 refresh 失败 → 清除所有 Token → 跳转登录 |

## 📝 开发计划

后端已完成实现，当前前后端均已就绪。后续开发阶段：

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 项目骨架（Vite、FastAPI、Docker Compose、init.sql） | ✅ 前后端 |
| Phase 2 | 认证系统（JWT、User 模型、安全模块） | ✅ 前后端 |
| Phase 3 | 前端认证页面 + Axios 拦截器 | ✅ 前端 |
| Phase 4 | AI 模型配置 CRUD | ✅ 前后端 |
| Phase 5 | 项目管理（Project 模型、Monaco Editor 集成） | ✅ 前后端 |
| Phase 6 | 沙箱执行 + AI 分析 + SSE 流式推送 | ✅ AI/SSE（Docker 沙箱预留） |
| Phase 7 | Canvas 轨迹可视化 + 播放控制 | ✅ 前端 |
| Phase 8 | 历史记录 + 全局异常处理 + 集成测试 | ✅ 后端 |
| TBD | Docker Compose 一键部署 | ⏳ 待开发 |
| TBD | Celery 异步任务队列 | ⏳ 待开发 |
| TBD | Docker 沙箱真实执行 | ⏳ 待开发 |

## 📄 许可证

MIT
