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
