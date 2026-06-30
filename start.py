"""
AlgoViz Backend Launcher — 一键启动脚本

功能：
  - 自动检测后端监听端口是否被占用，占用则强制释放
  - 启动 uvicorn 服务，实时捕获控制台日志并按级别分级输出
  - 监听进程状态，崩溃时记录完整堆栈
  - 支持 Ctrl+C 优雅终止

用法：
  python start.py              # 使用默认端口 8000
  python start.py --port 9000  # 指定端口
"""

import argparse
import logging
import os
import re
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# 配置
# ---------------------------------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent / "backend"
VENV_PYTHON = BACKEND_DIR / ".venv" / "Scripts" / "python.exe"
DEFAULT_PORT = 8000
MODULE_PATH = "app.main:app"
UVICORN_ARGS = ["--host", "0.0.0.0", "--port", str(DEFAULT_PORT), "--reload"]

# 日志级别正则映射
LOG_LEVEL_RE = re.compile(
    r"^(\s*(?:INFO|WARNING|WARN|ERROR|CRITICAL|DEBUG)\s*:)"
)

logger = logging.getLogger("launcher")


# ---------------------------------------------------------------------------
# 端口检测与释放
# ---------------------------------------------------------------------------

def find_pid_by_port(port: int) -> int | None:
    """查找占用指定端口的进程 PID (Windows netstat)。"""
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True,
            text=True,
            encoding="gbk",
            timeout=10,
        )
        for line in result.stdout.splitlines():
            # 匹配 0.0.0.0:PORT 或 [::]:PORT
            pattern = rf":{port}\s+(LISTENING|ESTABLISHED)"
            if re.search(pattern, line):
                parts = line.strip().split()
                if parts:
                    pid = parts[-1]
                    if pid.isdigit():
                        return int(pid)
    except Exception as e:
        logger.warning("netstat 查询失败: %s", e)
    return None


def kill_pid(pid: int):
    """强制终止进程。"""
    try:
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/F"],
            capture_output=True,
            text=True,
            encoding="gbk",
            timeout=10,
        )
        logger.info("已终止占用端口的进程 PID=%d", pid)
    except Exception as e:
        logger.error("终止进程 PID=%d 失败: %s", pid, e)


def ensure_port_free(port: int):
    """确保端口未被占用，如被占用则自动释放。"""
    pid = find_pid_by_port(port)
    if pid is not None:
        logger.warning("端口 %d 被占用 (PID=%d)，正在释放...", port, pid)
        kill_pid(pid)
        # 等待端口释放
        for _ in range(10):
            time.sleep(0.5)
            if find_pid_by_port(port) is None:
                logger.info("端口 %d 已释放", port)
                return
        logger.error("端口 %d 释放超时，请手动处理", port)
        sys.exit(1)
    else:
        logger.info("端口 %d 可用", port)


# ---------------------------------------------------------------------------
# 日志过滤与转发
# ---------------------------------------------------------------------------

LOG_LEVEL_COLORS = {
    "INFO": "\033[32m",      # 绿色
    "WARNING": "\033[33m",   # 黄色
    "WARN": "\033[33m",
    "ERROR": "\033[31m",     # 红色
    "CRITICAL": "\033[1;31m",# 粗红
    "DEBUG": "\033[36m",     # 青色
}
RESET = "\033[0m"


def colorize_line(line: str) -> str:
    """为日志行添加颜色标记。"""
    match = LOG_LEVEL_RE.search(line)
    if match:
        level_text = match.group(1).strip()
        color = LOG_LEVEL_COLORS.get(level_text, "")
        return f"{color}{line}{RESET}"
    return line


def stream_reader(reader, callback):
    """在后台线程中读取子进程输出并回调处理每一行。"""
    for raw_line in reader:
        line = raw_line.rstrip("\r\n")
        if line:
            callback(line)


# ---------------------------------------------------------------------------
# 主启动逻辑
# ---------------------------------------------------------------------------

def start_backend(port: int):
    """启动后端服务并监控日志。"""

    # 检查 Python 解释器
    if not VENV_PYTHON.exists():
        logger.error("虚拟环境不存在: %s", VENV_PYTHON)
        logger.error("请先创建虚拟环境并安装依赖: cd backend && python -m venv .venv && pip install -r requirements.txt")
        sys.exit(1)

    if not BACKEND_DIR.exists():
        logger.error("后端目录不存在: %s", BACKEND_DIR)
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("  AlgoViz Backend Launcher")
    logger.info("=" * 60)
    logger.info("Python : %s", VENV_PYTHON)
    logger.info("Port   : %d", port)
    logger.info("Module : %s", MODULE_PATH)
    logger.info("-" * 60)

    # 确保端口空闲
    ensure_port_free(port)

    # 构建启动命令
    cmd = [
        str(VENV_PYTHON),
        "-m", "uvicorn", MODULE_PATH,
        "--host", "0.0.0.0",
        "--port", str(port),
        "--reload",
    ]

    logger.info("启动命令: %s", " ".join(cmd))
    logger.info("-" * 60)
    logger.info("日志输出开始:")
    logger.info("-" * 60)

    # 启动子进程
    proc = subprocess.Popen(
        cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        universal_newlines=True,
        encoding="utf-8",
        errors="replace",
    )

    stop_event = threading.Event()

    def log_callback(line: str):
        colored = colorize_line(line)
        print(colored, flush=True)
        # 如果检测到启动完成标志，停止监控线程
        if "Application startup complete" in line:
            stop_event.set()

    # 启动读取线程
    reader_thread = threading.Thread(
        target=stream_reader,
        args=(proc.stdout, log_callback),
        daemon=True,
    )
    reader_thread.start()

    # 注册信号处理器 — Ctrl+C 优雅退出
    def signal_handler(sig, frame):
        logger.info("\n收到终止信号，正在关闭后端服务...")
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            logger.warning("进程未响应 terminate，强制杀死...")
            proc.kill()
        proc.wait()
        logger.info("后端服务已停止")
        stop_event.set()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # 等待进程结束
    try:
        proc.wait()
    except KeyboardInterrupt:
        signal_handler(None, None)

    # 检查退出码
    if proc.returncode != 0:
        logger.error("后端服务异常退出，退出码: %d", proc.returncode)
        logger.error("请检查上述日志中的 ERROR / CRITICAL 级别信息")
    else:
        logger.info("后端服务已正常退出")


# ---------------------------------------------------------------------------
# CLI 入口
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="AlgoViz Backend Launcher — 一键启动后端服务",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python start.py                  # 默认端口 8000
  python start.py --port 9000      # 指定端口
  python start.py --help           # 显示帮助
        """,
    )
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"后端服务监听端口 (默认: {DEFAULT_PORT})",
    )
    args = parser.parse_args()

    if args.port < 1 or args.port > 65535:
        logger.error("端口号必须在 1-65535 范围内")
        sys.exit(1)

    start_backend(args.port)


if __name__ == "__main__":
    main()
