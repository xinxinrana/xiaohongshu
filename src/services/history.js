/**
 * 本地生成历史管理服务
 * 提供缓存生成结果、读取历史、清除历史、迭代记录等功能
 */

const HISTORY_KEY = 'rednote_generation_history'
const ENHANCED_HISTORY_KEY = 'rednote_enhanced_generation_history'
const MAX_HISTORY_LENGTH = 50

export const historyService = {
  /**
   * 保存一次生成结果到历史记录
   * @param {Object} data - 生成的数据对象
   */
  save(data) {
    try {
      const history = this.getAll()
      const newItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        keywords: data.keywords || '',
        content: data.content,
        images: data.images || [],
        qualityAnalysis: data.qualityAnalysis || null,
        specialRequirements: data.specialRequirements || ''
      }
      
      // 添加到开头
      history.unshift(newItem)
      
      // 限制长度
      if (history.length > MAX_HISTORY_LENGTH) {
        history.pop()
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      return newItem
    } catch (e) {
      console.error('保存历史记录失败:', e)
      return null
    }
  },

  /**
   * 获取所有历史记录
   * @returns {Array} 历史记录数组
   */
  getAll() {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取历史记录失败:', e)
      return []
    }
  },

  /**
   * 根据 ID 获取单条记录
   * @param {number|string} id 
   */
  getById(id) {
    const history = this.getAll()
    return history.find(item => item.id === Number(id))
  },

  /**
   * 删除单条历史记录
   * @param {number|string} id 
   */
  remove(id) {
    try {
      const history = this.getAll()
      const filtered = history.filter(item => item.id !== Number(id))
      localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
      return true
    } catch (e) {
      console.error('删除历史记录失败:', e)
      return false
    }
  },

  /**
   * 清空所有历史
   */
  clear() {
    localStorage.removeItem(HISTORY_KEY)
  }
}

/**
 * 增强版工作流历史管理服务
 * 支持多轮迭代记录
 */
export const enhancedHistoryService = {
  /**
   * 保存增强版生成结果（支持迭代）
   * @param {Object} data - 生成的数据对象
   * @param {string} sessionId - 会话 ID（同一会话的多次迭代使用相同sessionId）
   */
  save(data, sessionId = null) {
    try {
      const history = this.getAll()
      const sid = sessionId || Date.now().toString()
      
      const newItem = {
        id: Date.now(),
        sessionId: sid,
        timestamp: new Date().toISOString(),
        keywords: data.keywords || '',
        userMessage: data.userMessage || '',
        content: data.content,
        prompts: data.prompts || [],
        images: data.images || [],
        qualityAnalysis: data.qualityAnalysis || null,
        iterations: data.iterations || [],  // 迭代历史记录
        iterationCount: data.iterationCount || 0,
        uploadedImageUrl: data.uploadedImageUrl || null,
        isEnhanced: true
      }
      
      // 添加到开头
      history.unshift(newItem)
      
      // 限制长度
      if (history.length > MAX_HISTORY_LENGTH) {
        history.pop()
      }
      
      localStorage.setItem(ENHANCED_HISTORY_KEY, JSON.stringify(history))
      return newItem
    } catch (e) {
      console.error('保存增强版历史记录失败:', e)
      return null
    }
  },

  /**
   * 更新某个会话的迭代记录
   * @param {string} sessionId - 会话 ID
   * @param {Object} iterationData - 迭代数据
   */
  updateIteration(sessionId, iterationData) {
    try {
      const history = this.getAll()
      const sessionIndex = history.findIndex(item => item.sessionId === sessionId)
      
      if (sessionIndex !== -1) {
        const session = history[sessionIndex]
        
        // 增加迭代记录
        if (!session.iterations) {
          session.iterations = []
        }
        
        session.iterations.push({
          iterationNumber: session.iterations.length + 1,
          timestamp: new Date().toISOString(),
          ...iterationData
        })
        
        // 更新当前内容
        session.content = iterationData.content || session.content
        session.prompts = iterationData.prompts || session.prompts
        session.images = iterationData.images || session.images
        session.iterationCount = session.iterations.length
        session.timestamp = new Date().toISOString()  // 更新时间戳
        
        localStorage.setItem(ENHANCED_HISTORY_KEY, JSON.stringify(history))
        return session
      }
      
      return null
    } catch (e) {
      console.error('更新迭代记录失败:', e)
      return null
    }
  },

  /**
   * 获取所有增强版历史记录
   * @returns {Array} 历史记录数组
   */
  getAll() {
    try {
      const data = localStorage.getItem(ENHANCED_HISTORY_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('读取增强版历史记录失败:', e)
      return []
    }
  },

  /**
   * 根据 sessionId 获取会话
   * @param {string} sessionId 
   */
  getBySessionId(sessionId) {
    const history = this.getAll()
    return history.find(item => item.sessionId === sessionId)
  },

  /**
   * 根据 ID 获取单条记录
   * @param {number|string} id 
   */
  getById(id) {
    const history = this.getAll()
    return history.find(item => item.id === Number(id))
  },

  /**
   * 删除单条历史记录
   * @param {number|string} id 
   */
  remove(id) {
    try {
      const history = this.getAll()
      const filtered = history.filter(item => item.id !== Number(id))
      localStorage.setItem(ENHANCED_HISTORY_KEY, JSON.stringify(filtered))
      return true
    } catch (e) {
      console.error('删除增强版历史记录失败:', e)
      return false
    }
  },

  /**
   * 清空所有增强版历史
   */
  clear() {
    localStorage.removeItem(ENHANCED_HISTORY_KEY)
  },

  /**
   * 获取某个会话的所有迭代记录
   * @param {string} sessionId 
   */
  getIterations(sessionId) {
    const session = this.getBySessionId(sessionId)
    return session ? session.iterations || [] : []
  }
}
