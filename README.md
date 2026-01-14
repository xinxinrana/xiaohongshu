# 小红书文案图文生成工具

## 项目结构

```
/app/work/
├── frontend/               # 前端 Vue 3 项目
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   │   ├── KeywordInput.vue      # 关键词输入组件
│   │   │   ├── FrameworkSelector.vue # 框架选择组件
│   │   │   ├── ContentEditor.vue     # 内容编辑组件
│   │   │   ├── QualityAnalysis.vue   # 质量分析组件
│   │   │   └── Preview.vue           # 预览组件
│   │   ├── views/         # 页面视图
│   │   │   ├── Home.vue             # 首页
│   │   │   ├── Generate.vue         # 生成页
│   │   │   └── Preview.vue          # 预览页
│   │   ├── services/      # API 服务
│   │   │   └── api.js               # API 接口封装
│   │   ├── utils/         # 工具函数
│   │   │   └── formatter.js        # 格式化工具
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # 后端 Node.js 项目
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   │   ├── frameworkController.js      # 框架控制器
│   │   │   ├── analysisController.js      # 分析控制器
│   │   │   ├── generationController.js    # 生成控制器
│   │   │   └── previewController.js       # 预览控制器
│   │   ├── services/     # 业务逻辑
│   │   │   ├── frameworkService.js        # 框架服务
│   │   │   ├── keywordService.js          # 关键词服务
│   │   │   ├── generationService.js       # 生成服务
│   │   │   └── analysisService.js         # 分析服务
│   │   ├── routes/       # 路由
│   │   │   └── index.js                # 路由配置
│   │   ├── utils/        # 工具函数
│   │   │   └── fileReader.js           # 文件读取工具
│   │   └── app.js         # App 入口
│   ├── package.json
│   └── .env              # 环境变量
│
├── frameworks/           # 框架知识库
│   ├── AIDA模型框架.md
│   ├── SCQA模型框架.md
│   ├── 黄金圈法则框架.md
│   ├── 小红书爆款框架.md
│   ├── 情感共鸣框架.md
│   ├── 干货分享框架.md
│   ├── 种草推荐框架.md
│   └── 生活方式分享框架.md
│
├── package.json
└── README.md
```

## 技术栈

- **前端**: Vue 3, Vite, Element Plus
- **后端**: Node.js, Express, CORS
- **AI 生成**: 模拟 AI 生成逻辑（可替换为真实 API）

## 安装和启动

### 前端
```bash
cd frontend
pnpm install
pnpm run dev
```

### 后端
```bash
cd backend
pnpm install
node src/app.js
```

## API 端点

- `GET /api/frameworks` - 获取所有框架
- `POST /api/analyze` - 分析关键词
- `POST /api/generate` - 生成内容
- `POST /api/generate/analysis` - 生成质量分析
