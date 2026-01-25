import { EnhancedGenerationService } from '../services/enhancedGenerationService.js'

/**
 * 增强版工作流控制器
 * 提供完整的增强版内容生成API接口
 */

/**
 * 阶段1：初始生成 - 文案生成
 * POST /api/enhanced/generate-content
 */
export async function generateContent(req, res) {
  try {
    const { keywords, userMessage, uploadedImageUrl } = req.body
    
    if (!keywords && !userMessage) {
      return res.status(400).json({
        success: false,
        error: '关键词或对话内容至少需要提供一个'
      })
    }
    
    const result = await EnhancedGenerationService.generateContent(
      keywords || '',
      userMessage || '',
      uploadedImageUrl || null
    )
    
    res.json(result)
  } catch (error) {
    console.error('文案生成失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段1：初始生成 - 提示词生成
 * POST /api/enhanced/generate-prompts
 */
export async function generatePrompts(req, res) {
  try {
    const { content, uploadedImageUrl } = req.body
    
    console.log('[接收到提示词生成请求] content长度:', content?.length, 'uploadedImageUrl:', uploadedImageUrl)
    
    if (!content) {
      console.error('提示词生成失败: 文案内容为空')
      return res.status(400).json({
        success: false,
        error: '文案内容不能为空'
      })
    }
    
    console.log('开始调用服务层生成提示词...')
    const result = await EnhancedGenerationService.generateImagePrompts(
      content,
      uploadedImageUrl || null
    )
    
    console.log('[提示词生成成功]', result)
    res.json(result)
  } catch (error) {
    console.error('[提示词生成失败]', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段1：初始生成 - 图像生成
 * POST /api/enhanced/generate-images
 */
export async function generateImages(req, res) {
  try {
    const { 
      prompts, 
      uploadedImageUrl,
      uploadedImages,
      size,
      count,
      quality,
      negativePrompt,
      enableSlogan,
      sloganConfig
    } = req.body
    
    console.log('[接收到图像生成请求] prompts数量:', prompts?.length)
    
    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      console.error('图像生成失败: 提示词数组为空')
      return res.status(400).json({
        success: false,
        error: '提示词数组不能为空'
      })
    }
    
    // 构建选项对象
    const options = {
      uploadedImages: uploadedImages || (uploadedImageUrl ? [uploadedImageUrl] : []),
      size: size || '1440x2560',
      count: count,
      quality: quality || '2K',
      enableSlogan: enableSlogan || false,
      sloganConfig: sloganConfig || {}
    }
    
    console.log('开始调用服务层生成图像...')
    const result = await EnhancedGenerationService.generateImages(prompts, options)
    
    console.log('[图像生成完成]', result)
    res.json(result)
  } catch (error) {
    console.error('[图像生成失败]', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段3：修改模式 - 文案编辑
 * POST /api/enhanced/edit-content
 */
export async function editContent(req, res) {
  try {
    const { originalContent, userFeedback } = req.body
    
    if (!originalContent || !userFeedback) {
      return res.status(400).json({
        success: false,
        error: '原始文案和用户反馈都不能为空'
      })
    }
    
    const result = await EnhancedGenerationService.editContent(
      originalContent,
      userFeedback
    )
    
    res.json(result)
  } catch (error) {
    console.error('文案编辑失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段3：修改模式 - 提示词优化
 * POST /api/enhanced/optimize-prompts
 */
export async function optimizePrompts(req, res) {
  try {
    const { originalPrompts, userImageFeedback, referenceImageUrl } = req.body
    
    if (!originalPrompts || !Array.isArray(originalPrompts) || !userImageFeedback) {
      return res.status(400).json({
        success: false,
        error: '原始提示词和用户反馈都不能为空'
      })
    }
    
    const result = await EnhancedGenerationService.optimizeImagePrompts(
      originalPrompts,
      userImageFeedback,
      referenceImageUrl || null
    )
    
    res.json(result)
  } catch (error) {
    console.error('提示词优化失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段3：修改模式 - 图像编辑
 * POST /api/enhanced/edit-images
 */
export async function editImages(req, res) {
  try {
    const { 
      optimizedPrompts, 
      referenceImageUrl,
      referenceImages,
      size,
      count,
      quality,
      enableSlogan,
      sloganConfig
    } = req.body
    
    if (!optimizedPrompts || !Array.isArray(optimizedPrompts) || optimizedPrompts.length === 0) {
      return res.status(400).json({
        success: false,
        error: '优化后的提示词数组不能为空'
      })
    }
    
    // 构建选项对象
    const options = {
      uploadedImages: referenceImages || (referenceImageUrl ? [referenceImageUrl] : []),
      size: size || '1440x2560',
      count: count,
      quality: quality || '2K',
      enableSlogan: enableSlogan || false,
      sloganConfig: sloganConfig || {}
    }
    
    const result = await EnhancedGenerationService.editImages(optimizedPrompts, options)
    
    res.json(result)
  } catch (error) {
    console.error('图像编辑失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 阶段5：最终质量分析
 * POST /api/enhanced/final-analysis
 */
export async function generateFinalAnalysis(req, res) {
  try {
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '文案内容不能为空'
      })
    }
    
    const result = await EnhancedGenerationService.generateFinalAnalysis(content)
    
    res.json(result)
  } catch (error) {
    console.error('质量分析生成失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 一键完整流程（适用于测试）
 * POST /api/enhanced/full-process
 */
export async function fullProcess(req, res) {
  try {
    const { keywords, userMessage, uploadedImageUrl } = req.body
    
    // 第1步：生成文案
    const contentResult = await EnhancedGenerationService.generateContent(
      keywords || '',
      userMessage || '',
      uploadedImageUrl || null
    )
    
    // 第2步：生成提示词
    const promptsResult = await EnhancedGenerationService.generateImagePrompts(
      contentResult.content,
      uploadedImageUrl || null
    )
    
    // 第3步：生成图像
    const imagesResult = await EnhancedGenerationService.generateImages(
      promptsResult.prompts,
      uploadedImageUrl || null
    )
    
    res.json({
      success: true,
      data: {
        content: contentResult.content,
        prompts: promptsResult.prompts,
        images: imagesResult.images
      }
    })
  } catch (error) {
    console.error('完整流程执行失败:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
