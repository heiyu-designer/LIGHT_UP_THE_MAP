@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ======================================
echo     我的旅行足迹 - 启动脚本
echo ======================================
echo.

REM 检查端口是否被占用
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ⚠️  端口 8000 已被占用
    echo.
    set /p choice="是否要停止旧进程并重新启动？(Y/N): "
    if /i "%choice%"=="Y" (
        echo 正在停止旧进程...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 1 >nul
    ) else (
        echo 启动取消
        pause
        exit /b
    )
)

REM 检查 Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
) else (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=python3
    ) else (
        echo ❌ 错误: 未找到 Python
        echo 请先安装 Python 3
        pause
        exit /b 1
    )
)

echo ✅ 使用 Python: %PYTHON_CMD%
echo.
echo 🚀 正在启动服务器...
echo 📍 访问地址: http://localhost:8000
echo.
echo 💡 提示:
echo    - 浏览器会自动打开
echo    - 按 Ctrl+C 可停止服务器
echo    - 或直接关闭此窗口
echo.
echo ======================================
echo.

REM 等待2秒后自动打开浏览器
start "" timeout /t 2 /nobreak ^>nul ^& start http://localhost:8000

REM 启动服务器
%PYTHON_CMD% -m http.server 8000

pause
