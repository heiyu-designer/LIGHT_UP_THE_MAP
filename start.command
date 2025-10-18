#!/bin/bash

# 获取脚本所在目录
cd "$(dirname "$0")"

echo "======================================"
echo "    我的旅行足迹 - 启动脚本"
echo "======================================"
echo ""

# 检查是否已有进程在运行
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  端口 8000 已被占用"
    echo ""
    read -p "是否要停止旧进程并重新启动？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "正在停止旧进程..."
        kill -9 $(lsof -ti:8000) 2>/dev/null
        sleep 1
    else
        echo "启动取消"
        exit 0
    fi
fi

# 检查 Python 3
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 错误: 未找到 Python"
    echo "请先安装 Python 3"
    read -p "按任意键退出..."
    exit 1
fi

echo "✅ 使用 Python: $PYTHON_CMD"
echo ""
echo "🚀 正在启动服务器..."
echo "📍 访问地址: http://localhost:8000"
echo ""
echo "💡 提示:"
echo "   - 浏览器会自动打开"
echo "   - 按 Ctrl+C 可停止服务器"
echo "   - 或直接关闭此窗口"
echo ""
echo "======================================"
echo ""

# 等待2秒后自动打开浏览器
(sleep 2 && open http://localhost:8000) &

# 启动服务器
$PYTHON_CMD -m http.server 8000

# 如果服务器停止，等待用户确认
echo ""
echo "服务器已停止"
read -p "按任意键退出..."
