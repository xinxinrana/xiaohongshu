import { ImageService } from '../services/imageService.js'

/**
 * 文生图控制器：根据文本描述生成图像
 */
export async function generateImageFromText(req, res) {
  try {
    const { prompt, negative_prompt, size, n, prompt_extend, watermark } = req.body
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空'
      })
    }
    
    const options = {
      negative_prompt,
      size,
      n,
      prompt_extend,
      watermark
    }
    
    const result = await ImageService.generateImageFromText(prompt, options)
    
    res.json(result)
  } catch (error) {
    console.error('文生图接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 图像编辑控制器：基于原图和提示词进行编辑
 */
export async function editImage(req, res) {
  try {
    const { imageUrl, prompt, negative_prompt, watermark, seed } = req.body
    
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: '图像URL不能为空'
      })
    }
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '编辑提示词不能为空'
      })
    }
    
    const options = {
      negative_prompt,
      watermark,
      seed
    }
    
    const result = await ImageService.editImage(imageUrl, prompt, options)
    
    res.json(result)
  } catch (error) {
    console.error('图像编辑接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 图生图控制器：基于原图生成新图像
 */
export async function generateImageFromImage(req, res) {
  try {
    const { imageUrl, prompt, negative_prompt, watermark, seed } = req.body
    
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({
        success: false,
        error: '原始图像URL不能为空'
      })
    }
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '生成提示词不能为空'
      })
    }
    
    const options = {
      negative_prompt,
      watermark,
      seed
    }
    
    const result = await ImageService.generateImageFromImage(imageUrl, prompt, options)
    
    res.json(result)
  } catch (error) {
    console.error('图生图接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 查询任务状态控制器
 */
export async function queryTaskStatus(req, res) {
  try {
    const { taskId } = req.params
    
    if (!taskId || !taskId.trim()) {
      return res.status(400).json({
        success: false,
        error: '任务ID不能为空'
      })
    }
    
    const result = await ImageService.queryTaskStatus(taskId)
    
    res.json(result)
  } catch (error) {
    console.error('查询任务状态接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 多图融合生成控制器：基于多张参考图生成融合风格的新图像
 */
export async function generateMultiFusion(req, res) {
  try {
    const { prompt, imageUrls, size, resolution, watermark } = req.body
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空'
      })
    }
    
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 1) {
      return res.status(400).json({
        success: false,
        error: '至少需要1张参考图片'
      })
    }
    
    if (imageUrls.length > 14) {
      return res.status(400).json({
        success: false,
        error: '参考图片数量不能超过14张'
      })
    }
    
    const options = {
      size,
      resolution,
      watermark
    }
    
    const result = await ImageService.generateImageFromMultipleImages(prompt, imageUrls, options)
    
    res.json(result)
  } catch (error) {
    console.error('多图融合接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 批量图像生成控制器：生成多张图像
 */
export async function generateBatchImages(req, res) {
  try {
    const { prompt, referenceImages, max_images, size, resolution, watermark, negative_prompt } = req.body
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空'
      })
    }
    
    const count = max_images || 1
    if (count < 1 || count > 15) {
      return res.status(400).json({
        success: false,
        error: '生成数量必须在1-15之间'
      })
    }
    
    const options = {
      max_images: count,
      size,
      resolution,
      watermark,
      negative_prompt
    }
    
    const result = await ImageService.generateBatchImages(prompt, referenceImages || [], options)
    
    res.json(result)
  } catch (error) {
    console.error('批量生成接口错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

/**
 * 流式图像生成控制器：支持SSE实时返回生成进度
 */
export async function generateWithStreaming(req, res) {
  try {
    const { prompt, size, watermark, referenceImage } = req.body
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空'
      })
    }
    
    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    
    const options = {
      size,
      watermark,
      referenceImage
    }
    
    // 流式回调函数
    const streamCallback = (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
    
    const result = await ImageService.generateImageWithStream(prompt, options, streamCallback)
    
    // 发送最终结果
    res.write(`data: ${JSON.stringify({ type: 'done', result })}\n\n`)
    res.end()
  } catch (error) {
    console.error('流式生成接口错误:', error)
    // 发送错误事件
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
    res.end()
  }
}

/**
 * 获取支持的配置信息
 */
export async function getSupportedConfig(req, res) {
  try {
    res.json({
      success: true,
      data: {
        sizes: ImageService.getSupportedSizes(),
        resolutions: ImageService.getSupportedResolutions(),
        limits: {
          max_images: 15,
          max_reference_images: 5,
          max_fusion_images: 14,
          max_file_size_mb: 10
        }
      }
    })
  } catch (error) {
    console.error('获取配置信息错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
