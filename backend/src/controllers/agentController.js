/**
 * Agent 控制器
 * 提供 Agent 相关的 API 接口
 */

import { XiaohongshuAgent } from '../agents/xiaohongshuAgent.js'
import { xhsMemory } from '../agents/memory/VectorStore.js'

// 创建 Agent 单例
const agent = new XiaohongshuAgent()

const stripEmbedding = (memory) => {
  if (!memory) return memory
  const { embedding, ...rest } = memory
  return rest
}

/**
 * 使用 Agent 自动生成内容
 * POST /api/agent/generate
 */
export async function generateWithAgent(req, res) {
  try {
    const { keywords, userMessage, uploadedImageUrl, action = 'auto' } = req.body
    
    console.log('[Agent] 收到生成请求:', { keywords, userMessage, action })
    
    if (!keywords && !userMessage) {
      return res.status(400).json({
        success: false,
        error: '关键词或用户需求至少需要提供一个'
      })
    }

    let result
    switch (action) {
      case 'quick':
        result = await agent.quickGenerate({ keywords, userMessage, uploadedImageUrl })
        break
      case 'full':
        result = await agent.fullProcess({ keywords, userMessage, uploadedImageUrl })
        break
      case 'auto':
      default:
        result = await agent.execute({ keywords, userMessage, uploadedImageUrl, action })
        break
    }

    res.json(result)
  } catch (error) {
    console.error('[Agent] 执行失败:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

/**
 * 获取 Agent 执行历史
 * GET /api/agent/history
 */
export async function getAgentHistory(req, res) {
  try {
    const history = agent.getHistory()
    res.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error('[Agent] 获取历史失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 清空 Agent 执行历史
 * DELETE /api/agent/history
 */
export async function clearAgentHistory(req, res) {
  try {
    agent.clearHistory()
    res.json({
      success: true,
      message: '执行历史已清空'
    })
  } catch (error) {
    console.error('[Agent] 清空历史失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 流式 Agent 生成（预留）
 * POST /api/agent/stream
 */
export async function generateWithStream(req, res) {
  try {
    const { keywords, userMessage, uploadedImageUrl } = req.body
    
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 执行快速生成（流式）
    const contentResult = await agent.quickGenerate({ keywords, userMessage, uploadedImageUrl })
    
    // 发送结果
    res.write(`data: ${JSON.stringify(contentResult)}\n\n`)
    res.end()
  } catch (error) {
    console.error('[Agent] 流式生成失败:', error)
    res.write(`data: ${JSON.stringify({ success: false, error: error.message })}\n\n`)
    res.end()
  }
}

/**
 * 获取所有记忆
 * GET /api/agent/memory
 */
export async function getAllMemory(req, res) {
  try {
    const memories = xhsMemory.getAll().map(stripEmbedding)
    res.json({
      success: true,
      data: {
        memories,
        count: memories.length
      }
    })
  } catch (error) {
    console.error('[Memory] 获取列表失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 获取单条记忆
 * GET /api/agent/memory/:id
 */
export async function getMemoryById(req, res) {
  try {
    const memory = stripEmbedding(xhsMemory.getById(req.params.id))
    if (!memory) {
      return res.status(404).json({ success: false, error: '记忆不存在' })
    }
    res.json({ success: true, data: memory })
  } catch (error) {
    console.error('[Memory] 获取详情失败:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

/**
 * 创建记忆
 * POST /api/agent/memory
 */
export async function createMemory(req, res) {
  try {
    const { content, metadata = {} } = req.body || {}
    if (!content) {
      return res.status(400).json({ success: false, error: '内容不能为空' })
    }
    const memoryId = await xhsMemory.save(content, metadata)
    const memory = stripEmbedding(xhsMemory.getById(memoryId))
    res.json({ success: true, data: memory })
  } catch (error) {
    console.error('[Memory] 创建失败:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

/**
 * 更新记忆
 * PUT /api/agent/memory/:id
 */
export async function updateMemory(req, res) {
  try {
    const updated = await xhsMemory.update(req.params.id, req.body || {})
    if (!updated) {
      return res.status(404).json({ success: false, error: '记忆不存在' })
    }
    res.json({ success: true, data: stripEmbedding(updated) })
  } catch (error) {
    console.error('[Memory] 更新失败:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

/**
 * 删除记忆
 * DELETE /api/agent/memory/:id
 */
export async function deleteMemory(req, res) {
  try {
    const memory = xhsMemory.getById(req.params.id)
    if (!memory) {
      return res.status(404).json({ success: false, error: '记忆不存在' })
    }
    await xhsMemory.delete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('[Memory] 删除失败:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

/**
 * 获取记忆统计信息
 * GET /api/agent/memory/stats
 */
export async function getMemoryStats(req, res) {
  try {
    const stats = xhsMemory.getStats()
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('[Memory] 获取统计失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 检索记忆
 * POST /api/agent/memory/retrieve
 */
export async function retrieveMemory(req, res) {
  try {
    const { keywords, query, limit = 5 } = req.body
    
    let results
    if (keywords && keywords.length > 0) {
      results = await xhsMemory.retrieveByKeywords(keywords, limit)
    } else if (query) {
      results = await xhsMemory.retrieveSimilar(query, limit)
    } else {
      results = await xhsMemory.getHighQualityContent(7, limit)
    }
    
    res.json({
      success: true,
      data: {
        memories: results,
        count: results.length
      }
    })
  } catch (error) {
    console.error('[Memory] 检索失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 清空记忆
 * DELETE /api/agent/memory
 */
export async function clearMemory(req, res) {
  try {
    await xhsMemory.clear()
    res.json({
      success: true,
      message: '记忆已清空'
    })
  } catch (error) {
    console.error('[Memory] 清空失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
