# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nixtio AI** is a Xiaohongshu (小红书) content creation platform that helps users generate high-quality, viral-worthy social media content with AI assistance. It combines modern Vue 3 frontend with a robust Node.js backend and advanced AI capabilities using LangChain.

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
# Start development server (port 8001)
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

# Start development server (port 8099)
npm run dev

# Start production server
npm start
```

### Testing & Debugging
```bash
# Backend testing scripts (from project root)
node test-all.js          # Comprehensive test (OCR, image generation, Agent)
node test-multimodal.js   # Multimodal analysis test
node test-image-api.js    # Image generation API test
```

## Architecture Overview

### Frontend Architecture (Vue 3 + Vite)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite with hot module replacement
- **UI Libraries**: Naive UI + Element Plus
- **HTTP Client**: Axios with proxy configuration to backend
- **Routing**: Vue Router
- **Port**: 8001 (proxies API requests to backend on port 8099)

### Backend Architecture (Node.js + Express)
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **AI Integration**: LangChain ecosystem
- **Port**: 8099 (proxied by frontend)
- **CORS**: Configured for development with 50MB request body limit

### Key Components

#### 1. Content Generation System
- **Framework-based Generation**: AIDA, SCQA, 黄金圈法则, and other Xiaohongshu frameworks
- **AI-Powered Writing**: LangChain LLM integration
- **Quality Analysis**: AI-powered content assessment with self-correction
- **Controllers**: `generationController.js`, `enhancedGenerationController.js`

#### 2. Image Generation Service
- **Multi-modal Support**: Text-to-image and image-to-image generation
- **Batch Generation**: Multiple images simultaneously
- **Fusion Technology**: Combine reference images
- **Controller**: `imageController.js`

#### 3. LangChain Agent System
- **Intelligent Agents**: Complex task execution with autonomous planning
- **Memory Management**: Persistent vector-based memory retention
- **Tool Integration**: Web search, vision analysis, content generation, image generation
- **Streaming**: Real-time SSE responses for long-running tasks
- **Controller**: `agentController.js`

#### 4. Analysis & Framework System
- **Framework Selection**: Intelligent framework recommendation based on keywords
- **Content Analysis**: Quality assessment and optimization with scoring
- **Controllers**: `frameworkController.js`, `analysisController.js`

#### 5. Memory System
- **Vector Store**: Pinecone-based vector storage for semantic search
- **Memory Retrieval**: Retrieve historical high-quality content for context
- **Self-improvement**: Save high-scoring content (≥7/10) to memory

## Project Structure

```
F:/Windows/project/xiaohongshu/
├── backend/                    # Node.js backend service
│   ├── src/
│   │   ├── agents/            # LangChain agent implementations
│   │   │   ├── base/          # Base classes (BaseAgent, BaseLLM, BaseTool)
│   │   │   ├── memory/        # Vector store implementation
│   │   │   ├── tools/         # Agent tools (content, image, quality, etc.)
│   │   │   └── xiaohongshuAgent.js # Main agent implementation
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
2. **AgentWorkbench.vue**: Main intelligent agent workspace with auto-planning
3. **Generate.vue**: Content generation workspace
4. **BatchGenerate.vue**: Batch content generation
5. **ImageWorkbench.vue**: Advanced image editing tools
6. **AccountAnalysis.vue**: Account analytics
7. **KnowledgeBase.vue**: Knowledge management with memory system
8. **Settings.vue**: User settings
9. **Help.vue**: Documentation and help

### Key Backend Controllers

1. **generationController.js**: Basic content generation endpoints
2. **enhancedGenerationController.js**: 5-stage enhanced workflow
3. **imageController.js**: Image generation and manipulation
4. **agentController.js**: LangChain agent management with streaming
5. **frameworkController.js**: Content framework handling
6. **analysisController.js**: Content quality analysis

### Key API Routes

```
GET  /api/frameworks              - Get all available frameworks
GET  /api/frameworks/:name        - Get specific framework
POST /api/analyze                 - Analyze keywords
POST /api/generate                - Generate content
POST /api/generate/analysis       - Generate content analysis
GET  /api/proxy-image             - Proxy external images

# Image Generation
POST /api/image/text-to-image     - Generate image from text
POST /api/image/edit              - Edit image
POST /api/image/image-to-image    - Generate image from image
GET  /api/image/task/:taskId      - Query image generation status
POST /api/image/multi-fusion      - Multi-image fusion
POST /api/image/batch-generation  - Batch image generation
POST /api/image/stream-generation - Stream-based image generation
GET  /api/image/config            - Get image generation config

# Enhanced Workflow
POST /api/enhanced/generate-content  - Enhanced content generation
POST /api/enhanced/generate-prompts  - Generate image prompts
POST /api/enhanced/generate-images   - Generate images
POST /api/enhanced/edit-content      - Edit generated content
POST /api/enhanced/optimize-prompts  - Optimize image prompts
POST /api/enhanced/edit-images       - Edit generated images
POST /api/enhanced/final-analysis    - Final content analysis
POST /api/enhanced/full-process      - Complete enhanced workflow

# Agent System
POST /api/agent/generate         - Generate with agent (non-streaming)
POST /api/agent/stream           - Generate with agent (streaming SSE)
GET  /api/agent/history          - Get agent execution history
DELETE /api/agent/history        - Clear agent history
GET  /api/agent/memory           - Get all memory entries
POST /api/agent/memory           - Create memory entry
GET  /api/agent/memory/stats     - Get memory statistics
POST /api/agent/memory/retrieve  - Retrieve memory by keywords
GET  /api/agent/memory/:id       - Get specific memory entry
PUT  /api/agent/memory/:id       - Update memory entry
DELETE /api/agent/memory/:id     - Delete memory entry
DELETE /api/agent/memory         - Clear all memory
```

## Environment Configuration

### Backend Environment Variables (`.env` in backend/)
- `PORT`: Server port (default: 8099)
- `CORS_ORIGIN`: CORS origin (default: http://localhost:8001)
- `OPENAI_API_KEY`: OpenAI API key for LangChain
- `GLM_API_KEY`: Zhipu AI API key (used as primary LLM)
- `SHENGSUAN_VISION_API_KEY`: Shengsuan vision API for image analysis
- `IMAGE_API_KEY`: Image generation service API key
- `PINECONE_API_KEY`: Pinecone vector database for memory
- `PINECONE_INDEX`: Pinecone index name

### Frontend Environment Variables (`.env` in project root)
- `VITE_AI_BASE_URL`: Backend API base URL (default: http://localhost:8099)
- `VITE_AI_API_KEY`: API key for backend authentication
- `VITE_ENABLE_STREAMING`: Enable SSE streaming (default: true)

### Frontend Configuration
- Proxy configured in `vite.config.js` to forward `/api` requests to backend:8099
- Development server runs on port 8001
- CORS enabled for development with specific allowed hosts

## Agent Architecture Details

### Core Agent Classes

#### BaseAgent (`backend/src/agents/base/BaseAgent.js`)
- Base class for all agents
- Provides logging, tool management, and response formatting
- Handles execution history tracking

#### BaseLLM (`backend/src/agents/base/BaseLLM.js`)
- LLM configuration management
- Multiple LLM instances for different purposes:
  - `glmLLM`: Primary LLM for content generation
  - `fast`: Fast LLM for simple tasks
  - `analysis`: Analysis LLM for quality assessment

#### BaseTool (`backend/src/agents/base/BaseTool.js`)
- Base class for all tools
- Standardized interface for tool execution

### Agent Tools

1. **ContentGenerationTool**: Generate Xiaohongshu-style content with emojis
2. **FrameworkMatchTool**: Match appropriate content framework to keywords
3. **ImagePromptGenerationTool**: Generate prompts for image generation
4. **QualityAssessmentTool**: Assess content quality with scoring (0-10)
5. **ImageGenerationTool**: Generate images (text-to-image & image-to-image)
6. **MultimodalAnalysisTool**: Analyze images for visual features
7. **MemoryRetrievalTool**: Retrieve historical content from vector store
8. **MemoryStorageTool**: Store high-quality content to vector store

### Agent Execution Flow

1. **Smart Planning**: LLM determines execution steps based on input
2. **Preprocessing**: Multimodal analysis, framework matching, memory retrieval
3. **Core Generation**: Content generation with context from memory
4. **Quality Assurance**: Assessment and self-correction if score < 7/10
5. **Memory Storage**: Save high-quality content for future reference
6. **Image Generation**: Generate matching images with prompts

### Memory System

The memory system uses Pinecone vector database for semantic search:

- **VectorStore.js**: Pinecone-based vector storage implementation
- **Embeddings**: Content is embedded using LLM embeddings
- **Retrieval**: Semantic search by keyword similarity
- **Storage**: Only content scoring ≥7/10 is stored
- **Context**: Retrieved memories provide context for new generations

## Development Guidelines

### Frontend Development
- Use Vue 3 Composition API with `<script setup>`
- Leverage Naive UI and Element Plus components
- API calls go through Axios with automatic proxy to `/api`
- Follow existing component structure in `src/components/`
- Use Pinia or Vue Router as needed

### Backend Development
- Use ES modules (import/export syntax)
- Controllers handle route logic and validation
- Services contain business logic and AI integration
- Agents handle complex multi-step workflows
- Tools encapsulate specific functionality
- Follow existing patterns in `backend/src/controllers/`

### AI Integration
- LangChain provides the core AI framework
- Agents use tools for external data access
- Memory system maintains conversation context
- Streaming responses use SSE for real-time updates
- Multiple LLM configurations for different tasks

### Adding New Features

#### Adding New API Endpoints
1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/index.js`
3. Add frontend service method in `src/services/`
4. Update API documentation

#### Adding New Frontend Pages
1. Create view component in `src/views/`
2. Add route in `src/router/index.js`
3. Create any necessary components in `src/components/`

#### Adding New Agent Tools
1. Create tool class in `backend/src/agents/tools/`
2. Extend BaseTool class
3. Register tool in agent constructor
4. Update agent execution logic if needed

### Testing AI Features
- Use backend test scripts for debugging
- Test individual agents and tools
- Verify memory persistence and retrieval
- Check streaming responses with SSE
- Monitor quality scores and self-correction
- Validate image generation results

### Troubleshooting

#### Common Issues
- **Port conflicts**: Ensure ports 8001 (frontend) and 8099 (backend) are available
- **CORS errors**: Check CORS configuration in backend `.env`
- **Memory errors**: Verify Pinecone API key and index configuration
- **Image generation failures**: Check image service API keys and quotas
- **Streaming issues**: Verify SSE endpoint and network connectivity

#### Debug Mode
- Set `NODE_ENV=development` for detailed logging
- Use test scripts to isolate specific components
- Check agent execution logs in console
- Monitor memory usage and vector store status

## Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production backend
cd backend
npm start
```

### Environment Setup
- Ensure all API keys are configured in production `.env` files
- Set appropriate CORS origins for production
- Configure Pinecone index for production use
- Monitor API quotas and usage

This architecture supports both simple one-click generation and complex multi-step workflows, making it suitable for both casual users and professional content creators.