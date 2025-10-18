#!/bin/bash

# 获取脚本所在目录
cd "$(dirname "$0")"

echo "======================================"
echo "    我的旅行足迹 - 启动脚本"
echo "======================================"
echo ""

# 检查是否已有进程在运行
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  端口 8000 已被占用，正在停止旧进程..."
    kill -9 $(lsof -ti:8000) 2>/dev/null
    sleep 1
fi

# 检查 Python 3
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 错误: 未找到 Python"
    echo "请先安装 Python 3"
    exit 1
fi

echo "✅ 使用 Python: $PYTHON_CMD"
echo ""
echo "🚀 正在启动服务器..."
echo "📍 访问地址: http://localhost:8000"
echo ""
echo "💡 提示: 按 Ctrl+C 可停止服务器"
echo ""
echo "======================================"
echo ""

# 启动服务器
$PYTHON_CMD -m http.server 8000
