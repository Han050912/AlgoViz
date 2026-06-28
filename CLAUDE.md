# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AlgoViz** is an enterprise-grade web platform for algorithm code visualization and analysis. Users upload or write multi-language algorithm code (Python/JavaScript/Java/C++/Go/Rust), and the platform generates execution trajectory visualizations and line-by-line analysis reports via user-configured AI models (OpenAI/DeepSeek/Ollama-compatible APIs). The backend uses a hybrid execution approach: Docker sandbox for real execution (Python/JS) with AI simulation fallback.

**Tech stack**: React 19 + TypeScript + Ant Design 5 + Vite 6 (frontend), FastAPI 0.115 + SQLAlchemy 2.0 async + MySQL 8.0 (backend), Docker + Celery + Redis for async tasks and sandboxing.

## Repository Status

This repository contains **project specification documents and development prompts** — no source code has been implemented yet. The authoritative specs are:

- **`AlgoViz_全栈开发提示词.md`** — Complete full-stack spec (front+back combined). Use this as the primary reference for any feature implementation.
- **`AlgoViz_AI开发提示词.md`** — Backend-only spec (detailed API routes, DB models, services, SSE streaming, Celery tasks).
- **`登录界面提示词/AlgoViz_认证页面_前端开发规范.md`** — Frontend auth page design system, layout specs, and component hierarchy for login/register/forgot-password pages.
- **`登录界面提示词/AlgoViz_登录页前端提示词.md`** — Detailed login page implementation spec.
- **`登录界面提示词/AlgoViz_创建账户_前端提示词.md`** — Registration page spec.
- **`登录界面提示词/AlgoViz_忘记密码_前端提示词.md`** — Forgot password page spec.

When implementing features, always cross-reference the full-stack prompt (`AlgoViz_全栈开发提示词.md`) for consistency across layers.

## Architecture (when code is implemented)

### Backend (`backend/`)
```
backend/app/
├── main.py              # FastAPI app: CORS, routers, startup events
├── core/
│   ├── config.py        # Pydantic Settings
│   ├── database.py      # SQLAlchemy async engine + session (MySQL + aiomysql)
│   └── security.py      # JWT + bcrypt + AES-256-GCM (API key encryption)
├── models/              # 6 SQLAlchemy models (User, ApiConfig, Project, Analysis, AnalysisReport, ExecutionTrace)
├── schemas/             # Pydantic request/response schemas
├── api/
│   ├── deps.py          # get_db, get_current_user DI
│   └── v1/
│       ├── auth.py      # register/login/refresh/me
│       ├── configs.py   # AI config CRUD + test + default
│       ├── projects.py  # project CRUD + favorite
│       ├── analyses.py  # analysis creation + SSE streaming
│       └── history.py   # history list + filters
├── services/
│   ├── config_service.py
│   ├── project_service.py
│   ├── sandbox/         # docker_manager.py, executor.py, python_tracer.py, js_tracer.py
│   ├── ai_service.py    # OpenAI SDK wrapper + prompt templates
│   └── analysis_service.py
└── tasks/               # Celery: celery_app.py, sandbox_task.py, analysis_task.py
```

### Frontend (`frontend/`)
```
frontend/src/
├── components/
│   ├── CodeEditor/      # Monaco Editor wrapper
│   ├── TraceViewer/     # Canvas 2D trajectory renderer
│   ├── AnalysisPanel/   # react-markdown report renderer
│   ├── ApiConfig/       # AI config CRUD forms
│   ├── Layout/          # MainLayout, Header, Sidebar
│   └── auth/            # AuthLayout, LeftPanel, AlgoVizLogo, DarkModeToggle
├── pages/
│   ├── Login/ / Register/ / ForgotPassword/
│   ├── Workspace/       # 3-column layout: editor + trace viewer + analysis
│   ├── History/
│   └── Settings/
├── stores/              # Zustand: workspaceStore, authStore
├── hooks/               # useSSE, useTracePlayer
├── services/            # api.ts (Axios instance + interceptors), authService.ts
└── types/               # TypeScript type definitions
```

### Database (6 tables, all CHAR(36) UUID PKs, DATETIME(6) timestamps, utf8mb4 InnoDB)
- **users**: email (unique), hashed_password, nickname, is_active
- **api_configs**: user_id FK, label, base_url, encrypted_api_key (VARBINARY), model_name, is_default
- **projects**: user_id FK, language, source_code (MEDIUMTEXT), source_hash (SHA-256), is_favorite
- **analyses**: project_id FK, user_id FK, api_config_id FK, status ENUM(pending/running/completed/failed)
- **analysis_reports**: analysis_id UNIQUE FK, algorithm_type, time/space_complexity, markdown_content (MEDIUMTEXT), metadata_json
- **execution_traces**: analysis_id UNIQUE FK, execution_mode, trace_data (JSON), environment_info (JSON)

### Key Protocols & Patterns
- **Unified response**: `{ "code": 0, "message": "success", "data": {...} }` — code=0 success, non-zero error
- **Auth**: JWT access token (30min) + refresh token (7d), Bearer header, Axios interceptor auto-retry on 401
- **SSE streaming** (`POST /analyses/stream`): event sequence — `status(sandbox_executing)` → `trace(steps)` → `status(ai_analyzing)` → `analysis(chunks)` → `complete`
- **Trace JSON protocol**: `{ version, language, execution_mode, steps: [{step, line, action, function, call_stack, locals, globals, output}] }`
- **Hybrid execution**: Docker sandbox preferred for python/javascript → fallback to AI simulation
- **Security**: bcrypt(12) passwords, AES-256-GCM API key encryption, sandbox isolation (network_disabled, read_only, timeout, no-new-privileges)

## Implementation Order (from spec)

Follow the phased implementation order documented in `AlgoViz_全栈开发提示词.md` Section 15:

1. **Phase 1 Skeleton**: Vite scaffold, backend dir + requirements, docker-compose, init.sql, Alembic, FastAPI main.py
2. **Phase 2 Auth**: security.py, User model, auth schemas, deps.py, auth routes
3. **Phase 3 Frontend Auth**: Axios instance + interceptors, LoginPage
4. **Phase 4 AI Config**: ApiConfig model, config_service, configs routes, frontend config panel
5. **Phase 5 Projects**: Project model, project_service, projects routes, MonacoEditor
6. **Phase 6 Sandbox**: DockerManager, executor hybrid engine, ai_service, SSE routes
7. **Phase 7 Visualization**: Canvas TraceViewer, playback controls, call stack + variable table
8. **Phase 8 Wrap-up**: History routes, global exception handling, docker compose up, full integration test

## Brand Guidelines
- Primary color: `#D49A20` (warm gold buttons)
- Background: deep blue tech theme
- Panels: white minimal
- Font: Inter / Microsoft YaHei
- No flashy animations — professional, restrained, technical aesthetic
