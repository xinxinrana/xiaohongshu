




import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 180000 // 3分钟超时（图像生成需要轮询60秒）
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
  timeout: 120000 // 增加到 120 秒，防止生成复杂提示词时超时
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
  timeout: 120000 // 增加到 120 秒，图片生成和 AI 复杂推理可能需要更长时间
})

/**
 * 知识库 API
 */
export const knowledgeAPI = {
  /**
   * 获取所有知识库条目
   */
  async getAll() {
    const data = localStorage.getItem('xhs_knowledge_base')
    return {
      success: true,
      data: data ? JSON.parse(data) : []
    }
  },

  /**
   * 保存知识库条目
   */
  async save(items) {
    localStorage.setItem('xhs_knowledge_base', JSON.stringify(items))
    return { success: true }
  },

  /**
   * 添加单个条目
   */
  async add(item) {
    const { data: items } = await this.getAll()
    items.push({
      id: Date.now().toString(),
      ...item,
      createdAt: new Date().toISOString()
    })
    await this.save(items)
    return { success: true }
  },

  /**
   * 删除单个条目
   */
  async delete(id) {
    const { data: items } = await this.getAll()
    const filtered = items.filter(item => item.id !== id)
    await this.save(filtered)
    return { success: true }
  }
}

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
      { 
        role: 'system', 
        content: `你是一个专业的小红书文案专家。
你的任务是根据用户提供的关键词或要求，直接生成一篇高质量的小红书文案。

要求：
1. **只返回文案正文内容**，不要包含标题、不要包含任何解释性文字、不要包含建议的图片描述、不要包含元数据。
2. 文案应包含吸引人的开头、有价值的正文内容、自然的互动引导以及相关的标签。
3. 严格遵守 Markdown 格式，可以使用列表、引用等语法增加可读性。**严禁使用加粗语法（如 **文本**）**，因为小红书平台不支持。
4. 不要出现类似 "这是为您生成的文案" 或 "图片建议：" 这样的废话。`
      },
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
    const prompt = `请针对关键词 "${keywords}"，模拟该行业顶级博主的创作风格，直接生成一篇爆款小红书文案。
    
    要求：
    1. 风格要极具吸引力，能够引起目标受众取得共鸣。
    2. 使用 Markdown 格式美化排版（如：使用 Emoji、清晰的分段、列表等）。**严禁使用加粗语法**。
    3. **严禁**输出任何关于图片的建议或描述词，这些工作将由其他系统完成。
    4. **严禁**输出任何开场白或结束语（如 "好的，为您生成如下："）。
    5. 直接输出文案内容本身。`
    
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
    const prompt = `作为小红书达人，根据关键词 "${keywords}" 和指定的框架 "${frameworkId}"，创作一篇爆款文案。
    
    要求：
    1. 提取框架的核心价值点。
    2. 使用 Markdown 格式美化排版（如：Emoji、分段、列表），但**严禁使用加粗语法**。
    3. **严禁**输出任何图片建议、前导说明或元数据。
    4. 直接输出文案正文。`
    
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
   * @param {string} [params.size='1440x2560'] - 图片尺寸 (必须满足像素下限 3686400)
   * @returns {Promise<Object>}
   */
  async generate(params) {
    const model = import.meta.env.VITE_VOLCENGINE_MODEL
    const payload = {
      model: model,
      prompt: params.prompt,
      size: params.size || '1440x2560',
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
    console.log('--- 开始生成图片提示词 ---')
    console.log('输入文案长度:', content?.length)
    
    const prompt = `你是一个专业的 AI 绘画提示词工程师。请根据以下小红书文案内容，提取出最适合的 3 个配图场景，并将每个场景转化为专业、详细、具有视觉冲击力的 AI 绘画提示词（英文或中文均可，建议包含风格、光影、细节描述）。
    
    文案内容：
    ${content}
    
    要求：
    1. 提示词要非常具体，参考以下风格：
       "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影"
    2. 请直接返回 3 个提示词，每个提示词占一行。不要包含任何其他解释文字。`

    try {
      const response = await getAIResponse(prompt)
      console.log('AI 返回的原始提示词响应:', response)
      
      // 如果 AI 返回了带编号的列表，尝试清理编号
      const cleanedPrompts = response.split('\n')
        .map(p => p.trim())
        .map(p => p.replace(/^\d+[\.、\s]+/, '').trim())
        .filter(p => p.length > 0)
        .slice(0, 3)
      
      console.log('解析后的提示词列表:', cleanedPrompts)
      return cleanedPrompts
    } catch (error) {
      console.error('生成图片提示词失败，详细错误:', error)
      return []
    }
  }
}

/**
 * 增强版工作流 API
 */
export const enhancedAPI = {
  /**
   * 阶段1：生成文案（第1次AI调用）
   * @param {string} keywords - 关键词
   * @param {string} userMessage - 用户对话内容
   * @param {string} uploadedImageUrl - 用户上传的图片URL
   * @param {Function} onStream - 流式回调（可选）
   */
  async generateContent(keywords, userMessage, uploadedImageUrl = null, onStream = null) {
    try {
      if (onStream) {
        // 流式生成（直接调用GLM API）
        const prompt = `你是一个专业的小红书内容创作专家。请根据以下信息创作一篇高质量的小红书图文内容。

用户关键词：${keywords}
用户对话内容：${userMessage}
${uploadedImageUrl ? `用户还上传了参考图片：${uploadedImageUrl}` : ''}

要求：
1. 创作一篇符合小红书平台调性的爆款文案
2. 文案要有吸引人的标题和正文内容
3. 使用 Emoji、分段、列表等增强可读性，但**严禁使用加粗语法**
4. 直接输出文案内容，不要包含任何元数据或说明性文字
5. 字数控制在300-500字之间
6. 添加3-5个相关话题标签

请直接返回文案内容：`
        
        const content = await getAIResponse(prompt, { onStream })
        return {
          data: {
            success: true,
            content: content
          }
        }
      } else {
        // 非流式生成（调用后端API）
        const response = await api.post('/enhanced/generate-content', {
          keywords,
          userMessage,
          uploadedImageUrl
        })
        return { data: response.data }
      }
    } catch (error) {
      console.error('增强版文案生成失败:', error)
      throw error
    }
  },

  /**
   * 阶段1：生成图像提示词（第2次AI调用）
   * @param {string} content - 生成的文案内容
   * @param {string} uploadedImageUrl - 用户上传的原始图片URL
   */
  async generatePrompts(content, uploadedImageUrl = null) {
    try {
      const response = await api.post('/enhanced/generate-prompts', {
        content,
        uploadedImageUrl
      })
      return { data: response.data }
    } catch (error) {
      console.error('提示词生成失败:', error)
      throw error
    }
  },

  /**
   * 阶段1：生成配图（图像生成）
   * @param {Array<string>} prompts - 3个提示词
   * @param {string} uploadedImageUrl - 用户上传的原始图片URL
   */
  async generateImages(prompts, uploadedImageUrl = null) {
    try {
      const response = await api.post('/enhanced/generate-images', {
        prompts,
        uploadedImageUrl
      })
      return { data: response.data }
    } catch (error) {
      console.error('图像生成失败:', error)
      throw error
    }
  },

  /**
   * 阶段3：编辑文案（第3次AI调用）
   * @param {string} originalContent - 原始文案
   * @param {string} userFeedback - 用户修改想法
   * @param {Function} onStream - 流式回调（可选）
   */
  async editContent(originalContent, userFeedback, onStream = null) {
    try {
      if (onStream) {
        const prompt = `你是一个专业的小红书内容编辑专家。用户对当前文案提出了修改意见，请根据用户的反馈重新优化文案。

【原始文案】
${originalContent}

【用户修改意见】
${userFeedback}

要求：
1. 根据用户反馈调整文案内容和风格
2. 保持小红书平台调性和爆款特征
3. 使用 Emoji、分段、列表等增强可读性，但**严禁使用加粗语法**
4. 直接输出修改后的文案，不要包含说明性文字
5. 字数控制在300-500字之间

请直接返回修改后的文案：`
        
        const content = await getAIResponse(prompt, { onStream })
        return {
          data: {
            success: true,
            content: content
          }
        }
      } else {
        const response = await api.post('/enhanced/edit-content', {
          originalContent,
          userFeedback
        })
        return { data: response.data }
      }
    } catch (error) {
      console.error('文案编辑失败:', error)
      throw error
    }
  },

  /**
   * 阶段3：优化提示词（第4次AI调用）
   * @param {Array<string>} originalPrompts - 原始提示词
   * @param {string} userImageFeedback - 用户对图片的修改想法
   * @param {string} referenceImageUrl - 用户上传的新参考图
   */
  async optimizePrompts(originalPrompts, userImageFeedback, referenceImageUrl = null) {
    try {
      const response = await api.post('/enhanced/optimize-prompts', {
        originalPrompts,
        userImageFeedback,
        referenceImageUrl
      })
      return { data: response.data }
    } catch (error) {
      console.error('提示词优化失败:', error)
      throw error
    }
  },

  /**
   * 阶段3：编辑图像
   * @param {Array<string>} optimizedPrompts - 优化后的提示词
   * @param {string} referenceImageUrl - 参考图片URL
   */
  async editImages(optimizedPrompts, referenceImageUrl = null) {
    try {
      const response = await api.post('/enhanced/edit-images', {
        optimizedPrompts,
        referenceImageUrl
      })
      return { data: response.data }
    } catch (error) {
      console.error('图像编辑失败:', error)
      throw error
    }
  },

  /**
   * 阶5：生成最终质量分析（支持流式输出）
   * @param {string} content - 最终文案内容
   * @param {Function} onStream - 流式回调（可选）
   */
  async generateFinalAnalysis(content, onStream = null) {
    try {
      if (onStream) {
        // 流式生成（直接调用 AI API）
        const prompt = `你是一个专业的小红书内容质量分析专家。请对以下文案进行全方位的质量分析。

【文案内容】
${content}

请从以下四个维度进行简洁分析：

1. **Hook分析**：开头类型、有效性评分(1-10)、原因
2. **框架分析**：识别框架类型、框架优势
3. **结构分析**：逻辑流畅度、互动引导、优化建议
4. **平台适配**：情感感染力/实用价值/行动引导评分(1-10)

请以清晰的分段文本格式返回，字数控制在300字内：`

        const analysis = await getAIResponse(prompt, { onStream })
        return {
          data: {
            success: true,
            analysis: analysis
          }
        }
      } else {
        // 非流式生成（调用后端 API）
        const response = await api.post('/enhanced/final-analysis', {
          content
        })
        return { data: response.data }
      }
    } catch (error) {
      console.error('质量分析生成失败:', error)
      throw error
    }
  },

  /**
   * 一键完整流程（用于测试）
   */
  async fullProcess(keywords, userMessage, uploadedImageUrl = null) {
    try {
      const response = await api.post('/enhanced/full-process', {
        keywords,
        userMessage,
        uploadedImageUrl
      })
      return { data: response.data }
    } catch (error) {
      console.error('完整流程执行失败:', error)
      throw error
    }
  }
}

export default api


