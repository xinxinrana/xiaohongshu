/**
 * 视觉分析服务
 * 使用胜算云的视觉模型 "ali/qwen-vl-ocr" 进行图像分析
 */

import axios from 'axios'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 胜算云视觉API配置 - 使用独立的OCR API Key
const VISION_API_CONFIG = {
  baseURL: process.env.SHENGSUAN_VISION_BASE_URL || 'https://router.shengsuanyun.com/api/v1',
  apiKey: process.env.SHENGSUAN_VISION_API_KEY,
  model: process.env.SHENGSUAN_VISION_MODEL || 'ali/qwen-vl-ocr',
  timeout: 60000
}

console.log('[VisionService] 胜算云视觉API配置:', {
  baseURL: VISION_API_CONFIG.baseURL,
  model: VISION_API_CONFIG.model,
  apiKey: VISION_API_CONFIG.apiKey?.substring(0, 20) + '...'
})

/**
 * 视觉分析服务类
 */
export class VisionService {
  /**
   * 分析图片内容，提取视觉特征
   * @param {string} imageUrl - 图片URL或Base64数据
   * @param {Object} options - 可选参数
   * @param {string} options.prompt - 自定义分析提示词
   * @param {string} options.detailLevel - 分析详细度 (basic/detailed)
   * @returns {Promise<Object>} 分析结果
   */
  static async analyzeImage(imageUrl, options = {}) {
    const { prompt, detailLevel = 'detailed' } = options

    if (!imageUrl || !imageUrl.trim()) {
      throw new Error('图片URL不能为空')
    }

    // 构建分析提示词
    const analysisPrompt = prompt || this._buildAnalysisPrompt(detailLevel)

    try {
      console.log('[视觉分析] 开始分析图片...')

      const response = await axios.post(
        `${VISION_API_CONFIG.baseURL}/chat/completions`,
        {
          model: VISION_API_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: analysisPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${VISION_API_CONFIG.apiKey}`,
            'HTTP-Referer': 'https://www.postman.com',
            'X-Title': 'Xiaohongshu Generator'
          },
          timeout: VISION_API_CONFIG.timeout
        }
      )

      const content = response.data?.choices?.[0]?.message?.content
      if (!content) {
        throw new Error('视觉分析返回内容为空')
      }

      console.log('[视觉分析] 分析成功')

      // 解析返回的结构化内容
      const structuredAnalysis = this._parseAnalysisResponse(content)

      return {
        success: true,
        data: {
          rawResponse: content,
          analysis: structuredAnalysis,
          model: VISION_API_CONFIG.model,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('[视觉分析] 失败:', error.message)
      if (error.response) {
        console.error('[视觉分析] 响应状态:', error.response.status)
        console.error('[视觉分析] 响应数据:', error.response.data)
      }
      throw new Error(`视觉分析失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * 构建分析提示词
   * @param {string} detailLevel - 详细度级别
   * @returns {string} 提示词
   */
  static _buildAnalysisPrompt(detailLevel) {
    const basePrompt = `请仔细分析这张图片，为小红书内容创作提供参考。

请从以下维度进行分析，并以JSON格式返回：

1. **视觉风格** (visual_style)
   - 风格类型（如：清新简约、ins风、日系治愈、韩系时尚等）
   - 美学特征

2. **氛围感** (mood_atmosphere)
   - 整体氛围（如：轻松愉悦、温馨舒适、时尚前卫等）
   - 情感基调

3. **构图分析** (composition)
   - 构图方式（如：居中构图、三分法构图、对角线构图等）
   - 视觉焦点

4. **色彩特征** (color_palette)
   - 主色调
   - 辅助色
   - 色彩搭配风格

5. **主体元素** (subject_elements)
   - 画面中的主要元素
   - 物品/人物/场景描述

6. **场景类型** (scene_type)
   - 场景分类（如：人物、美食、风景、产品、宠物等）

7. **平台适配度** (platform_fit)
   - 评分1-10：评估图片在小红书平台的适配度
   - 评分理由

8. **创作建议** (creative_suggestions)
   - 文案风格建议（2-3条）
   - 话题标签建议（3-5个）
   - 适合的内容框架推荐

${detailLevel === 'detailed' ? `9. **细节描述** (detail_description)
   - 图片中的具体细节（文字、装饰、背景等）
   - 可利用的亮点` : ''}

返回JSON格式示例：
{
  "visual_style": "清新简约",
  "mood_atmosphere": "轻松愉悦",
  "composition": "三分法构图",
  "color_palette": ["暖色调", "橙色", "米色"],
  "subject_elements": ["咖啡杯", "书本", "阳光"],
  "scene_type": "美食",
  "platform_fit": {
    "score": 8.5,
    "reason": "构图清晰，色调柔和，符合小红书审美"
  },
  "creative_suggestions": {
    "content_style": ["温柔治愈风", "生活美学"],
    "tags": ["#下午茶", "#生活美学", "#治愈系", "#咖啡日记"],
    "recommended_framework": "生活体验分享框架"
  }${detailLevel === 'detailed' ? `,
  "detail_description": "背景有窗户和绿植，阳光从右侧射入，书桌上放着一杯拿铁和一本翻开的书，书页上有手写字迹"` : ''}
}

请直接返回JSON格式的分析结果，不要包含其他说明文字。`

    return basePrompt
  }

  /**
   * 解析视觉分析的响应
   * @param {string} content - 原始响应内容
   * @returns {Object} 结构化分析结果
   */
  static _parseAnalysisResponse(content) {
    try {
      // 尝试直接解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // 如果解析失败，返回原始内容
      console.warn('[视觉分析] JSON解析失败，返回原始内容')
      return {
        visual_style: '未知',
        mood_atmosphere: '未知',
        composition: '未知',
        color_palette: ['未知'],
        subject_elements: ['未知'],
        scene_type: '未知',
        platform_fit: {
          score: 5,
          reason: '视觉分析结果解析失败'
        },
        creative_suggestions: {
          content_style: [],
          tags: [],
          recommended_framework: '通用框架'
        },
        rawResponse: content
      }
    } catch (error) {
      console.error('[视觉分析] 解析响应失败:', error)
      return {
        visual_style: '未知',
        mood_atmosphere: '未知',
        composition: '未知',
        color_palette: ['未知'],
        subject_elements: ['未知'],
        scene_type: '未知',
        platform_fit: {
          score: 5,
          reason: '视觉分析结果解析失败'
        },
        creative_suggestions: {
          content_style: [],
          tags: [],
          recommended_framework: '通用框架'
        },
        error: error.message
      }
    }
  }

  /**
   * OCR文字识别（如果有文字）
   * @param {string} imageUrl - 图片URL
   * @returns {Promise<Object>} OCR结果
   */
  static async extractText(imageUrl) {
    const ocrPrompt = `请识别图片中的所有文字内容。

要求：
1. 提取所有可见的文字
2. 按照阅读顺序排列
3. 标注文字的位置（左上、右上、左下、右下、居中）
4. 如果是中英文混合，分别标注

返回JSON格式：
{
  "text_content": "识别到的完整文字",
  "text_regions": [
    {
      "position": "居中",
      "text": "具体文字内容",
      "language": "中文/英文"
    }
  ],
  "has_text": true
}`

    return this.analyzeImage(imageUrl, { prompt: ocrPrompt })
  }
}
