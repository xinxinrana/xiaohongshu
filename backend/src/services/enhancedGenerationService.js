import { callAI } from './aiService.js'
import { ImageService } from './imageService.js'

/**
 * 增强版内容生成服务
 * 支持文案生成、提示词工程、图像生成、内容修改的完整工作流
 */
export class EnhancedGenerationService {
  /**
   * 第1次AI调用：生成文案内容
   * @param {string} keywords - 用户输入的关键词
   * @param {string} userMessage - 用户对话内容
   * @param {string} uploadedImageUrl - 用户上传的图片URL（可选）
   * @returns {Promise<Object>} 生成的文案内容
   */
  static async generateContent(keywords, userMessage, uploadedImageUrl = null) {
    try {
      // 注意：uploadedImageUrl 可能是 Base64 数据，不应发送给文本 AI，只标记有参考图即可
      const hasReferenceImage = !!uploadedImageUrl
      let prompt = `你是一个专业的小红书内容创作专家。请根据以下信息创作一篇高质量的小红书图文内容。

用户关键词：${keywords}
用户对话内容：${userMessage}
${hasReferenceImage ? `用户上传了一张参考图片，请根据关键词创作能与图片风格相配的文案。` : ''}

要求：
1. 创作一篇符合小红书平台调性的爆款文案
2. 文案要有吸引人的标题和正文内容
3. 使用 Emoji、分段、列表等增强可读性，但**严禁使用加粗语法**
4. 直接输出文案内容，不要包含任何元数据或说明性文字
5. 字数控制在300-500字之间
6. 添加3-5个相关话题标签

请直接返回文案内容：`

      const content = await callAI(prompt)
      
      return {
        success: true,
        content: content,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('增强版文案生成失败:', error)
      throw new Error(`文案生成失败: ${error.message}`)
    }
  }

  /**
   * 第2次AI调用：提示词工程 - 生成3个配图提示词
   * @param {string} content - 生成的文案内容
   * @param {string} uploadedImageUrl - 用户上传的原始图片URL（可选）
   * @returns {Promise<Array<string>>} 3个提示词数组
   */
  static async generateImagePrompts(content, uploadedImageUrl = null) {
    try {
      // 注意：uploadedImageUrl 可能是 Base64 数据（很大），不应发送给文本 AI
      // 只需标记有参考图，让 AI 生成通用风格的提示词，实际图生图时再使用 Base64 数据
      const hasReferenceImage = !!uploadedImageUrl
      let prompt = `你是一个专业的 AI 绘画提示词工程师。请根据以下小红书文案内容，提取出最适合的 3 个配图场景，并将每个场景转化为专业、详细、具有视觉冲击力的 AI 绘画提示词。

文案内容：
${content}

${hasReferenceImage ? `用户上传了参考图片，请生成能够与参考图风格相呼应的提示词。\n` : ''}

要求：
1. 提示词要非常具体、详细，包含风格、光影、色彩、构图等元素
2. 每个提示词应独立成篇，能够生成完整的配图
3. 提示词要符合 Doubao-Seedream-4.0 模型的输入规范
4. 3个提示词应该互补，覆盖文案的不同内容维度
5. 参考风格示例："星际穿越，黑洞，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义"

请直接返回3个提示词，每个提示词占一行，不要编号，不要其他说明：`

      const response = await callAI(prompt)
      
      // 解析返回的提示词
      const prompts = response.split('\n')
        .map(p => p.trim())
        .map(p => p.replace(/^\d+[\.、\s]+/, '').trim())  // 移除可能的编号
        .filter(p => p.length > 0)
        .slice(0, 3)  // 确保只取前3个
      
      if (prompts.length < 3) {
        console.warn('AI返回的提示词不足3个，进行填充')
        while (prompts.length < 3) {
          prompts.push('小红书风格，时尚，清新，自然光，高清细节，专业摄影')
        }
      }
      
      return {
        success: true,
        prompts: prompts
      }
    } catch (error) {
      console.error('提示词生成失败:', error)
      throw new Error(`提示词生成失败: ${error.message}`)
    }
  }

  /**
   * 图像生成：调用 Doubao-Seedream-4.5 生成配图
   * @param {Array<string>} prompts - 提示词数组
   * @param {Object} options - 生成选项
   * @param {string|string[]} options.uploadedImages - 参考图URL数组或单个URL
   * @param {string} options.size - 图像尺寸
   * @param {number} options.count - 生成数量
   * @param {string} options.quality - 清晰度
   * @param {boolean} options.enableSlogan - 是否启用广告标语
   * @param {Object} options.sloganConfig - 标语配置
   * @returns {Promise<Object>} 图片URL数组
   */
  static async generateImages(prompts, options = {}) {
    try {
      // 兼容旧接口：如果第二个参数是字符串，转换为options格式
      if (typeof options === 'string') {
        options = { uploadedImages: options ? [options] : [] }
      }
      
      const {
        uploadedImages = [],
        size = '1440x2560',
        count,
        quality = '2K',
        enableSlogan = false,
        sloganConfig = {}
      } = options
      
      // 标准化uploadedImages为数组
      const imageUrls = Array.isArray(uploadedImages) 
        ? uploadedImages 
        : (uploadedImages ? [uploadedImages] : [])
      
      const hasReferenceImage = imageUrls.length > 0
      const mainReferenceImage = imageUrls[0] || null
      
      // 确定实际生成数量
      const actualCount = count || prompts.length || 3
      const promptsToUse = prompts.slice(0, actualCount)
      
      // 如果提示词不够，复制最后一个
      while (promptsToUse.length < actualCount) {
        promptsToUse.push(promptsToUse[promptsToUse.length - 1] || '小红书风格，时尚，清新')
      }
      
      const generatedUrls = []
      
      for (let i = 0; i < promptsToUse.length; i++) {
        let prompt = promptsToUse[i]
        
        // 如果启用广告标语，增强提示词
        if (enableSlogan && sloganConfig.text) {
          prompt = this.buildSloganPrompt(prompt, sloganConfig)
        }
        
        try {
          let result
          
          if (hasReferenceImage) {
            // 图生图模式
            result = await ImageService.generateImageFromImage(mainReferenceImage, prompt, {
              size: size,
              watermark: false
            })
          } else {
            // 文生图模式
            result = await ImageService.generateImageFromText(prompt, {
              size: size,
              watermark: false,
              prompt_extend: true
            })
          }
          
          if (result.success && result.data) {
            const taskData = result.data.data || {}
            const imageUrl = taskData.data?.image_urls?.[0]
            
            if (imageUrl) {
              generatedUrls.push(imageUrl)
            }
          }
        } catch (error) {
          console.error(`[图像生成] 第${i + 1}张生成失败:`, error.message)
          // 继续尝试生成其他图片
        }
      }
      
      return {
        success: generatedUrls.length > 0,
        images: generatedUrls,
        count: generatedUrls.length,
        requested: promptsToUse.length
      }
    } catch (error) {
      console.error('图像生成失败:', error)
      throw new Error(`图像生成失败: ${error.message}`)
    }
  }

  /**
   * 构建广告标语增强提示词
   * @param {string} basePrompt - 基础提示词
   * @param {Object} sloganConfig - 标语配置
   * @returns {string} 增强后的提示词
   */
  static buildSloganPrompt(basePrompt, sloganConfig) {
    if (!sloganConfig || !sloganConfig.text) {
      return basePrompt
    }
    
    const {
      text,
      fontStyle = '粗体现代',
      color = '高对比色',
      position = '上方居中',
      layout = '单行横排'
    } = sloganConfig
    
    // 根据样式预设调整参数
    const stylePresets = {
      xiaohongshu: { fontStyle: '粗体圆润', color: '白色带阴影', position: '上方三分之一', layout: '居中横排' },
      ecommerce: { fontStyle: '粗体冲击', color: '红色/黄色', position: '居中偏上', layout: '大号单行' },
      brand: { fontStyle: '优雅衬线', color: '金色/深色', position: '下方三分之一', layout: '居中多行' },
      minimal: { fontStyle: '细体现代', color: '黑色/白色', position: '居中', layout: '大号单行' }
    }
    
    const preset = stylePresets[sloganConfig.style] || {}
    const finalFontStyle = preset.fontStyle || fontStyle
    const finalColor = preset.color || color
    const finalPosition = preset.position || position
    const finalLayout = preset.layout || layout
    
    const textInstruction = `
【文字渲染需求】
- 在图像中清晰呈现文字："${text}"
- 文字风格：${finalFontStyle}，专业设计感
- 文字颜色：${finalColor}，与背景形成鲜明对比
- 文字位置：${finalPosition}
- 文字排版：${finalLayout}，字号醒目易读
- 整体要求：文字与画面和谐融合，具有商业广告效果，文字清晰可辨认`
    
    return `${basePrompt}\n${textInstruction}`
  }

  /**
   * 轮询查询任务状态直到完成
   * @param {string} taskId - 任务ID
   * @param {number} maxAttempts - 最大尝试次数
   * @param {number} interval - 轮询间隔（毫秒）
   * @returns {Promise<string|null>} 图片URL或null
   */
  static async pollTaskStatus(taskId, maxAttempts = 30, interval = 2000) {
    // 火山引擎API是同步返回的，不需要轮询
    // 但保留这个方法以兼容现有逻辑
    console.log('[轮询任务] 火山引擎API是同步返回，无需轮询，taskId:', taskId)
    
    try {
      const statusResult = await ImageService.queryTaskStatus(taskId)
      
      if (statusResult.success && statusResult.data) {
        const taskData = statusResult.data.data?.data || {}
        const imageUrls = taskData.image_urls || []
        
        if (imageUrls.length > 0) {
          return imageUrls[0]
        }
      }
      return null
    } catch (error) {
      console.error('[轮询任务] 查询失败:', error)
      return null
    }
  }

  /**
   * 第3次AI调用：文案编辑 - 根据用户修改意见重新生成文案
   * @param {string} originalContent - 原始文案内容
   * @param {string} userFeedback - 用户的修改想法
   * @returns {Promise<Object>} 修改后的文案内容
   */
  static async editContent(originalContent, userFeedback) {
    try {
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

      const content = await callAI(prompt)
      
      return {
        success: true,
        content: content,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('文案编辑失败:', error)
      throw new Error(`文案编辑失败: ${error.message}`)
    }
  }

  /**
   * 第4次AI调用：优化提示词 - 根据用户对图片的修改意见重新生成提示词
   * @param {Array<string>} originalPrompts - 原始提示词数组
   * @param {string} userImageFeedback - 用户对图片的修改想法
   * @param {string} referenceImageUrl - 用户上传的新参考图（可选）
   * @returns {Promise<Array<string>>} 3个新提示词
   */
  static async optimizeImagePrompts(originalPrompts, userImageFeedback, referenceImageUrl = null) {
    try {
      // 注意：referenceImageUrl 可能是 Base64 数据，不应发送给文本 AI
      // 只需标记有参考图，实际图生图时再使用 Base64 数据
      const hasReferenceImage = !!referenceImageUrl
      const prompt = `你是一个专业的 AI 绘画提示词优化工程师。用户对当前的配图提出了修改意见，请根据用户反馈优化提示词。

【原始提示词】
1. ${originalPrompts[0] || ''}
2. ${originalPrompts[1] || ''}
3. ${originalPrompts[2] || ''}

【用户修改意见】
${userImageFeedback}

${hasReferenceImage ? `用户上传了新的参考图片，请生成能够与参考图风格相呼应的提示词。\n` : ''}

要求：
1. 根据用户反馈调整提示词的风格、色彩、构图等要素
2. 保持提示词的专业性和详细度
3. 3个提示词应该互补，满足用户的修改需求
4. 提示词要符合 Doubao-Seedream-4.0 模型规范

请直接返回3个优化后的提示词，每个提示词占一行，不要编号：`

      const response = await callAI(prompt)
      
      // 解析返回的提示词
      const prompts = response.split('\n')
        .map(p => p.trim())
        .map(p => p.replace(/^\d+[\.、\s]+/, '').trim())
        .filter(p => p.length > 0)
        .slice(0, 3)
      
      if (prompts.length < 3) {
        console.warn('AI返回的优化提示词不足3个，使用原提示词填充')
        while (prompts.length < 3) {
          prompts.push(originalPrompts[prompts.length] || '小红书风格，时尚，清新')
        }
      }
      
      return {
        success: true,
        prompts: prompts
      }
    } catch (error) {
      console.error('提示词优化失败:', error)
      throw new Error(`提示词优化失败: ${error.message}`)
    }
  }

  /**
   * 图像编辑：根据优化后的提示词和参考图重新生成图片
   * @param {Array<string>} optimizedPrompts - 优化后的提示词
   * @param {Object} options - 生成选项（支持多图、尺寸等）
   * @returns {Promise<Object>} 新图片URL数组
   */
  static async editImages(optimizedPrompts, options = {}) {
    try {
      // 兼容旧接口
      if (typeof options === 'string') {
        options = { uploadedImages: options ? [options] : [] }
      }
      return await this.generateImages(optimizedPrompts, options)
    } catch (error) {
      console.error('图像编辑失败:', error)
      throw new Error(`图像编辑失败: ${error.message}`)
    }
  }

  /**
   * 最终质量分析：用户满意后生成完整的质量分析报告
   * @param {string} content - 最终文案内容
   * @returns {Promise<Object>} 质量分析报告
   */
  static async generateFinalAnalysis(content) {
    try {
      const prompt = `你是一个专业的小红书内容质量分析专家。请对以下文案进行全方位的质量分析。

【文案内容】
${content}

请从以下四个维度进行详细分析，并以结构化的方式返回：

1. **Hook分析**（开头吸引力）
   - 开头类型（悬念提问/痛点直击/猎奇揭秘/直接切入）
   - 有效性评分（1-10分）
   - 有效原因分析

2. **框架分析**（内容框架）
   - 识别使用的框架类型
   - 框架优势列举（3-5点）
   - 为什么这个框架有效

3. **结构分析**（内容结构）
   - 逻辑流畅度（是/否）
   - 互动引导（是/否）
   - 结构优化建议

4. **平台适配**（小红书适配度）
   - 情感感染力评分（1-10分）
   - 实用价值评分（1-10分）
   - 行动引导评分（1-10分）
   - 综合评价
   - 评价理由

请以清晰的分段文本格式返回分析结果：`

      const analysis = await callAI(prompt)
      
      return {
        success: true,
        analysis: analysis,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('质量分析生成失败:', error)
      throw new Error(`质量分析失败: ${error.message}`)
    }
  }
}
