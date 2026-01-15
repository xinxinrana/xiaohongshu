/**
 * 本地生成历史管理服务
 * 提供缓存生成结果、读取历史、清除历史等功能
 */

const HISTORY_KEY = 'rednote_generation_history'
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
