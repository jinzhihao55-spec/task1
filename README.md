# 多功能智能助手平台

> 一个网页入口 + 多个AI小工具，基于 Flask + AI API 构建。

## 功能模块

| 功能 | API端点 | 说明 |
|------|---------|------|
| 简历优化 | POST /api/resume/optimize | 输入简历文本，返回优化建议 |
| 文案生成 | POST /api/copywriting/generate | 输入场景，生成多种风格文案 |
| 翻译助手 | POST /api/translate/translate | 中英互译 + 润色 |
| PDF摘要 | POST /api/pdf/upload | 上传PDF，生成摘要 |
| CSV预览 | POST /api/csv/upload | 上传CSV，生成数据分析报告 |

## 快速开始

```bash
# 1. 创建虚拟环境
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动服务
python app.py

# 4. 访问
# http://localhost:5000
```

## 项目结构

```
ai-assistant-platform/
├── app.py                  # Flask 主入口
├── requirements.txt        # 依赖清单
├── .env.example            # 环境变量模板
├── routes/                 # API 路由
│   ├── resume.py           # 简历优化
│   ├── copywriting.py      # 文案生成
│   ├── translate.py        # 翻译助手
│   ├── pdf_summary.py      # PDF摘要
│   └── csv_preview.py      # CSV预览
├── services/               # 服务层
│   ├── ai_service.py       # AI调用统一服务
│   └── mock_data.py        # 模拟返回数据
├── templates/              # 前端HTML模板
└── static/                 # 静态资源
    ├── css/
    ├── js/
    └── uploads/            # 上传文件临时目录
```

## API文档

### 简历优化
```
POST /api/resume/optimize
Content-Type: application/json

请求：{ "text": "你的简历内容..." }
响应：{ "success": true, "result": "## 优化建议..." }
```

### 文案生成
```
POST /api/copywriting/generate
Content-Type: application/json

请求：{ "scene": "产品描述", "style": "简洁", "count": 3 }
响应：{ "success": true, "result": "## 文案方案..." }
```

### 翻译助手
```
POST /api/translate/translate
Content-Type: application/json

请求：{ "text": "待翻译文本", "target_lang": "en" }
响应：{ "success": true, "result": "## 翻译结果..." }
```

### PDF摘要
```
POST /api/pdf/upload
Content-Type: multipart/form-data

请求：file=<PDF文件>
响应：{ "success": true, "result": "## 摘要...", "text_length": 5000 }
```

### CSV预览
```
POST /api/csv/upload
Content-Type: multipart/form-data

请求：file=<CSV文件>
响应：{ "success": true, "preview": {...}, "analysis": "## 分析报告..." }
```
