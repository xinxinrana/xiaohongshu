/**
 * 记忆检索工具
 * 从历史记忆中检索相似内容，用于参考和提升生成质量
 */

import { XHSTool } from '../base/BaseTool.js'
import { xhsMemory } from '../memory/VectorStore.js'

export class MemoryRetrievalTool extends XHSTool {
  constructor() {
    super(
      'memory_retriever',
      '从历史记忆中检索相似的高质量内容，作为参考来提升新生成内容的质量和一致性'
    )
  }

  async _call(input) {
    const { keywords, query, minQuality = 7, limit = 3 } = this.parseInput(input)
    
    this.logStep('开始检索记忆', { keywords, query, minQuality })

    try {
      let results = []
      
      // 优先使用关键词检索
      if (keywords && keywords.length > 0) {
        results = await xhsMemory.retrieveByKeywords(keywords, limit)
        
        // 如果关键词检索结果不足，补充相似内容检索
        if (results.length < limit) {
          const similarResults = await xhsMemory.retrieveSimilar(
            Array.isArray(keywords) ? keywords.join(' ') : keywords,
            limit - results.length
          )
          results = [...results, ...similarResults]
        }
      } else if (query) {
        // 使用相似内容检索
        results = await xhsMemory.retrieveSimilar(query, limit)
      } else {
        // 获取高质量内容
        results = await xhsMemory.getHighQualityContent(minQuality, limit)
      }

      // 过滤结果
      const filteredResults = results.slice(0, limit)

      this.logStep('记忆检索完成', { 
        resultCount: filteredResults.length 
      })

      return this.formatOutput(true, {
        memories: filteredResults,
        count: filteredResults.length,
        retrievedBy: keywords ? 'keywords' : (query ? 'similarity' : 'quality')
      })
    } catch (error) {
      this.logStep('记忆检索失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}

/**
 * 记忆保存工具
 */
export class MemoryStorageTool extends XHSTool {
  constructor() {
    super(
      'memory_saver',
      '将生成的内容保存到记忆中，包括内容、关键词、质量评分等元数据'
    )
  }

  async _call(input) {
    const { content, metadata } = this.parseInput(input)
    
    this.logStep('开始保存到记忆', { contentLength: content?.length })

    try {
      const memoryId = await xhsMemory.save(content, metadata)
      
      this.logStep('记忆保存完成', { memoryId })
      
      // 获取统计信息
      const stats = xhsMemory.getStats()
      
      return this.formatOutput(true, {
        memoryId,
        stats
      })
    } catch (error) {
      this.logStep('记忆保存失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}
