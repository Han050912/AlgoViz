-- AlgoViz Database Initialization Script
-- Database: algoviz_db (created manually)

USE algoviz_db;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. API Configs
CREATE TABLE IF NOT EXISTS api_configs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    label VARCHAR(100) NOT NULL,
    base_url VARCHAR(512) NOT NULL,
    encrypted_api_key VARBINARY(512) NOT NULL,
    encryption_iv VARBINARY(32) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    is_default TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_api_configs_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Projects
CREATE TABLE IF NOT EXISTS projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    language VARCHAR(20) NOT NULL,
    source_code MEDIUMTEXT NOT NULL,
    source_hash VARCHAR(64) NOT NULL,
    is_favorite TINYINT(1) DEFAULT 0,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_user (user_id),
    INDEX idx_projects_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Analyses
CREATE TABLE IF NOT EXISTS analyses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    api_config_id CHAR(36) DEFAULT NULL,
    status ENUM('pending','running','completed','failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    started_at DATETIME(6) DEFAULT NULL,
    completed_at DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (api_config_id) REFERENCES api_configs(id) ON DELETE SET NULL,
    INDEX idx_analyses_user (user_id),
    INDEX idx_analyses_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Analysis Reports (1:1 with analyses)
CREATE TABLE IF NOT EXISTS analysis_reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    analysis_id CHAR(36) NOT NULL UNIQUE,
    algorithm_type VARCHAR(100) DEFAULT NULL,
    time_complexity VARCHAR(50) DEFAULT NULL,
    space_complexity VARCHAR(50) DEFAULT NULL,
    markdown_content MEDIUMTEXT DEFAULT NULL,
    metadata_json JSON DEFAULT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Execution Traces (1:1 with analyses)
CREATE TABLE IF NOT EXISTS execution_traces (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    analysis_id CHAR(36) NOT NULL UNIQUE,
    execution_mode VARCHAR(20) DEFAULT NULL,
    trace_data JSON DEFAULT NULL,
    environment_info JSON DEFAULT NULL,
    FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
