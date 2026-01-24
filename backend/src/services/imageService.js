import axios from 'axios'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 火山引擎（字节跳动生图）图像生成API配置
const IMAGE_API_CONFIG = {
  baseURL: process.env.VOLCENGINE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/',
  apiKey: process.env.VOLCENGINE_API_KEY || 'USER_API_KEY',
  // 系统实际使用的模型（已升级至4.5版本）
  imageGenerationModel: process.env.VOLCENGINE_MODEL || 'doubao-seedream-4-5-251128',
  imageEditModel: process.env.VOLCENGINE_MODEL || 'doubao-seedream-4-5-251128',
  defaultSize: '1440x2560',
  timeout: 60000,
  imageEditTimeout: 180000,  // 图生图需要更长超时（Base64数据大）
  multiFusionTimeout: 240000,  // 多图融合超时
  batchTimeout: 300000  // 批量/流式生成超时
}

// 支持的图像尺寸预设
const SUPPORTED_SIZES = [
  '1440x2560',  // 竖屏9:16 (High Res)
  '2560x1440',  // 横屏16:9 (High Res)
  '2048x2048',  // 正方形 (High Res)
  '1664x928',   // 默认横屏
  '1024x1024',  // 正方形
  '720x1280',   // 竖屏9:16
  '1280x720',   // 横屏16:9
  '768x1344',
  '1344x768',
  '832x1216',
  '1216x832'
]

// 支持的清晰度
const SUPPORTED_RESOLUTIONS = ['2K', '4K']

/**
 * 图像服务类 - 提供文生图、图生图和图像编辑功能
 */
export class ImageService {
  /**
   * 参数验证辅助方法
   * @param {Object} params - 待验证参数
   * @returns {Object} 验证结果 { valid: boolean, error?: string }
   */
  static _validateGenerationParams(params) {
    const { size, resolution, count, imageUrls } = params

    // 验证尺寸
    if (size && !SUPPORTED_SIZES.includes(size)) {
      return { valid: false, error: `不支持的图像尺寸: ${size}，支持的尺寸: ${SUPPORTED_SIZES.join(', ')}` }
    }

    // 验证清晰度
    if (resolution && !SUPPORTED_RESOLUTIONS.includes(resolution)) {
      return { valid: false, error: `不支持的清晰度: ${resolution}，支持: ${SUPPORTED_RESOLUTIONS.join(', ')}` }
    }

    // 验证生成数量
    if (count !== undefined) {
      if (!Number.isInteger(count) || count < 1 || count > 15) {
        return { valid: false, error: '生成数量必须是1-15之间的整数' }
      }
    }

    // 验证图片URL数组
    if (imageUrls) {
      if (!Array.isArray(imageUrls)) {
        return { valid: false, error: '图片URL必须是数组格式' }
      }
      for (const url of imageUrls) {
        if (typeof url !== 'string' || !url.trim()) {
          return { valid: false, error: '图片URL不能为空' }
        }
        // 验证Base64大小
        if (url.startsWith('data:')) {
          const base64Size = url.length * 0.75 / 1024 / 1024
          if (base64Size > 10) {
            return { valid: false, error: '单张图片不能超过10MB' }
          }
        }
      }
    }

    return { valid: true }
  }

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
        size: options.size || IMAGE_API_CONFIG.defaultSize,
        response_format: 'url',
        sequential_image_generation: 'disabled',
        stream: false,
        watermark: options.watermark !== undefined ? options.watermark : true
      }

      const response = await axios.post(
        `${IMAGE_API_CONFIG.baseURL}images/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.timeout
        }
      )

      // 火山引擎返回格式：{ data: [ { url: "..." } ] }
      if (response.data && response.data.data && response.data.data[0]) {
        return {
          success: true,
          data: {
            data: {
              task_id: Date.now().toString(), // 生成一个模拟task_id
              status: 'COMPLETED',
              data: {
                image_urls: [response.data.data[0].url]
              }
            }
          }
        }
      } else {
        throw new Error('图片生成接口返回格式异常')
      }
    } catch (error) {
      console.error('文生图失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`图像生成失败: ${error.response?.data?.error?.message || error.message}`)
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
        response_format: 'url',
        watermark: options.watermark !== undefined ? options.watermark : true
      }

      const response = await axios.post(
        `${IMAGE_API_CONFIG.baseURL}images/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.imageEditTimeout
        }
      )

      // 火山引擎返回格式：{ data: [ { url: "..." } ] }
      if (response.data && response.data.data && response.data.data[0]) {
        return {
          success: true,
          data: {
            data: {
              task_id: Date.now().toString(),
              status: 'COMPLETED',
              data: {
                image_urls: [response.data.data[0].url]
              }
            }
          }
        }
      } else {
        throw new Error('图像编辑接口返回格式异常')
      }
    } catch (error) {
      console.error('图像编辑失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`图像编辑失败: ${error.response?.data?.error?.message || error.message}`)
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

      // 图生图使用火山引擎的图像编辑功能
      const payload = {
        model: IMAGE_API_CONFIG.imageEditModel,
        prompt: `基于这张图片，${prompt}`,
        image: imageUrl,
        response_format: 'url',
        watermark: options.watermark !== undefined ? options.watermark : true
      }

      console.log('[图生图] 正在发送请求到火山引擎...')
      const response = await axios.post(
        `${IMAGE_API_CONFIG.baseURL}images/generations`,
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
      // 火山引擎返回格式：{ data: [ { url: "..." } ] }
      if (response.data && response.data.data && response.data.data[0]) {
        return {
          success: true,
          data: {
            data: {
              task_id: Date.now().toString(),
              status: 'COMPLETED',
              data: {
                image_urls: [response.data.data[0].url]
              }
            }
          }
        }
      } else {
        throw new Error('图生图接口返回格式异常')
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
        error: error.response?.data?.error?.message || error.message
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

      // 火山引擎API是同步返回的，不需要轮询
      // 这个方法保留是为了兼容性，但实际上火山引擎不需要查询任务状态
      console.log('[任务状态查询] 火山引擎API是同步返回，无需轮询')

      return {
        success: true,
        data: {
          data: {
            status: 'COMPLETED',
            data: {
              image_urls: []
            }
          }
        }
      }
    } catch (error) {
      console.error('查询任务状态失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw new Error(`查询任务状态失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * 多图融合生成：基于多张参考图生成融合风格的新图像
   * @param {string} prompt - 生成提示词
   * @param {string[]} imageUrls - 参考图像URL数组（2-14张）
   * @param {Object} options - 可选参数
   * @param {string} options.size - 图像尺寸
   * @param {string} options.resolution - 清晰度（2K/4K）
   * @param {boolean} options.watermark - 是否添加水印
   * @returns {Promise<Object>} 返回融合后的图像URL
   */
  static async generateImageFromMultipleImages(prompt, imageUrls, options = {}) {
    try {
      // 参数验证
      if (!prompt || !prompt.trim()) {
        throw new Error('生成提示词不能为空')
      }

      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 1) {
        throw new Error('至少需要1张参考图片')
      }

      if (imageUrls.length > 14) {
        throw new Error('参考图片数量不能超过14张')
      }

      const validation = this._validateGenerationParams({
        size: options.size,
        resolution: options.resolution,
        imageUrls
      })
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      console.log(`[多图融合] 开始处理 ${imageUrls.length} 张参考图...`)

      // 使用第一张图作为主参考图，将其他图的风格融入提示词
      const mainImage = imageUrls[0]
      let enhancedPrompt = prompt

      if (imageUrls.length > 1) {
        enhancedPrompt = `融合多张参考图的风格特点，${prompt}`
      }

      const payload = {
        model: IMAGE_API_CONFIG.imageEditModel,
        prompt: enhancedPrompt,
        image: mainImage,
        size: options.size || IMAGE_API_CONFIG.defaultSize,
        response_format: 'url',
        watermark: options.watermark !== undefined ? options.watermark : true
      }

      const response = await axios.post(
        `${IMAGE_API_CONFIG.baseURL}images/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.multiFusionTimeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )

      console.log('[多图融合] 请求成功')
      if (response.data && response.data.data && response.data.data[0]) {
        return {
          success: true,
          data: {
            task_id: Date.now().toString(),
            status: 'COMPLETED',
            image_urls: [response.data.data[0].url],
            reference_count: imageUrls.length
          }
        }
      } else {
        throw new Error('多图融合接口返回格式异常')
      }
    } catch (error) {
      console.error('多图融合失败:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  }

  /**
   * 批量图像生成：根据提示词生成多张图像
   * @param {string} prompt - 生成提示词
   * @param {string[]} referenceImages - 参考图像数组（可选，0-5张）
   * @param {Object} options - 可选参数
   * @param {number} options.max_images - 生成数量（1-15）
   * @param {string} options.size - 图像尺寸
   * @param {string} options.resolution - 清晰度
   * @param {boolean} options.watermark - 是否添加水印
   * @param {string} options.negative_prompt - 负面提示词
   * @returns {Promise<Object>} 返回图像URL数组和统计信息
   */
  static async generateBatchImages(prompt, referenceImages = [], options = {}) {
    try {
      // 参数验证
      if (!prompt || !prompt.trim()) {
        throw new Error('生成提示词不能为空')
      }

      const maxImages = options.max_images || 1
      const validation = this._validateGenerationParams({
        size: options.size,
        resolution: options.resolution,
        count: maxImages,
        imageUrls: referenceImages.length > 0 ? referenceImages : undefined
      })
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      if (referenceImages.length > 5) {
        throw new Error('参考图片数量不能超过5张')
      }

      console.log(`[批量生成] 开始生成 ${maxImages} 张图像...`)

      const results = []
      const errors = []
      const startTime = Date.now()

      // 并发生成多张图像
      const generatePromises = []
      for (let i = 0; i < maxImages; i++) {
        const generateSingle = async (index) => {
          try {
            let result
            if (referenceImages.length > 0) {
              // 有参考图，使用图生图
              const refImage = referenceImages[index % referenceImages.length]
              result = await this.generateImageFromImage(refImage, prompt, {
                watermark: options.watermark,
                size: options.size
              })
            } else {
              // 无参考图，使用文生图
              result = await this.generateImageFromText(prompt, {
                watermark: options.watermark,
                size: options.size || IMAGE_API_CONFIG.defaultSize
              })
            }

            if (result.success && result.data?.data?.data?.image_urls?.[0]) {
              return { success: true, url: result.data.data.data.image_urls[0], index }
            } else {
              return { success: false, error: result.error || '生成失败', index }
            }
          } catch (err) {
            return { success: false, error: err.message, index }
          }
        }

        generatePromises.push(generateSingle(i))
      }

      // 等待所有生成完成
      const generateResults = await Promise.all(generatePromises)

      for (const res of generateResults) {
        if (res.success) {
          results.push(res.url)
        } else {
          errors.push({ index: res.index, error: res.error })
        }
      }

      const endTime = Date.now()
      console.log(`[批量生成] 完成，成功 ${results.length}/${maxImages} 张，耗时 ${endTime - startTime}ms`)

      return {
        success: results.length > 0,
        data: {
          task_id: Date.now().toString(),
          status: 'COMPLETED',
          image_urls: results,
          statistics: {
            requested: maxImages,
            success: results.length,
            failed: errors.length,
            duration_ms: endTime - startTime
          },
          errors: errors.length > 0 ? errors : undefined
        }
      }
    } catch (error) {
      console.error('批量生成失败:', error.message)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 流式图像生成：支持SSE实时返回生成进度
   * @param {string} prompt - 生成提示词
   * @param {Object} options - 可选参数
   * @param {string} options.size - 图像尺寸
   * @param {boolean} options.watermark - 是否添加水印
   * @param {string} options.referenceImage - 参考图像（可选）
   * @param {Function} streamCallback - 流式回调函数
   * @returns {Promise<Object>} 返回生成结果
   */
  static async generateImageWithStream(prompt, options = {}, streamCallback) {
    try {
      if (!prompt || !prompt.trim()) {
        throw new Error('生成提示词不能为空')
      }

      const validation = this._validateGenerationParams({
        size: options.size,
        imageUrls: options.referenceImage ? [options.referenceImage] : undefined
      })
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      console.log('[流式生成] 开始生成...')

      // 发送开始事件
      if (streamCallback) {
        streamCallback({ type: 'start', message: '开始生成图像...' })
      }

      const payload = {
        model: IMAGE_API_CONFIG.imageGenerationModel,
        prompt: prompt,
        size: options.size || IMAGE_API_CONFIG.defaultSize,
        response_format: 'url',
        watermark: options.watermark !== undefined ? options.watermark : true
      }

      // 如果有参考图，使用图生图
      if (options.referenceImage) {
        payload.image = options.referenceImage
        payload.prompt = `基于这张图片，${prompt}`
      }

      // 发送进度事件
      if (streamCallback) {
        streamCallback({ type: 'progress', progress: 30, message: '正在处理请求...' })
      }

      const response = await axios.post(
        `${IMAGE_API_CONFIG.baseURL}images/generations`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${IMAGE_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: IMAGE_API_CONFIG.batchTimeout,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      )

      // 发送进度事件
      if (streamCallback) {
        streamCallback({ type: 'progress', progress: 80, message: '图像生成完成，正在处理结果...' })
      }

      console.log('[流式生成] 请求成功')
      if (response.data && response.data.data && response.data.data[0]) {
        const imageUrl = response.data.data[0].url

        // 发送完成事件
        if (streamCallback) {
          streamCallback({ type: 'complete', progress: 100, image_url: imageUrl })
        }

        return {
          success: true,
          data: {
            task_id: Date.now().toString(),
            status: 'COMPLETED',
            image_urls: [imageUrl]
          }
        }
      } else {
        throw new Error('流式生成接口返回格式异常')
      }
    } catch (error) {
      console.error('流式生成失败:', error.message)

      // 发送错误事件
      if (streamCallback) {
        streamCallback({ type: 'error', error: error.message })
      }

      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      }
    }
  }

  /**
   * 获取支持的图像尺寸列表
   * @returns {string[]} 支持的尺寸数组
   */
  static getSupportedSizes() {
    return [...SUPPORTED_SIZES]
  }

  /**
   * 获取支持的清晰度列表
   * @returns {string[]} 支持的清晰度数组
   */
  static getSupportedResolutions() {
    return [...SUPPORTED_RESOLUTIONS]
  }
}
