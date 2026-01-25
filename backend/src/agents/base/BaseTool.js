/**
 * Tool 基类
 * 定义所有工具的基础接口和通用功能
 */

import { Tool } from '@langchain/core/tools'
import { z } from 'zod'

export class XHSTool extends Tool {
  /**
   * 构造函数
   * @param {string} name - 工具名称
   * @param {string} description - 工具描述（供 Agent 理解用途）
   * @param {z.ZodSchema} schema - 输入参数 Schema
   */
  constructor(name, description, schema = null) {
    super(name, description)
    this.schema = schema
  }

  /**
   * 执行工具（由子类实现）
   * @param {string} input - JSON 字符串格式的输入
   * @returns {Promise<string>} 返回结果
   */
  async _call(input) {
    throw new Error('_call() must be implemented by subclass')
  }

  /**
   * 解析输入参数
   * @param {string} input - JSON 字符串
   * @returns {Object} 解析后的对象
   */
  parseInput(input) {
    try {
      return JSON.parse(input)
    } catch (error) {
      console.error(`[${this.name}] 输入解析失败:`, error)
      throw new Error(`Invalid JSON input: ${input}`)
    }
  }

  /**
   * 格式化输出
   * @param {boolean} success - 是否成功
   * @param {*} data - 返回数据
   * @param {string} error - 错误信息
   * @returns {string} JSON 字符串格式的结果
   */
  formatOutput(success, data = null, error = null) {
    const result = {
      success,
      data,
      error,
      tool: this.name,
      timestamp: new Date().toISOString()
    }
    return JSON.stringify(result)
  }

  /**
   * 记录工具执行步骤
   * @param {string} step - 步骤描述
   * @param {Object} data - 步骤数据
   */
  logStep(step, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tool: this.name,
      step,
      data
    }
    console.log(`[${this.name}] ${step}:`, data)
    return logEntry
  }
}

/**
 * 创建输入 Schema 的辅助函数
 */
export function createInputSchema(fields) {
  return z.object(fields)
}
