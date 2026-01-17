

import axios from 'axios'

// 修复：API Base URL 应该包含 /api 路径
const API_BASE_URL = 'https://router.shengsuanyun.com/api/v1'
const API_KEY = 'LCCjfox5GKqoYckBB-86zxXjPfsdrUxPUaYcxoQzeCyfsHJHIMND0CFV1J-04Jh7QGbltNm9aRBV2OXz3gubR2_OZR-FlJ7k3oAnrg'
const MODEL = 'bigmodel/glm-4.7'

/**
 * 调用AI API（带重试机制）
 * @param {string} prompt - 提示词
 * @param {number} maxRetries - 最大重试次数，默认2次
 * @returns {Promise<string>} AI返回的文本
 */
export async function callAI(prompt, maxRetries = 2) {
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`AI调用重试第${attempt}次...`)
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/chat/completions`,
        {
          model: MODEL,
          stream: false,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'HTTP-Referer': 'https://www.postman.com',
            'X-Title': 'Postman'
          },
          timeout: 120000  // 超时时间增加到120秒
        }
      )

      const content = response.data?.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('AI返回内容为空')
      }

      return content
    } catch (error) {
      lastError = error
      console.error(`AI API调用失败(第${attempt + 1}次):`, error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      
      // 如果还有重试机会，等待2秒后重试
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  
  throw new Error(`AI服务调用失败: ${lastError?.message}`)
}

