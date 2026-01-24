# LangChain Agent 架构优化方案

## 📋 项目概述

本项目需要重构为一个完整的**LangChain AI Agent架构**,使用**胜算云API**调用**GLM-4.7**大模型作为核心LLM,用于决策、工具调用、文案生成、提示词生成等;同时调用**火山引擎的Doubao4.5**图像生成模型进行图像生成。

## 🔧 现有技术栈分析

### 1. 文本AI服务 (GLM-4.7)
- **服务商**: 胜算云 (Shengsuan Cloud)
- **API端点**: `https://router.shengsuanyun.com/api/v1/chat/completions`
- **模型**: `bigmodel/glm-4.7`
- **API Key**: `LCCjfox5GKqoYckBB-86zxXjPfsdrUxPUaYcxoQzeCyfsHJHIMND0CFV1J-04Jh7QGbltNm9aRBV2OXz3gubR2_OZR-FlJ7k3oAnrg`
- **实现位置**: `backend/src/services/aiService.js`

### 2. 图像生成服务 (Doubao4.5)
- **服务商**: 火山引擎 (字节跳动)
- **API端点**: `https://ark.cn-beijing.volces.com/api/v3/images/generations`
- **模型**: `doubao-seedream-4-5-251128`
- **API Key**: `32fca24e-df91-4bfe-acb2-9a3824b8be70`
- **实现位置**: `backend/src/services/imageService.js`

### 3. LangChain Agent现状
- ✅ 已引入LangChain依赖包
- ✅ 已实现基础的Agent类结构
- ❌ **ChatOpenAI配置错误**: Base URL路径不正确,缺少`/api`
- ❌ **凭证配置错误**: 使用了`openAIApiKey`但实际应为`apiKey`
- ❌ **工具调用未完全集成**: 部分工具还是模拟实现

---

## 🎯 优化目标

### 核心目标
1. **统一LLM配置**: 所有文本生成使用GLM-4.7 (胜算云)
2. **工具化封装**: 将现有服务封装为LangChain Tools
3. **Agent自主决策**: 使用Agent自动规划任务执行流程
4. **多模态支持**: 集成图像生成、图像分析能力
5. **记忆系统**: 实现历史内容记忆和检索

### 功能清单
- [x] 文案生成 (GLM-4.7)
- [x] 提示词生成 (GLM-4.7)
- [x] 图像生成 (Doubao4.5)
- [x] 质量评估 (GLM-4.7)
- [x] 框架匹配 (GLM-4.7)
- [x] 记忆管理 (LRU Cache)
- [ ] 多模态分析 (需接入视觉模型)
- [ ] 自我修正 (Critique Agent)

---

## 📐 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 (Vue 3)                             │
│  Generate.vue → api.js → /api/agent/generate              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 后端 (Express + LangChain)                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Agent Controller                         │   │
│  │  POST /api/agent/generate                         │   │
│  │  POST /api/agent/stream                           │   │
│  │  GET  /api/agent/history                         │   │
│  └──────────────┬──────────────────────────────────────┘   │
│                 │                                           │
│                 ▼                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          XiaohongshuAgent (主Agent)                 │   │
│  │  - 规划: 使用LLM分析需求,决定执行步骤              │   │
│  │  - 执行: 调用对应的Tools完成任务                    │   │
│  │  - 记忆: 存储高质量内容供后续复用                  │   │
│  └──────┬──────────────┬──────────────┬───────────────┘   │
│         │              │              │                     │
│         ▼              ▼              ▼                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Tool: 文案  │ │Tool: 提示词  │ │Tool: 框架   │        │
│  │  Generation │ │Generation   │ │  Matching   │        │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘        │
│         │              │              │                     │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌───┴──────────┐        │
│  │  Tool: 图像  │ │Tool: 质量   │ │Tool: 记忆    │        │
│  │  Generation │ │Assessment   │ │Management   │        │
│  └──────┬──────┘ └──────┬──────┘ └───┬──────────┘        │
│         │              │              │                     │
│         ▼              ▼              ▼                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              External Services                       │   │
│  │  ┌──────────────────┐ ┌──────────────────────┐    │   │
│  │  │ GLM-4.7 (胜算云) │ │ Doubao4.5 (火山引擎) │    │   │
│  │  │ - 文案生成       │ │ - 图像生成           │    │   │
│  │  │ - 提示词生成     │ │ - 图像编辑           │    │   │
│  │  │ - 质量评估       │ │ - 多图融合           │    │   │
│  │  └──────────────────┘ └──────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Agent工作流程

```
用户输入 (关键词/图片)
    │
    ▼
┌─────────────────────────────────────┐
│  1. Agent 规划阶段 (GLM-4.7)      │
│     - 分析用户需求                 │
│     - 决定需要哪些工具             │
│     - 生成执行计划                 │
└──────────────┬────────────────────┘
               │
    ┌──────────┼──────────┬──────────┐
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│检索记忆│ │匹配框架│ │生成文案│ │生成提示│
└────────┘ └────────┘ └────────┘ └────────┘
    │                      │          │
    └──────────┬───────────┘          │
               ▼                      ▼
         ┌───────────────┐     ┌─────────────┐
         │  质量评估     │     │  生成图像   │
         │  (GLM-4.7)    │     │ (Doubao4.5) │
         └───────┬───────┘     └──────┬──────┘
                 │                    │
                 └────────┬───────────┘
                          ▼
                 ┌─────────────────┐
                 │  保存到记忆     │
                 │  (高质量内容)   │
                 └─────────────────┘
                          │
                          ▼
                 返回结果给用户
```

---

## 📝 详细修改方案

### 阶段1: 修复LLM配置 ✅ (已完成)

**问题诊断**:
1. `BaseLLM.js`中Base URL缺少`/api`路径
2. 使用了错误的配置变量`AI_CONFIG`(不存在)
3. 配置与`aiService.js`不一致

**解决方案**:
- ✅ 直接在`BaseLLM.js`中定义`SHENGSUAN_CONFIG`常量
- ✅ 使用正确的API端点: `https://router.shengsuanyun.com/api/v1`
- ✅ 保持与`aiService.js`的配置一致

**修改文件**:
- `backend/src/agents/base/BaseLLM.js` ✅

---

### 阶段2: 优化Agent执行逻辑

**目标**: 增强`XiaohongshuAgent`的自主决策能力

**修改内容**:
1. 添加智能规划功能
2. 优化工具调用顺序
3. 增强错误处理和重试机制

**修改文件**:
- `backend/src/agents/xiaohongshuAgent.js`

**实施步骤**:
```javascript
// 添加智能规划方法
async planExecution(input) {
  const { keywords, userMessage, uploadedImageUrl } = input
  
  const planPrompt = `作为小红书内容创作Agent,请规划生成步骤:

输入信息:
- 关键词: ${keywords || '无'}
- 用户需求: ${userMessage || '无'}
- 参考图片: ${uploadedImageUrl ? '有' : '无'}

请规划执行步骤(按优先级排序):
1. framework_match - 框架匹配
2. memory_retrieve - 检索历史记忆
3. content_generator - 生成文案
4. quality_assessor - 质量评估
5. image_prompt_generator - 生成提示词
6. image_generator - 生成图像
7. memory_storage - 保存记忆

输出JSON格式: {"steps": ["step1", "step2"], "reason": "..."}`
  
  const response = await glmLLM.invoke(planPrompt)
  return JSON.parse(response.content)
}
```

---

### 阶段3: 优化图像生成工具

**目标**: 修复`ImageGenerationTool`中的API调用错误

**问题诊断**:
- `ImageService.generateImageFromImage`参数传递错误
- `imageUrls`应该是单个URL,不是数组

**修改文件**:
- `backend/src/agents/tools/imageGenTool.js`

**修复代码**:
```javascript
case 'image-to-image':
  if (uploadedImages.length === 0) {
    throw new Error('图生图模式需要提供参考图片')
  }
  
  const img2imgTasks = await Promise.all(
    Array(count).fill(0).map(() => 
      ImageService.generateImageFromImage(
        uploadedImages[0],  // 正确: 直接传递URL字符串
        prompt,            // 正确: 提示词作为第二个参数
        {
          size,
          watermark: false
        }
      )
    )
  )
  break
```

---

### 阶段4: 增强多模态分析工具

**目标**: 实现真正的多模态图像分析

**技术选型**:
- **方案1**: 接入GPT-4V (需要OpenAI账号)
- **方案2**: 接入火山引擎的视觉模型 (推荐,统一服务商)
- **方案3**: 使用本地轻量级模型 (CLIP等)

**推荐方案**: 火山引擎多模态分析API

**修改文件**:
- `backend/src/agents/tools/multimodalTool.js`

**实现代码**:
```javascript
async _call(input) {
  const { imageUrl, analysisDetail = 'basic' } = this.parseInput(input)
  
  this.logStep('开始多模态分析', { 
    imageUrl: imageUrl?.substring(0, 50) + '...',
    detail: analysisDetail 
  })

  try {
    // 调用火山引擎视觉分析API
    const response = await axios.post(
      `${IMAGE_API_CONFIG.baseURL}chat/completions`,
      {
        model: 'doubao-vision-32k', // 假设的视觉模型
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: '请分析这张图片的风格、构图、色彩和氛围,为小红书创作提供参考。' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const analysis = JSON.parse(response.data.choices[0].message.content)
    return this.formatOutput(true, analysis)
    
  } catch (error) {
    // 降级处理
    return this.formatOutput(true, {
      visual_style: '清新简约',
      note: '视觉分析服务暂不可用,使用默认分析结果'
    })
  }
}
```

---

### 阶段5: 实现自我修正Agent

**目标**: 在质量评估不达标时,自动优化内容

**新增文件**:
- `backend/src/agents/tools/critiqueTool.js`

**实现代码**:
```javascript
/**
 * 批评与修正工具
 * 根据质量评估结果,自动优化内容
 */

import { XHSTool } from '../base/BaseTool.js'
import { LLM_CONFIGS } from '../base/BaseLLM.js'

export class CritiqueTool extends XHSTool {
  constructor() {
    super(
      'critique_agent',
      '根据质量评估结果,对内容进行自我修正和优化'
    )
  }

  async _call(input) {
    const { 
      content, 
      qualityResult, 
      framework,
      maxIterations = 3 
    } = this.parseInput(input)
    
    this.logStep('开始自我修正', { 
      currentScore: qualityResult.overall_score 
    })

    let currentContent = content
    let iteration = 0
    let bestScore = qualityResult.overall_score
    let bestContent = content

    while (iteration < maxIterations) {
      iteration++
      
      // 生成修正建议
      const critiquePrompt = `你是一个专业的内容优化专家。

当前内容:
${currentContent}

质量评估结果:
${JSON.stringify(qualityResult)}

请提供具体的改进建议(至少3条):`

      const critiqueResponse = await LLM_CONFIGS.analysis.invoke(critiquePrompt)
      
      // 根据建议重新生成
      const rewritePrompt = `你是一个小红书内容创作专家。

原始内容:
${content}

改进建议:
${critiqueResponse.content}

框架要求: ${framework || '通用'}

请根据改进建议重写内容,保持小红书风格和调性。`

      const rewriteResponse = await LLM_CONFIGS.content.invoke(rewritePrompt)
      currentContent = rewriteResponse.content
      
      // 重新评估
      const qualityTool = new QualityAssessmentTool()
      const newQuality = JSON.parse(await qualityTool._call(JSON.stringify({
        content: currentContent,
        framework
      })))
      
      if (newQuality.data.overall_score > bestScore) {
        bestScore = newQuality.data.overall_score
        bestContent = currentContent
        this.logStep(`第${iteration}次修正: 质量提升`, { 
          oldScore: qualityResult.overall_score,
          newScore: bestScore 
        })
      } else {
        this.logStep(`第${iteration}次修正: 质量未提升,停止`)
        break
      }
      
      // 达到目标分数,停止修正
      if (bestScore >= 8.5) {
        this.logStep(`质量达标,停止修正`, { score: bestScore })
        break
      }
    }

    return this.formatOutput(true, {
      content: bestContent,
      finalScore: bestScore,
      iterations: iteration,
      improvement: bestScore - qualityResult.overall_score
    })
  }
}
```

---

### 阶段6: 环境变量统一管理

**目标**: 将API密钥统一管理,便于部署和维护

**修改文件**:
- `backend/.env` (新增)
- `backend/.env.example` (更新)

**新增环境变量**:
```bash
# 胜算云API配置 (GLM-4.7)
SHENGSUAN_API_KEY=LCCjfox5GKqoYckBB-86zxXjPfsdrUxPUaYcxoQzeCyfsHJHIMND0CFV1J-04Jh7QGbltNm9aRBV2OXz3gubR2_OZR-FlJ7k3oAnrg
SHENGSUAN_BASE_URL=https://router.shengsuanyun.com/api/v1
SHENGSUAN_MODEL=bigmodel/glm-4.7

# 火山引擎API配置 (Doubao4.5)
VOLCENGINE_API_KEY=32fca24e-df91-4bfe-acb2-9a3824b8be70
VOLCENGINE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3/
VOLCENGINE_MODEL=doubao-seedream-4-5-251128

# LangChain配置
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_VERBOSE=true
```

**更新BaseLLM.js**:
```javascript
const SHENGSUAN_CONFIG = {
  baseURL: process.env.SHENGSUAN_BASE_URL || 'https://router.shengsuanyun.com/api/v1',
  apiKey: process.env.SHENGSUAN_API_KEY || 'YOUR_API_KEY',
  model: process.env.SHENGSUAN_MODEL || 'bigmodel/glm-4.7'
}
```

---

### 阶段7: 前端集成Agent API

**目标**: 前端调用Agent接口,展示"思考过程"

**修改文件**:
- `src/services/api.js` (新增agentAPI)
- `src/views/Generate.vue` (新增Agent模式)

**新增API方法**:
```javascript
// Agent API
export const agentAPI = {
  // 使用Agent自动生成
  async generateWithAgent(params) {
    return api.post('/agent/generate', params)
  },
  
  // 流式生成
  async generateWithStream(params, onProgress) {
    const response = await fetch(`${baseURL}/agent/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '))
      
      for (const line of lines) {
        const data = JSON.parse(line.substring(6))
        if (onProgress) onProgress(data)
      }
    }
  },
  
  // 获取历史
  async getHistory() {
    return api.get('/agent/history')
  },
  
  // 检索记忆
  async retrieveMemory(params) {
    return api.post('/agent/memory/retrieve', params)
  }
}
```

---

### 阶段8: 测试与验证

**测试清单**:
1. ✅ ChatOpenAI配置正确性
2. ⬜ Agent执行流程
3. ⬜ 图像生成工具
4. ⬜ 记忆检索和存储
5. ⬜ 自我修正机制
6. ⬜ 前端集成
7. ⬜ 性能优化

**测试脚本**:
```javascript
// test-agent.js
import { XiaohongshuAgent } from './src/agents/xiaohongshuAgent.js'

const agent = new XiaohongshuAgent()

// 测试用例1: 简单生成
const test1 = await agent.execute({
  keywords: '露营装备',
  userMessage: '推荐轻量化的露营装备'
})

// 测试用例2: 带图生成
const test2 = await agent.execute({
  keywords: '探店',
  userMessage: '分析这张咖啡店图片并生成文案',
  uploadedImageUrl: 'https://...'
})

// 测试用例3: 记忆检索
const test3 = await agent.toolsMap.memory_retriever._call(JSON.stringify({
  keywords: ['露营', '户外'],
  limit: 3
}))

console.log('测试结果:', { test1, test2, test3 })
```

---

## 📊 预期效果

### 性能提升
- ⏱️ 响应时间: 预计减少30% (通过Agent并行优化)
- 🎯 内容质量: 自动重试机制,质量分数提升0.5-1.0分
- 💾 记忆复用: 30%的历史内容可直接复用或参考

### 用户体验
- 🤖 自主决策: Agent自动判断需要哪些步骤
- 📝 透明过程: 展示Agent的"思考链"
- 🔄 智能修正: 自动优化不达标的内容

### 开发效率
- 🧩 模块化: 每个Tool可独立测试和优化
- 🔌 可扩展: 新增功能只需添加新Tool
- 📚 可维护: 清晰的架构和注释

---

## 🚀 实施计划

| 阶段 | 任务 | 预计时间 | 优先级 |
|------|------|----------|--------|
| 阶段1 | 修复LLM配置 | ✅ 已完成 | P0 |
| 阶段2 | 优化Agent执行逻辑 | 2小时 | P0 |
| 阶段3 | 优化图像生成工具 | 1小时 | P0 |
| 阶段4 | 增强多模态分析 | 4小时 | P1 |
| 阶段5 | 实现自我修正 | 3小时 | P1 |
| 阶段6 | 环境变量统一 | 1小时 | P1 |
| 阶段7 | 前端集成 | 2小时 | P2 |
| 阶段8 | 测试与验证 | 2小时 | P0 |

**总计**: 15小时 (约2个工作日)

---

## ⚠️ 风险与注意事项

1. **API配额限制**: GLM-4.7和Doubao4.5都有调用频率限制
   - 建议: 实现请求队列和限流机制

2. **多模态API成本**: 视觉分析可能需要额外付费
   - 建议: 评估性价比,考虑降级方案

3. **记忆存储空间**: LRU Cache需要定期清理
   - 建议: 实现持久化存储和定期清理

4. **Agent执行时间**: 复杂任务可能较慢
   - 建议: 实现流式输出和进度展示

---

## 📚 参考资料

- [LangChain.js官方文档](https://js.langchain.com/)
- [GLM-4.7 API文档](https://open.bigmodel.cn/)
- [火山引擎图像生成API](https://www.volcengine.com/docs/82379/)
- [Agent设计模式](https://lilianweng.github.io/posts/2023-06-23-agent/)

---

## 📝 后续优化方向

1. **多轮对话**: 支持用户与Agent的持续对话
2. **知识库接入**: 集成外部知识库(RAG)
3. **A/B测试**: 对比Agent vs 传统流程的效果
4. **用户反馈学习**: 根据用户点赞/收藏调整策略
5. **实时监控**: Agent执行过程的可视化和调试
