

import axios from 'axios'

const API_BASE_URL = 'https://router.shengsuanyun.com/v1'
const API_KEY = 'LCCjfox5GKqoYckBB-86zxXjPfsdrUxPUaYcxoQzeCyfsHJHIMND0CFV1J-04Jh7QGbltNm9aRBV2OXz3gubR2_OZR-FlJ7k3oAnrg'
const MODEL = 'bigmodel/glm-4.7'

/**
 * 调用AI API
 * @param {string} prompt - 提示词
 * @returns {Promise<string>} AI返回的文本
 */
export async function callAI(prompt) {
  try {
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
        timeout: 60000
      }
    )

    const content = response.data?.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('AI返回内容为空')
    }

    return content
  } catch (error) {
    console.error('AI API调用失败:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    throw new Error(`AI服务调用失败: ${error.message}`)
  }
}

