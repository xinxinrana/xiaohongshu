




import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

/**
 * AI API 客户端配置
 */
const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin, // 某些路由服务需要这个
    'X-Title': 'Xiaohongshu Generator' // 某些路由服务需要这个，必须是 ASCII 字符
  },
  timeout: 30000
})

/**
 * 火山引擎 (申图) 客户端配置
 */
const imageClient = axios.create({
  baseURL: import.meta.env.VITE_VOLCENGINE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_VOLCENGINE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 图片生成可能需要更长时间
})

/**
 * 获取 AI 模型的响应（支持流式传输）
 * @param {string} prompt - 提示词
 * @param {Object} options - 配置项
 * @param {Function} options.onStream - 流式输出回调
 * @returns {Promise<string>}
 */
const getAIResponse = async (prompt, options = {}) => {
  const model = import.meta.env.VITE_AI_MODEL || 'bigmodel/glm-4.7'
  const apiKey = import.meta.env.VITE_AI_API_KEY
  const baseUrl = import.meta.env.VITE_AI_BASE_URL

  const payload = {
    model: model,
    messages: [
      { role: 'system', content: '你是一个专业的小红书文案专家。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    top_p: 0.7,
    stream: !!options.onStream
  }

  try {
    console.log('正在调用 AI API, 模型:', model, '流式:', !!options.onStream)

    if (options.onStream) {
      const response = await fetch(`${baseUrl}chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') break
            
            try {
              const data = JSON.parse(dataStr)
              const content = data.choices[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                options.onStream(fullContent, content)
              }
            } catch (e) {
              console.error('解析流数据失败:', e)
            }
          }
        }
      }
      return fullContent
    } else {
      // 非流式模式保留 axios 调用（用于简单的分析接口）
      const response = await aiClient.post('chat/completions', payload)
      return response.data.choices[0].message.content
    }
  } catch (error) {
    console.error('AI API 调用失败:', error)
    throw error
  }
}

/**
 * 框架 API
 */
export const frameworkAPI = {
  /**
   * 获取所有可用框架
   */
  async getAll() {
    // 这里返回硬编码的框架列表，实际应用中可以从后端获取
    return {
      data: {
        success: true,
        data: [
          { id: '小红书爆款框架', name: '爆款逻辑', description: '针对小红书平台优化的流量密码框架' },
          { id: '情感共鸣框架', name: '情感共鸣', description: '通过情绪价值连接读者，提升转化' },
          { id: '干货分享框架', name: '干货分享', description: '系统化输出价值内容，建立专家形象' },
          { id: '种草推荐框架', name: '种草推荐', description: '真实体验驱动，深度测评好物' },
          { id: '生活方式分享框架', name: '生活方式', description: '展示生活态度，打造个人 IP' }
        ]
      }
    }
  }
}

/**
 * 分析 API
 */
export const analysisAPI = {
  /**
   * 根据关键词推荐框架
   * @param {string} keywords - 输入的关键词
   */
  async analyze(keywords) {
    const prompt = `作为小红书运营专家，根据用户提供的关键词 "${keywords}"，从以下框架中推荐 3 个最适合的小红书文案写作框架，并给出推荐理由和匹配度（0-100）：
    - 小红书爆款框架
    - 情感共鸣框架
    - 干货分享框架
    - 种草推荐框架
    - 生活方式分享框架
    
    直接以纯文本形式返回推荐结果。`
    
    try {
      const content = await getAIResponse(prompt)
      // 为了不破坏现有 UI 逻辑，我们将文本放在一个模拟的对象中
      return { 
        data: {
          success: true, 
          data: {
            recommendedFrameworks: [], // 临时置空，UI 需要处理这种情况
            rawText: content 
          } 
        } 
      }
    } catch (error) {
      return {
        data: {
          success: true,
          data: {
            recommendedFrameworks: [],
            rawText: '推荐失败，请手动选择框架。'
          }
        }
      }
    }
  }
}

/**
 * 生成 API
 */
export const generationAPI = {
  /**
   * 一键全自动生成：识别最佳博主/方法论并生成内容
   * @param {string} keywords - 关键词
   * @param {Object} options - 流式配置项
   */
  async autoGenerate(keywords, options = {}) {
    const prompt = `你是一个顶级的小红书运营专家。针对用户提供的关键词 "${keywords}"，请执行以下操作：
    
    1. 识别该行业或领域内目前最顶尖、最火爆的博主风格或内容方法论。
    2. 模仿该顶尖风格，直接创作一篇极具吸引力的小红书文案。
    
    文案要求：
    - 正文内容请控制在 500 字以内。
    - 语气要符合该领域顶级博主的设定（如专业、亲切、毒舌或治愈）。
    - 结构必须包含：带 Emoji 的标题、分段清晰的正文、精准的标签。
    - 必须包含针对 AI 绘画的配图建议描述。
    
    请直接输出文案内容，不要包含任何前导说明。`
    
    try {
      const content = await getAIResponse(prompt, options)
      return { 
        data: { 
          success: true, 
          data: {
            isRawText: true,
            content: content,
            selectedMethodology: '自动匹配顶级博主风格'
          } 
        } 
      }
    } catch (error) {
      console.error('全自动生成失败:', error)
      throw error
    }
  },

  /**
   * 生成文案内容
   * @param {string} keywords - 关键词
   * @param {string} frameworkId - 框架ID
   */
  async generate(keywords, frameworkId) {
    const prompt = `作为小红书达人，根据关键词 "${keywords}" 和指定的框架（可能是多个，用逗号分隔） "${frameworkId}"，创作一篇吸引人的小红书文案。
    
    如果是多个框架，请提取各框架的优点进行有机融合。例如：
    - "爆款引流" 侧重标题和开头
    - "干货教程" 侧重正文逻辑
    - "种草推荐" 侧重产品价值点

    注意：正文内容请控制在 500 字以内，避免生成过长导致超时。
    
    请直接输出文案内容，包括：
    1. 标题（带 Emoji）
    2. 正文（分段清晰，语气亲切）
    3. 标签（#标签1 #标签2 #标签3）
    4. 封面及配图建议`
    
    try {
      const content = await getAIResponse(prompt)
      return { 
        data: { 
          success: true, 
          data: {
            isRawText: true,
            content: content
          } 
        } 
      }
    } catch (error) {
      return { 
        data: { 
          success: true, 
          data: {
            isRawText: true,
            content: '文案生成失败，抱歉，API 调用出现问题。'
          } 
        } 
      }
    }
  },

  /**
   * 生成质量分析
   * @param {any} content - 文案内容（现在可能是对象或字符串）
   * @param {string} frameworkId - 框架ID
   */
  async generateAnalysis(content, frameworkId) {
    const textToAnalyze = typeof content === 'string' ? content : (content.body || content.content || '')
    const prompt = `评价以下小红书文案的质量：
    
    ${textToAnalyze}
    
    所选框架：${frameworkId}
    
    请根据以下四个维度进行分析，直接输出纯文本分析结果，字数控制在 300 字以内：
    1. Hook分析（开头是否吸引人）
    2. 框架原则（是否符合所选框架）
    3. 内容结构（逻辑是否清晰）
    4. 平台适配（是否符合小红书调性）`
    
    try {
      const analysis = await getAIResponse(prompt)
      return { 
        data: { 
          success: true, 
          data: {
            isRawText: true,
            analysis: analysis
          } 
        } 
      }
    } catch (error) {
      return { 
        data: { 
          success: true, 
          data: {
            isRawText: true,
            analysis: '分析失败。'
          } 
        } 
      }
    }
  }
}

/**
 * 图片生成 API (火山引擎/申图)
 */
export const imageGenerationAPI = {
  /**
   * 生成图片
   * @param {Object} params - 生成参数
   * @param {string} params.prompt - 提示词
   * @param {string} [params.size='2K'] - 图片尺寸 (例如: 1024x1024, 2K, 4K)
   * @returns {Promise<Object>}
   */
  async generate(params) {
    const model = import.meta.env.VITE_VOLCENGINE_MODEL
    const payload = {
      model: model,
      prompt: params.prompt,
      size: params.size || '2K',
      response_format: 'url',
      sequential_image_generation: 'disabled',
      stream: false,
      watermark: true
    }

    try {
      console.log('正在调用图片生成 API, 模型:', model)
      const response = await imageClient.post('images/generations', payload)
      
      if (response.data && response.data.data && response.data.data[0]) {
        return {
          success: true,
          url: response.data.data[0].url,
          raw: response.data
        }
      } else {
        console.error('图片生成接口响应异常:', response.data)
        throw new Error('图片生成接口返回格式异常')
      }
    } catch (error) {
      console.error('图片生成失败:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  },

  /**
   * 将文案中的配图建议转化为专业的图片生成提示词
   * @param {string} content - 文案内容
   * @returns {Promise<string[]>}
   */
  async generatePrompts(content) {
    const prompt = `你是一个专业的 AI 绘画提示词工程师。请根据以下小红书文案内容，提取出最适合的 3 个配图场景，并将每个场景转化为专业、详细、具有视觉冲击力的 AI 绘画提示词（英文或中文均可，建议包含风格、光影、细节描述）。
    
    文案内容：
    ${content}
    
    要求：
    1. 提示词要非常具体，参考以下风格：
       "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影"
    2. 请直接返回 3 个提示词，每个提示词占一行。不要包含任何其他解释文字。`

    try {
      const response = await getAIResponse(prompt)
      // 按行分割并过滤掉空行
      const prompts = response.split('\n').map(p => p.trim()).filter(p => p.length > 0 && !p.match(/^\d+\./))
      // 如果 AI 返回了带编号的列表，尝试清理编号
      const cleanedPrompts = response.split('\n')
        .map(p => p.replace(/^\d+[\.、\s]+/, '').trim())
        .filter(p => p.length > 0)
        .slice(0, 3)
      
      return cleanedPrompts
    } catch (error) {
      console.error('生成图片提示词失败:', error)
      return []
    }
  }
}

export default api


