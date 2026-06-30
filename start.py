import argparse
import logging
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
# 启动提示横幅
# ---------------------------------------------------------------------------

def print_banner(port: int):
    """打印启动提示横幅。"""
    sep = "=" * 60
    print()
    print(sep)
    print("  AlgoViz 后端服务已启动")
    print(sep)
    print()
    print(f"  [服务地址]  http://localhost:{port}")
    print(f"  [API 文档]  http://localhost:{port}/docs")
    print(f"  [备用文档]  http://localhost:{port}/redoc")
    print(f"  [健康检查]  http://localhost:{port}/api/health")
    print()
    print("  按 Ctrl+C 可优雅停止后端服务")
    print(sep)
    print()


# ---------------------------------------------------------------------------
# 端口检测与释放
# ---------------------------------------------------------------------------

def find_pids_by_port(port: int) -> list[int]:
    """查找占用指定端口的所有进程 PID (Windows netstat)。"""
    pids = []
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True,
            encoding="gbk",
            errors="replace",
            timeout=10,
        )
        for line in result.stdout.splitlines():
            # 匹配包含 :PORT LISTENING 的行
            if f":{port}" not in line:
                continue
            if "LISTENING" not in line:
                continue
            # 最后一列是 PID
            parts = line.split()
            if parts and parts[-1].isdigit():
                pid = int(parts[-1])
                if pid not in pids:
                    pids.append(pid)
    except Exception as e:
        logger.warning("netstat 查询失败: %s", e)
    return pids


def kill_pid(pid: int):
    """强制终止进程。"""
    try:
        result = subprocess.run(
            ["taskkill", "/PID", str(pid), "/F"],
            capture_output=True,
            text=True,
            encoding="gbk",
            errors="replace",
            timeout=10,
        )
        # 检查是否成功或进程已不存在
        if "没有找到进程" in result.stderr or result.returncode == 0:
            if "没有找到进程" in result.stderr:
                logger.info("进程 PID=%d 已不存在（僵尸进程）", pid)
            else:
                logger.info("已终止占用端口的进程 PID=%d", pid)
        else:
            logger.error("终止进程 PID=%d 失败: %s", pid, result.stderr.strip())
    except subprocess.TimeoutExpired:
        logger.error("终止进程 PID=%d 超时", pid)
    except Exception as e:
        logger.error("终止进程 PID=%d 失败: %s", pid, e)


def ensure_port_free(port: int):
    """确保端口未被占用，如被占用则自动释放。"""
    import socket

    def is_port_in_use():
        """用 socket 检测端口是否被占用。"""
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            s.bind(('0.0.0.0', port))
            s.close()
            return False
        except OSError:
            try:
                s.close()
            except Exception:
                pass
            return True

    if not is_port_in_use():
        logger.info("端口 %d 可用", port)
        return

    logger.warning("端口 %d 被占用，正在释放...", port)

    # 尝试通过 PID 释放
    pids = find_pids_by_port(port)
    if pids:
        for pid in pids:
            kill_pid(pid)

    # 等待端口释放
    for _ in range(20):
        time.sleep(0.5)
        if not is_port_in_use():
            logger.info("端口 %d 已释放", port)
            return

    logger.error("端口 %d 释放超时，请手动处理", port)
    sys.exit(1)


# ---------------------------------------------------------------------------
# 日志过滤与转发
# ---------------------------------------------------------------------------

LOG_LEVEL_COLORS = {
    "INFO": "[INFO]",
    "WARNING": "[WARN]",
    "WARN": "[WARN]",
    "ERROR": "[ERROR]",
    "CRITICAL": "[FATAL]",
    "DEBUG": "[DEBUG]",
}


def colorize_line(line: str) -> str:
    """为日志行添加级别标签。"""
    match = LOG_LEVEL_RE.search(line)
    if match:
        level_text = match.group(1).strip()
        tag = LOG_LEVEL_COLORS.get(level_text, "")
        if tag:
            return f"{tag} {line}"
    return line


def safe_print(text: str):
    """安全打印，忽略无法编码的字符。"""
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        # 用 GBK 编码，无法编码的字符替换为 '?'
        cleaned = text.encode('gbk', errors='replace').decode('gbk')
        print(cleaned, flush=True)


# ANSI 转义序列清除正则
ANSI_ESCAPE_RE = re.compile(r'\x1b\[[0-9;]*m')


def stream_reader(reader, callback):
    """在后台线程中读取子进程输出并回调处理每一行。"""
    for raw_line in reader:
        line = raw_line.rstrip("\r\n")
        if line:
            # 清除 ANSI 颜色码，避免 GBK 编码下 print 报错
            clean_line = ANSI_ESCAPE_RE.sub('', line)
            callback(clean_line)


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

    # 确保端口空闲
    ensure_port_free(port)

    # 构建启动命令
    cmd = [
        str(VENV_PYTHON),
        "-m", "uvicorn", MODULE_PATH,
        "--host", "0.0.0.0",
        "--port", str(port),
        "--reload",
        "--reload-dir", ".",
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

    # 日志回调
    def log_callback(line: str):
        colored = colorize_line(line)
        safe_print(colored)

    # 启动读取线程
    reader_thread = threading.Thread(
        target=stream_reader,
        args=(proc.stdout, log_callback),
        daemon=True,
    )
    reader_thread.start()

    # 等待后端启动完成（轮询进程是否存活 + 超时保护）
    startup_timeout = 15
    start_time = time.time()
    while time.time() - start_time < startup_timeout:
        poll_val = proc.poll()
        if poll_val is not None:
            logger.error("进程意外退出，poll=%s, returncode=%s", poll_val, proc.returncode)
            break
        time.sleep(0.5)

    # 进程仍在运行，打印启动横幅
    if proc.poll() is None:
        print_banner(port)
        sys.stdout.flush()
    else:
        logger.error("后端服务启动失败，进程已退出")
        sys.exit(1)

    # 注册信号处理器 — Ctrl+C 优雅退出
    def signal_handler(sig, frame):  # noqa: ARG001
        logger.info("\n收到终止信号，正在关闭后端服务...")
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            logger.warning("进程未响应 terminate，强制杀死...")
            proc.kill()
        proc.wait()
        logger.info("后端服务已停止")
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