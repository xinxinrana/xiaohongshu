/**
 * 多模态感知工具
 * 分析用户上传的参考图片，提取风格、构图、氛围信息
 * 使用胜算云的视觉模型 "ali/qwen-vl-ocr"
 */

import { XHSTool } from '../base/BaseTool.js'
import { LLM_CONFIGS } from '../base/BaseLLM.js'
import { VisionService } from '../../services/visionService.js'

export class MultimodalAnalysisTool extends XHSTool {
  constructor() {
    super(
      'multimodal_analyzer',
      '分析用户上传的参考图片，提取风格、构图、氛围、色彩等视觉特征，用于指导后续的文案和图像生成。使用胜算云的ali/qwen-vl-ocr视觉模型。'
    )
  }

  async _call(input) {
    const { imageUrl, analysisDetail = 'detailed' } = this.parseInput(input)

    this.logStep('开始多模态分析', {
      imageUrl: imageUrl?.substring(0, 50) + '...',
      detail: analysisDetail
    })

    try {
      // 调用胜算云视觉模型进行真实分析
      const visionResult = await VisionService.analyzeImage(imageUrl, {
        detailLevel: analysisDetail
      })

      if (!visionResult.success) {
        throw new Error(visionResult.error || '视觉分析失败')
      }

      const analysis = visionResult.data.analysis

      // 如果需要,使用GLM-4.7对视觉分析结果进行深度解读
      let llmInterpretation = null
      if (analysisDetail === 'detailed' && analysis) {
        const interpretPrompt = `作为小红书视觉分析专家，请根据以下视觉特征，提供详细的创作指导：

【视觉分析结果】
${JSON.stringify(analysis, null, 2)}

请从以下维度提供专业建议：

1. **文案风格定位**（3-5点）
   - 语气建议（如：温柔/活泼/专业/俏皮）
   - 情感基调（如：治愈/励志/分享/种草）
   - 结构建议（如：故事性/清单式/问答式）

2. **话题标签策略**（5-8个）
   - 核心标签（3-4个）
   - 长尾标签（2-4个）
   - 标签组合建议

3. **内容框架推荐**
   - 推荐使用的框架类型
   - 框架使用要点
   - 与图片特点的结合方式

4. **配图补充建议**
   - 还需要哪些角度的配图
   - 场景延伸建议
   - 风格统一性建议

5. **平台优化建议**
   - 如何在小红书上获得更好效果
   - 爆款潜力评估
   - 优化重点

请以清晰的分段格式返回建议，不要使用JSON格式：`

        const interpretation = await LLM_CONFIGS.analysis.invoke(interpretPrompt)
        llmInterpretation = interpretation.content
      }

      const result = {
        ...analysis,
        analysis_detail: analysisDetail,
        model_used: visionResult.data.model,
        interpretation: llmInterpretation,
        raw_analysis: visionResult.data.rawResponse
      }

      this.logStep('多模态分析完成', {
        visual_style: result.visual_style,
        scene_type: result.scene_type,
        platform_fit_score: result.platform_fit?.score
      })

      return this.formatOutput(true, result)
    } catch (error) {
      this.logStep('多模态分析失败', { error: error.message })

      // 降级：返回通用分析并说明原因
      return this.formatOutput(true, {
        visual_style: '清新简约',
        mood_atmosphere: '轻松愉悦',
        composition: '居中构图',
        color_palette: ['暖色调', '柔和'],
        subject_elements: ['主体清晰'],
        scene_type: '未知',
        platform_fit: {
          score: 5,
          reason: '视觉分析服务暂不可用，使用默认分析结果'
        },
        creative_suggestions: {
          content_style: ['通用风格'],
          tags: ['#生活', '#分享'],
          recommended_framework: '通用框架'
        },
        analysis_detail: analysisDetail,
        note: `视觉分析失败: ${error.message}，已降级使用默认结果`
      })
    }
  }

  /**
   * OCR文字识别（提取图片中的文字）
   */
  async extractTextFromImage(imageUrl) {
    this.logStep('开始OCR文字识别', {
      imageUrl: imageUrl?.substring(0, 50) + '...'
    })

    try {
      const ocrResult = await VisionService.extractText(imageUrl)

      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'OCR识别失败')
      }

      this.logStep('OCR识别完成', {
        has_text: ocrResult.data.analysis?.has_text,
        text_length: ocrResult.data.analysis?.text_content?.length || 0
      })

      return this.formatOutput(true, ocrResult.data.analysis)
    } catch (error) {
      this.logStep('OCR识别失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}
