/**
 * LangChain LLM 封装
 * 使用 aiService.js 中的 callAI 函数来确保与"普通模式"一致的稳定性
 */

import { callAI } from '../../services/aiService.js'

// 自定义 LLM 类，兼容 LangChain 的 invoke 接口
class SimpleGLMLLM {
  constructor(config = {}) {
    this.config = config
    this.modelName = 'bigmodel/glm-4.7'
  }

  async invoke(prompt) {
    try {
      // 如果 prompt 是对象（LangChain message），提取 content
      let promptText = prompt
      if (typeof prompt === 'object' && prompt.content) {
        promptText = prompt.content
      } else if (Array.isArray(prompt)) {
        // 处理消息数组
        promptText = prompt.map(m => {
          const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
          return content
        }).join('\n\n')
      }

      console.log(`[SimpleGLMLLM] 调用模型: ${this.modelName}, 温度: ${this.config.temperature || '默认'}`)
      
      // 直接使用经测试稳定的 callAI 函数
      // callAI 内部处理了 axios 调用、重试、超时和错误处理
      const content = await callAI(promptText, 2)
      
      // 返回 LangChain 格式的响应对象
      return {
        content: content,
        usage_metadata: {
          input_tokens: 0, // 估算或忽略
          output_tokens: 0,
          total_tokens: 0
        }
      }
    } catch (error) {
      console.error('[SimpleGLMLLM] 调用失败:', error)
      throw error
    }
  }
}

// 创建通用配置对象
const baseConfig = {
  temperature: 0.7
}

// 导出实例
export const glmLLM = new SimpleGLMLLM(baseConfig)

/**
 * 用于不同场景的 LLM 配置
 * 所有配置都使用胜算云的 GLM-4.7 模型 (通过 callAI)
 */
export const LLM_CONFIGS = {
  // 内容生成：较高的创造力
  content: new SimpleGLMLLM({ temperature: 0.8 }),

  // 分析评估：较低的温度，更稳定
  analysis: new SimpleGLMLLM({ temperature: 0.3 }),

  // 提示词生成：中等创造力
  prompts: new SimpleGLMLLM({ temperature: 0.6 }),

  // 快速响应
  fast: new SimpleGLMLLM({ temperature: 0.7 })
}

