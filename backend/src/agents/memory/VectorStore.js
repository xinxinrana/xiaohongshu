/**
 * 轻量级记忆存储
 * 使用 LRU 缓存 + localStorage 持久化，避免依赖外部向量数据库
 */

import { LRUCache } from 'lru-cache'
import fs from 'fs/promises'
import path from 'path'

export class XHSMemory {
  constructor(maxSize = 100) {
    // 内存中的 LRU 缓存
    this.cache = new LRUCache({
      max: maxSize,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    })
    
    // 持久化文件路径
    this.storagePath = path.join(process.cwd(), '.xhs_memory.json')
    
    // 加载历史记忆
    this.loadFromDisk()
  }

  /**
   * 保存内容到记忆中
   * @param {string} content - 内容文本
   * @param {Object} metadata - 元数据（关键词、框架、质量评分等）
   * @returns {Promise<string>} 记忆 ID
   */
  async save(content, metadata = {}) {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const memory = {
      id: memoryId,
      content,
      metadata: {
        timestamp: new Date().toISOString(),
        keywords: metadata.keywords || [],
        framework: metadata.framework || '',
        qualityScore: metadata.qualityScore || 0,
        platform: 'xiaohongshu',
        ...metadata
      },
      embedding: this._simpleEmbedding(content)  // 简化的嵌入向量
    }
    
    this.cache.set(memoryId, memory)
    await this.saveToDisk()
    
    return memoryId
  }

  getAll() {
    return Array.from(this.cache.values()).sort((a, b) => {
      const aTime = new Date(a.metadata?.timestamp || a.metadata?.createdAt || 0).getTime()
      const bTime = new Date(b.metadata?.timestamp || b.metadata?.createdAt || 0).getTime()
      return bTime - aTime
    })
  }

  getById(memoryId) {
    return this.cache.get(memoryId) || null
  }

  async update(memoryId, payload = {}) {
    const existing = this.cache.get(memoryId)
    if (!existing) return null
    const updatedContent = payload.content ?? existing.content
    const updatedMetadata = {
      ...existing.metadata,
      ...(payload.metadata || {}),
      updatedAt: new Date().toISOString()
    }
    const updated = {
      ...existing,
      content: updatedContent,
      metadata: updatedMetadata,
      embedding: this._simpleEmbedding(updatedContent)
    }
    this.cache.set(memoryId, updated)
    await this.saveToDisk()
    return updated
  }

  /**
   * 根据查询检索相似内容
   * @param {string} query - 查询文本
   * @param {number} k - 返回结果数量
   * @returns {Promise<Array>} 相似内容列表
   */
  async retrieveSimilar(query, k = 3) {
    const queryEmbedding = this._simpleEmbedding(query)
    
    // 获取所有记忆
    const allMemories = Array.from(this.cache.values())
    
    // 计算相似度并排序
    const scored = allMemories
      .map(memory => ({
        ...memory,
        score: this._cosineSimilarity(queryEmbedding, memory.embedding)
      }))
      .filter(item => item.score > 0.1)  // 过滤低相似度（降低阈值以获得更多结果）
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
    
    return scored
  }

  /**
   * 根据关键词检索
   * @param {Array<string>} keywords - 关键词列表
   * @param {number} k - 返回结果数量
   * @returns {Promise<Array>} 匹配内容列表
   */
  async retrieveByKeywords(keywords, k = 5) {
    const allMemories = Array.from(this.cache.values())
    
    // 计算关键词匹配分数
    const scored = allMemories
      .map(memory => ({
        ...memory,
        score: this._keywordMatchScore(keywords, memory.metadata.keywords || [])
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
    
    return scored
  }

  /**
   * 获取高质量内容
   * @param {number} minScore - 最低质量分数
   * @param {number} limit - 返回数量
   * @returns {Promise<Array>} 高质量内容列表
   */
  async getHighQualityContent(minScore = 7, limit = 10) {
    const allMemories = Array.from(this.cache.values())
    
    return allMemories
      .filter(item => (item.metadata.qualityScore || 0) >= minScore)
      .sort((a, b) => b.metadata.qualityScore - a.metadata.qualityScore)
      .slice(0, limit)
  }

  /**
   * 删除指定记忆
   * @param {string} memoryId - 记忆 ID
   */
  async delete(memoryId) {
    this.cache.delete(memoryId)
    await this.saveToDisk()
  }

  /**
   * 清空所有记忆
   */
  async clear() {
    this.cache.clear()
    await this.saveToDisk()
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    const allMemories = Array.from(this.cache.values())
    
    return {
      totalMemories: allMemories.length,
      avgQualityScore: allMemories.reduce((sum, m) => sum + (m.metadata.qualityScore || 0), 0) / allMemories.length || 0,
      frameworks: this._countByField(allMemories, 'framework'),
      recentCount: allMemories.filter(m => {
        const daysSince = (Date.now() - new Date(m.metadata.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        return daysSince <= 7
      }).length
    }
  }

  /**
   * 从磁盘加载记忆
   */
  async loadFromDisk() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf-8')
      const memories = JSON.parse(data)
      
      // 恢复到缓存
      for (const [id, memory] of Object.entries(memories)) {
        this.cache.set(id, memory)
      }
      
      console.log(`[XHSMemory] 从磁盘加载了 ${Object.keys(memories).length} 条记忆`)
    } catch (error) {
      // 文件不存在是正常的，首次启动时创建
      console.log('[XHSMemory] 没有找到历史记忆，将创建新文件')
    }
  }

  /**
   * 保存记忆到磁盘
   */
  async saveToDisk() {
    try {
      const memories = {}
      for (const [id, memory] of this.cache.entries()) {
        memories[id] = memory
      }
      
      await fs.writeFile(
        this.storagePath,
        JSON.stringify(memories, null, 2),
        'utf-8'
      )
    } catch (error) {
      console.error('[XHSMemory] 保存到磁盘失败:', error)
    }
  }

  /**
   * 改进的文本嵌入（基于词频+位置哈希）
   * 使用固定映射方式确保相同词语映射到相同位置
   * 实际项目中应使用真实的嵌入模型（如 OpenAI Embeddings）
   */
  _simpleEmbedding(text) {
    if (!text) return []
    
    // 改进的分词逻辑
    let words = text
      .toLowerCase()
      // 将标点符号替换为空格
      .replace(/[|｜，,。！!？?；;、\n\r]/g, ' ')
      // 移除emoji（只移除emoji范围，不影响中文）
      // emoji的主要范围：U+1F600-1F64F (表情), U+1F300-1F5FF (符号), U+1F680-1F6FF (交通), U+1F1E0-1F1FF (旗帜)
      // 以及一些补充范围
      .replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .split(/\s+/)
      .filter(w => w.length > 0)
    
    // 对中文进行简单的bigram分词（2-gram）
    const chineseWords = []
    for (const word of words) {
      // 检查是否包含中文
      if (/[\u4e00-\u9fa5]/.test(word)) {
        // 中文分词：2-gram + 常见词
        for (let i = 0; i < word.length - 1; i++) {
          const bigram = word.substring(i, i + 2)
          chineseWords.push(bigram)
        }
        // 添加完整词（如果长度不超过4）
        if (word.length <= 4) {
          chineseWords.push(word)
        }
      } else {
        // 英文或数字直接添加
        chineseWords.push(word)
      }
    }
    
    words = chineseWords
    
    // 计算词频向量
    const freqMap = new Map()
    for (const word of words) {
      freqMap.set(word, (freqMap.get(word) || 0) + 1)
    }
    
    // 转换为固定长度向量（64维）- 使用哈希固定映射
    const vector = new Float32Array(64)
    
    // 简单的字符串哈希函数
    const simpleHash = (str) => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
      }
      return Math.abs(hash)
    }
    
    // 将每个词语映射到固定位置并累加频率
    for (const [word, freq] of freqMap.entries()) {
      const hash = simpleHash(word)
      const position = hash % 64  // 固定映射到0-63的位置
      vector[position] += freq
    }
    
    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
    if (norm > 0) {
      for (let i = 0; i < 64; i++) {
        vector[i] /= norm
      }
    }
    
    return Array.from(vector)
  }

  /**
   * 计算余弦相似度
   * 由于向量已经归一化，简化计算为点积
   */
  _cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0
    
    let dotProduct = 0
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
    }
    
    // 由于向量已归一化，直接返回点积
    // 防止数值误差导致超出[-1,1]范围
    return Math.max(-1, Math.min(1, dotProduct))
  }

  /**
   * 计算关键词匹配分数
   */
  _keywordMatchScore(queryKeywords, itemKeywords) {
    if (!queryKeywords || !itemKeywords) return 0
    
    let matchCount = 0
    for (const qk of queryKeywords) {
      for (const ik of itemKeywords) {
        if (qk.includes(ik) || ik.includes(qk)) {
          matchCount += 1
          break
        }
      }
    }
    
    return matchCount / Math.max(queryKeywords.length, 1)
  }

  /**
   * 按字段统计
   */
  _countByField(items, field) {
    const counts = {}
    for (const item of items) {
      const value = item.metadata[field] || 'unknown'
      counts[value] = (counts[value] || 0) + 1
    }
    return counts
  }
}

// 创建全局记忆实例
export const xhsMemory = new XHSMemory(100)
