# 项目文件说明

## 启动脚本

### start.command (macOS 推荐)
- **用途**：macOS 系统双击启动脚本
- **使用方法**：
  1. 双击文件
  2. 首次使用需要右键 → 打开 → 确认
  3. 自动启动服务器并打开浏览器

### start.sh (通用 Shell)
- **用途**：macOS/Linux 通用启动脚本
- **使用方法**：`./start.sh`

### start.bat (Windows)
- **用途**：Windows 系统启动脚本
- **使用方法**：双击文件

## 核心文件

### index.html
- 主页面结构
- 包含地图容器、统计信息、省份列表

### app.js
- 应用核心逻辑
- 地图渲染、状态管理、交互处理

### data.js
- 省份数据定义
- 包含 34 个省级行政区信息

### style.css
- 页面样式定义
- 响应式布局、主题配色

## 文档文件

### README.md
- 项目介绍和使用说明
- 快速开始指南

### MVP.md
- 项目需求文档
- 功能验收标准

### CHANGELOG.md
- 版本更新记录
- 功能变更历史

### 启动说明.md
- 详细的启动指南
- 常见问题解答

### TESTING.md
- 功能测试清单
- 测试用例说明

### PROJECT_FILES.md
- 本文件
- 项目文件说明

## 资源文件

### china-map.svg
- 原始 SVG 地图文件（已弃用）
- 现使用 ECharts 动态加载地图数据

## 项目结构

```
light_up_the_map/
├── start.command       # macOS 启动脚本
├── start.sh            # Linux/macOS 启动脚本
├── start.bat           # Windows 启动脚本
├── index.html          # 主页面
├── app.js              # 应用逻辑
├── data.js             # 省份数据
├── style.css           # 样式文件
├── china-map.svg       # 地图文件（已弃用）
├── README.md           # 项目说明
├── MVP.md              # 需求文档
├── CHANGELOG.md        # 更新日志
├── TESTING.md          # 测试清单
├── 启动说明.md         # 启动指南
└── PROJECT_FILES.md    # 文件说明（本文件）
```

## 技术栈

- **前端框架**：原生 HTML/CSS/JavaScript
- **地图库**：ECharts 5.4.3
- **地图数据**：阿里云 DataV / ECharts China Map
- **服务器**：Python HTTP Server

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 许可证

MIT License
