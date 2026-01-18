import axios from 'axios'

// 胜算云图像生成API配置
const IMAGE_API_CONFIG = {
  baseURL: 'https://router.shengsuanyun.com/api/v1/tasks/generations',
  apiKey: 'bwB5DvCog7vcdM29PFdKovFFjdqlPzfM-_QNJmOx9UOJdhs2FdysHzpTQWF4OhhRFqSyyJqH7s-zKg',
  // 系统实际使用的模型
  imageGenerationModel: 'bytedance/doubao-seedream-4.0',
  imageEditModel: 'bytedance/doubao-seedream-4.0',
  defaultSize: '1664x928',
  timeout: 60000,
  imageEditTimeout: 180000  // 图生图需要更长超时（Base64数据大）
}

/**
 * 图像服务类 - 提供文生图、图生图和图像编辑功能
 */
export class ImageService {
  /**
   * 文生图：根据文本描述生成图像
   * @param {string} prompt - 图像描述提示词
   * @param {Object} options - 可选参数
   * @param {string} options.negative_prompt - 负面提示词（描述不希望出现的内容）
   * @param {string} options.size - 图像尺寸（默认：1664*928）
   * @param {number} options.n - 生成图片数量（默认：1）
   * @param {boolean} options.prompt_extend - 是否扩展提示词（默认：true）
   * @param {boolean} options.watermark - 是否添加水印（默认：false）
   * @returns {Promise<Object>} 返回任务信息
   */
  static async generateImageFromText(prompt, options = {}) {
    try {
      const payload = {
        model: IMAGE_API_CONFIG.imageGenerationModel,
        prompt: prompt,
        negative_prompt: options.negative_prompt || '低分辨率、错误、最差质量、低质量、残缺、多余的手指、比例不良',
        size: options.size || IMAGE_API_CONFIG.defaultSize,
        n: options.n || 1,
        prompt_extend: options.prompt_extend !== undefined ? options.prompt_extend : true,
        watermark: options.watermark || false
      }

      const response = await axios.post(
        IMAGE_API_CONFIG.baseURL,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.timeout
        }
      )

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('文生图失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`图像生成失败: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * 图像编辑：基于原图和提示词进行编辑
   * @param {string} imageUrl - 原始图像URL
   * @param {string} prompt - 编辑指令提示词
   * @param {Object} options - 可选参数
   * @param {string} options.negative_prompt - 负面提示词
   * @param {boolean} options.watermark - 是否添加水印（默认：false）
   * @param {number} options.seed - 随机种子（用于复现结果）
   * @returns {Promise<Object>} 返回任务信息
   */
  static async editImage(imageUrl, prompt, options = {}) {
    try {
      if (!imageUrl || !imageUrl.trim()) {
        throw new Error('图像URL不能为空')
      }

      if (!prompt || !prompt.trim()) {
        throw new Error('编辑提示词不能为空')
      }

      const payload = {
        model: IMAGE_API_CONFIG.imageEditModel,
        prompt: prompt,
        image: imageUrl,
        negative_prompt: options.negative_prompt || '',
        watermark: options.watermark || false,
        seed: options.seed || 1
      }

      const response = await axios.post(
        IMAGE_API_CONFIG.baseURL,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.timeout
        }
      )

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('图像编辑失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`图像编辑失败: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * 图生图：基于原图生成新图像（通过编辑实现）
   * @param {string} imageUrl - 原始图像URL或Base64
   * @param {string} prompt - 生成新图像的提示词
   * @param {Object} options - 可选参数
   * @param {string} options.negative_prompt - 负面提示词
   * @param {boolean} options.watermark - 是否添加水印（默认：false）
   * @param {number} options.seed - 随机种子
   * @returns {Promise<Object>} 返回任务信息
   */
  static async generateImageFromImage(imageUrl, prompt, options = {}) {
    try {
      if (!imageUrl || !imageUrl.trim()) {
        throw new Error('原始图像URL不能为空')
      }
  
      if (!prompt || !prompt.trim()) {
        throw new Error('生成提示词不能为空')
      }
  
      // 检查Base64数据大小，防止过大导致崩溃
      const isBase64 = imageUrl.startsWith('data:')
      if (isBase64) {
        const base64Size = imageUrl.length * 0.75 / 1024 / 1024  // 估算MB
        console.log(`[图生图] Base64数据大小约: ${base64Size.toFixed(2)}MB`)
        if (base64Size > 10) {
          throw new Error('图片过大，请使用小于10MB的图片')
        }
      }
  
      // 图生图实际上是使用图像编辑功能
      const payload = {
        model: IMAGE_API_CONFIG.imageEditModel,
        prompt: `基于这张图片，${prompt}`,
        image: imageUrl,
        negative_prompt: options.negative_prompt || '低分辨率、错误、最差质量、低质量、残缺、多余的手指、比例不良',
        watermark: options.watermark || false,
        seed: options.seed || 1
      }
  
      console.log('[图生图] 正在发送请求...')
      const response = await axios.post(
        IMAGE_API_CONFIG.baseURL,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.imageEditTimeout,  // 使用更长的超时
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )
  
      console.log('[图生图] 请求成功')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('图生图失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      // 返回错误而不是抛出，防止崩溃
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
  }

  /**
   * 查询任务状态（通用方法）
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object>} 返回任务状态信息
   */
  static async queryTaskStatus(taskId) {
    try {
      if (!taskId || !taskId.trim()) {
        throw new Error('任务ID不能为空')
      }

      const response = await axios.get(
        `${IMAGE_API_CONFIG.baseURL}/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.timeout
        }
      )

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('查询任务状态失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`查询任务状态失败: ${error.response?.data?.message || error.message}`)
    }
  }
}
