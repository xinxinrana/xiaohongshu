/**
 * 内容生成工具
 * 根据关键词和用户需求生成小红书文案内容
 * 支持多模态分析结果,可根据参考图片生成配套文案
 */

import { XHSTool } from '../base/BaseTool.js'
import { glmLLM } from '../base/BaseLLM.js'

export class ContentGenerationTool extends XHSTool {
  constructor() {
    super(
      'content_generator',
      '根据关键词和用户需求生成小红书爆款文案。支持图生图场景，可根据参考图片和多模态分析结果生成配套文案。'
    )
  }

  async _call(input) {
    const { keywords, userMessage, hasReferenceImage, existingContent, multimodalAnalysis } = this.parseInput(input)

    this.logStep('开始生成文案', { keywords, hasReferenceImage, hasMultimodalAnalysis: !!multimodalAnalysis })

    try {
      let prompt = `你是一个专业的小红书内容创作专家，擅长创作爆款笔记。

用户信息：
|- 关键词：${keywords || '无'}
|- 用户需求：${userMessage || '无'}
${hasReferenceImage ? '- 参考图片：用户已上传参考图片，请生成与图片风格相配的文案' : ''}
${existingContent ? '- 现有内容（用于修改）：\n' + existingContent : ''}
${multimodalAnalysis ? '- 图片视觉分析：\n' + JSON.stringify(multimodalAnalysis, null, 2) : ''}

创作要求：
1. 标题：吸引人，15-25字，包含核心关键词
2. 正文：300-500字，分3-5段，每段3-5句
3. 风格：小红书种草风，真实、亲切、有共鸣
4. Emoji：大量使用恰当的Emoji，增强阅读体验（至少5个）
5. 严禁：不要使用任何Markdown语法（**加粗**、#标题等），不要使用*列表符号
6. 标签：最后添加3-5个相关话题标签（#）
${multimodalAnalysis ? `7. 参考图片视觉特征：
   - 风格：${multimodalAnalysis.visual_style || '未知'}
   - 氛围：${multimodalAnalysis.mood_atmosphere || '未知'}
   - 场景：${multimodalAnalysis.scene_type || '未知'}
   - 平台适配度：${multimodalAnalysis.platform_fit?.score || 7}/10
   - 创作建议：${multimodalAnalysis.interpretation ? '已提供详细指导' : '已提供视觉特征'}
   请根据这些视觉特征调整文案风格，确保内容与图片完美契合` : ''}

${multimodalAnalysis?.creative_suggestions ? `参考创作建议：
- 文案风格：${multimodalAnalysis.creative_suggestions.content_style?.join('、') || '通用风格'}
- 推荐标签：${multimodalAnalysis.creative_suggestions.tags?.join('、') || '#分享'}
- 推荐框架：${multimodalAnalysis.creative_suggestions.recommended_framework || '通用框架'}
请优先使用这些建议` : ''}

请直接输出完整的文案内容（标题+正文+标签），不要包含任何元数据或说明：`

      const response = await glmLLM.invoke(prompt)
      const content = response.content.trim()

      this.logStep('文案生成完成', { contentLength: content.length })

      return this.formatOutput(true, { content, isRawText: true })
    } catch (error) {
      this.logStep('文案生成失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}
