/**
 * Agent 基类
 * 定义所有 Agent 的基础接口和通用功能
 */

export class BaseAgent {
  /**
   * 构造函数
   * @param {string} name - Agent 名称
   * @param {Array} tools - 可用工具列表
   * @param {Object} llm - LangChain LLM 实例
   * @param {string} description - Agent 描述
   */
  constructor(name, tools = [], llm = null, description = '') {
    this.name = name
    this.tools = tools
    this.llm = llm
    this.description = description
    this.executionHistory = []
  }

  /**
   * 执行 Agent 任务（由子类实现）
   * @param {Object} input - 输入参数
   * @returns {Promise<Object>} 执行结果
   */
  async execute(input) {
    throw new Error('execute() must be implemented by subclass')
  }

  /**
   * 记录执行步骤
   * @param {string} step - 步骤描述
   * @param {Object} data - 步骤数据
   */
  logStep(step, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      step,
      data
    }
    this.executionHistory.push(logEntry)
    console.log(`[${this.name}] ${step}:`, data)
    return logEntry
  }

  /**
   * 获取执行历史
   * @returns {Array} 执行历史
   */
  getHistory() {
    return this.executionHistory
  }

  /**
   * 清空执行历史
   */
  clearHistory() {
    this.executionHistory = []
  }

  /**
   * 格式化输出
   * @param {boolean} success - 是否成功
   * @param {*} data - 返回数据
   * @param {string} error - 错误信息
   * @returns {Object} 格式化后的响应
   */
  formatResponse(success, data = null, error = null) {
    return {
      success,
      data,
      error,
      agent: this.name,
      timestamp: new Date().toISOString(),
      steps: this.executionHistory
    }
  }
}
