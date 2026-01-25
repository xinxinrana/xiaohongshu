# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nixtio AI** is a Xiaohongshu (小红书) content creation platform that helps users generate high-quality, viral-worthy social media content with AI assistance. It combines modern Vue 3 frontend with a robust Node.js backend and advanced AI capabilities.

## Development Commands

### Quick Start
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Start both frontend and backend concurrently
npm run dev:all

# Start only frontend
npm run frontend

# Start only backend
npm run backend
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Start development server
npm run dev

# Start production server
npm start
```

### Testing & Debugging
```bash
# Backend testing scripts (from backend directory)
node test-all.js          # 综合测试（集成 OCR、图像生成、Agent）
node test-multimodal.js   # 多模态分析测试
node test-image-api.js    # 图像生成 API 测试
```

## Architecture Overview

### Frontend Architecture (Vue 3 + Vite)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite with hot module replacement
- **UI Libraries**: Naive UI + Element Plus
- **HTTP Client**: Axios with proxy configuration
- **Routing**: Vue Router
- **Port**: 8001 (proxies API requests to backend)

### Backend Architecture (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **AI Integration**: LangChain ecosystem
- **Port**: 8099 (proxied by frontend)
- **CORS**: Configured for development

### Key Components

#### 1. Content Generation System
- **Framework-based Generation**: AIDA, SCQA, 黄金圈法则
- **AI-Powered Writing**: LangChain integration
- **Quality Analysis**: AI-powered content assessment
- **Controllers**: `generationController.js`, `enhancedGenerationController.js`

#### 2. Image Generation Service
- **Multi-modal Support**: Text-to-image and image-to-image
- **Batch Generation**: Multiple images simultaneously
- **Fusion Technology**: Combine reference images
- **Controller**: `imageController.js`

#### 3. LangChain Agent System
- **Intelligent Agents**: Complex task execution
- **Memory Management**: Persistent context retention
- **Tool Integration**: Web search, note crawling, e-commerce monitoring
- **Streaming**: Real-time SSE responses
- **Controller**: `agentController.js`

#### 4. Analysis & Framework System
- **Framework Selection**: Intelligent framework recommendation
- **Content Analysis**: Quality assessment and optimization
- **Controllers**: `frameworkController.js`, `analysisController.js`

### Project Structure

```
F:/Windows/project/xiaohongshu/
├── backend/                    # Node.js backend service
│   ├── src/
│   │   ├── agents/            # LangChain agent implementations
│   │   ├── controllers/       # API route controllers
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic services
│   │   └── app.js             # Express app entry point
│   └── package.json           # Backend dependencies
├── src/                        # Vue 3 frontend source
│   ├── components/            # Reusable Vue components
│   ├── views/                 # Page-level components
│   ├── services/              # API service layer
│   ├── router/                # Vue Router configuration
│   └── App.vue                # Root component
├── public/                     # Static assets
├── package.json               # Root project configuration
├── vite.config.js             # Vite configuration with proxy
└── README.md                  # Project documentation
```

### Key Frontend Views

1. **Landing.vue**: Entry point with "开始创作" button
2. **Generate.vue**: Main content generation workspace
3. **BatchGenerate.vue**: Batch content generation
4. **ImageWorkbench.vue**: Advanced image editing tools
5. **AccountAnalysis.vue**: Account analytics
6. **KnowledgeBase.vue**: Knowledge management
7. **Settings.vue**: User settings
8. **Help.vue**: Documentation and help

### Key Backend Controllers

1. **generationController.js**: Basic content generation
2. **enhancedGenerationController.js**: 5-stage enhanced workflow
3. **imageController.js**: Image generation and manipulation
4. **agentController.js**: LangChain agent management
5. **frameworkController.js**: Content framework handling
6. **analysisController.js**: Content quality analysis

## Environment Configuration

### Backend Environment Variables (`.env`)
- `PORT`: Server port (default: 8080)
- `CORS_ORIGIN`: CORS origin (default: http://localhost:3000)
- `OPENAI_API_KEY`: OpenAI API key for LangChain
- Various API keys for external services

### Frontend Configuration
- Proxy configured in `vite.config.js` to forward `/api` requests
- Development server runs on port 8001
- CORS enabled for development

## Development Guidelines

### Frontend Development
- Use Vue 3 Composition API with `<script setup>`
- Leverage Naive UI and Element Plus components
- API calls go through Axios with automatic proxy
- Follow existing component structure in `src/components/`

### Backend Development
- Use ES modules (import/export syntax)
- Controllers handle route logic
- Services contain business logic
- Agents handle complex AI workflows
- Follow existing patterns in `backend/src/controllers/`

### AI Integration
- LangChain provides the core AI framework
- Agents use tools for external data access
- Memory system maintains conversation context
- Streaming responses use SSE for real-time updates

## Common Development Tasks

### Adding New API Endpoints
1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/index.js`
3. Add frontend service method in `src/services/api.js`

### Adding New Frontend Pages
1. Create view component in `src/views/`
2. Add route in `src/router/index.js`
3. Create any necessary components in `src/components/`

### Testing AI Features
- Use backend test scripts for debugging
- Test individual agents and tools
- Verify memory persistence
- Check streaming responses

This architecture supports both simple one-click generation and complex multi-step workflows, making it suitable for both casual users and professional content creators.