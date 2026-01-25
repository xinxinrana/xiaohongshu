/**
 * 小红书内容创作主 Agent (简化版)
 * 直接整合所有工具，不依赖 LangChain AgentExecutor
 */

import { BaseAgent } from './base/BaseAgent.js'
import { glmLLM, LLM_CONFIGS } from './base/BaseLLM.js'
import { ContentGenerationTool } from './tools/contentTool.js'
import { FrameworkMatchTool } from './tools/frameworkTool.js'
import { ImagePromptGenerationTool } from './tools/imagePromptTool.js'
import { QualityAssessmentTool } from './tools/qualityTool.js'
import { ImageGenerationTool } from './tools/imageGenTool.js'
import { MultimodalAnalysisTool } from './tools/multimodalTool.js'
import { MemoryRetrievalTool, MemoryStorageTool } from './tools/memoryTool.js'

const sanitizeLogValue = (value, depth = 0) => {
  if (depth > 4) return null
  if (typeof value === 'string') {
    if (value.startsWith('data:')) return value.slice(0, 80) + '...'
    if (value.length > 500) return value.slice(0, 500) + '...'
    return value
  }
  if (Array.isArray(value)) {
    return value.slice(0, 5).map(item => sanitizeLogValue(item, depth + 1))
  }
  if (value && typeof value === 'object') {
    const result = {}
    for (const [key, val] of Object.entries(value)) {
      result[key] = sanitizeLogValue(val, depth + 1)
    }
    return result
  }
  return value
}

export class XiaohongshuAgent extends BaseAgent {
  constructor() {
    super(
      'XiaohongshuAgent',
      [
        new ContentGenerationTool(),
        new FrameworkMatchTool(),
        new ImagePromptGenerationTool(),
        new QualityAssessmentTool(),
        new ImageGenerationTool(),
        new MultimodalAnalysisTool(),
        new MemoryRetrievalTool(),
        new MemoryStorageTool()
      ],
      glmLLM,
      '小红书内容创作助手 - 支持关键词分析、框架匹配、文案生成、图像提示词生成、图像生成、质量评估和记忆管理'
    )
    
    // 工具映射
    this.toolsMap = {
      framework_matcher: new FrameworkMatchTool(),
      content_generator: new ContentGenerationTool(),
      image_prompt_generator: new ImagePromptGenerationTool(),
      quality_assessor: new QualityAssessmentTool(),
      image_generator: new ImageGenerationTool(),
      multimodal_analyzer: new MultimodalAnalysisTool(),
      memory_retriever: new MemoryRetrievalTool(),
      memory_saver: new MemoryStorageTool()
    }
  }

  async execute(input) {
    const { keywords, userMessage, uploadedImageUrl, action = 'auto' } = input

    this.logStep('Agent 开始执行', { keywords, userMessage, action })

    try {
      // 阶段0: 智能规划 - 根据输入决定执行步骤
      const executionPlan = await this.planExecution(input)
      this.logStep('执行计划生成', { plan: executionPlan })

      const results = {}

      // 阶段1: 预处理 - 多模态分析、框架匹配和记忆检索
      // 1.1 多模态分析(如果用户上传了图片)
      if (uploadedImageUrl && executionPlan.includes('multimodal_analyzer')) {
        this.logStep('多模态分析参考图片', { uploadedImageUrl: uploadedImageUrl?.substring(0, 50) + '...' })
        const multimodalTool = this.toolsMap.multimodal_analyzer
        const multimodalResult = await multimodalTool._call(JSON.stringify({
          imageUrl: uploadedImageUrl,
          analysisDetail: 'detailed'
        }))
        results.multimodal = JSON.parse(multimodalResult)
      }

      // 1.2 框架匹配
      if (executionPlan.includes('framework_matcher')) {
        this.logStep('分析创作框架', { keywords })
        const frameworkTool = this.toolsMap.framework_matcher
        const frameworkResult = await frameworkTool._call(JSON.stringify({ keywords }))
        results.framework = JSON.parse(frameworkResult)
      }

      // 1.3 记忆检索
      if (keywords && executionPlan.includes('memory_retriever')) {
        this.logStep('检索历史记忆', { keywords })
        const memoryTool = this.toolsMap.memory_retriever
        const memoryResult = await memoryTool._call(JSON.stringify({
          keywords: Array.isArray(keywords) ? keywords : keywords.split(/[,，、]/),
          limit: 2
        }))
        results.memory = JSON.parse(memoryResult)
      }

      // 阶段2: 核心生成 - 文案生成
      if (executionPlan.includes('content_generator')) {
        this.logStep('生成文案内容', { keywords, userMessage })
        const contentTool = this.toolsMap.content_generator

        // 如果检索到记忆,作为上下文传递
        const memoryContext = results.memory?.success && results.memory.data.memories
          ? `参考内容:\n${results.memory.data.memories.map(m => m.content).join('\n\n')}`
          : ''

        // 如果有多模态分析结果,作为上下文传递
        const multimodalContext = results.multimodal?.success ? results.multimodal.data : null

        const contentResult = await contentTool._call(JSON.stringify({
          keywords,
          userMessage,
          hasReferenceImage: !!uploadedImageUrl,
          context: memoryContext,  // 历史记忆上下文
          multimodalAnalysis: multimodalContext  // 多模态分析结果
        }))
        results.content = JSON.parse(contentResult)
        if (results.content?.success) {
          this.logStep('文案生成结果', {
            content: results.content.data?.content?.slice(0, 300),
            isRawText: results.content.data?.isRawText
          })
        }
      }

      // 阶段3: 质量保证 - 评估和修正
      if (results.content.success && executionPlan.includes('quality_assessor')) {
        this.logStep('评估内容质量')
        const qualityTool = this.toolsMap.quality_assessor
        const qualityResult = await qualityTool._call(JSON.stringify({
          content: results.content.data.content,
          framework: results.framework?.success ? results.framework.data.recommendedFramework : '通用框架'
        }))
        results.quality = JSON.parse(qualityResult)
        if (results.quality?.success) {
          this.logStep('质量评估结果', results.quality.data)
        }

        // 质量不达标,触发自我修正
        if (results.quality.success && results.quality.data.overall_score < 7.0) {
          this.logStep('质量未达标,触发自我修正', {
            currentScore: results.quality.data.overall_score
          })
          const improvedContent = await this.selfCorrection({
            content: results.content.data.content,
            qualityResult: results.quality.data,
            framework: results.framework.success ? results.framework.data.recommendedFramework : '通用框架'
          })

          if (improvedContent.success) {
            results.content.data.content = improvedContent.data.content
            results.content.isImproved = true
            results.content.originalQuality = results.quality.data.overall_score

            // 重新评估
            const newQualityResult = await qualityTool._call(JSON.stringify({
              content: improvedContent.data.content,
              framework: results.framework.success ? results.framework.data.recommendedFramework : '通用框架'
            }))
            results.quality = JSON.parse(newQualityResult)
          }
        }

        // 保存高质量内容到记忆
        if (results.quality.success && results.quality.data.overall_score >= 7.0) {
          const saveTool = this.toolsMap.memory_saver
          const saveResult = await saveTool._call(JSON.stringify({
            content: results.content.data.content,
            metadata: {
              keywords: Array.isArray(keywords) ? keywords : keywords.split(/[,，、]/),
              framework: results.framework?.success ? results.framework.data.recommendedFramework : '通用框架',
              qualityScore: results.quality.data.overall_score,
              createdAt: new Date().toISOString()
            }
          }))
          const parsedSave = JSON.parse(saveResult)
          this.logStep('保存高质量内容到记忆', {
            memoryId: parsedSave?.data?.memoryId,
            stats: parsedSave?.data?.stats
          })
        }
      }

      // 阶段4: 配图生成 - 提示词和图像
      if (results.content.success && executionPlan.includes('image_prompt_generator')) {
        this.logStep('生成图像提示词')
        const promptTool = this.toolsMap.image_prompt_generator
        const promptResult = await promptTool._call(JSON.stringify({
          content: results.content.data.content,
          uploadedImageUrl,
          promptCount: 3 // 强制生成3个提示词
        }))
        results.prompts = JSON.parse(promptResult)
        if (results.prompts?.success) {
          this.logStep('图像提示词结果', { prompts: results.prompts.data?.prompts })
        }

        // 生成图像 (支持文生图和图生图)
        if (results.prompts?.success && executionPlan.includes('image_generator')) {
          this.logStep('生成配套图像', { mode: uploadedImageUrl ? 'image-to-image' : 'text-to-image' })
          const imageTool = this.toolsMap.image_generator
          
          // 根据是否有参考图选择模式
          const imageGenParams = {
            prompt: results.prompts.data.prompts[0],  // 基础提示词
            prompts: results.prompts.data.prompts,    // 传递完整提示词数组(如果有)
            mode: uploadedImageUrl ? 'image-to-image' : 'text-to-image',
            count: 3, // 强制生成3张
            size: '1440x2560' // 小红书竖屏比例
          }

          if (uploadedImageUrl) {
            imageGenParams.uploadedImages = [uploadedImageUrl]
          }

          // 如果 imageGenTool 支持直接传入 prompts 数组进行批量生成会更好
          // 这里假设它会处理 count 参数，根据 prompts 或重复 prompt 生成
          
          const imageResult = await imageTool._call(JSON.stringify(imageGenParams))
          results.image = JSON.parse(imageResult)
          if (results.image?.success) {
            this.logStep('图像生成结果', {
              image_urls: results.image.data?.image_urls,
              count: results.image.data?.count
            })
          }
        }
      }

      this.logStep('Agent 执行完成', {
        success: results.content.success,
        stepsCompleted: executionPlan.length,
        qualityScore: results.quality?.data?.overall_score
      })

      // 关键补充：将最终结果记录到日志中，以便前端在请求超时时也能通过轮询获取结果
      this.logStep('Agent 执行结果', sanitizeLogValue(results))

      return this.formatResponse(true, results)
    } catch (error) {
      this.logStep('Agent 执行失败', { error: error.message, stack: error.stack })
      return this.formatResponse(false, null, error.message)
    }
  }

  /**
   * 快速生成模式 - 只生成文案
   */
  async quickGenerate(input) {
    this.logStep('快速生成模式', input)

    const contentTool = new ContentGenerationTool()
    const result = await contentTool._call(JSON.stringify(input))
    const parsed = JSON.parse(result)

    if (parsed.success) {
      // 统一返回结构，使其与 execute 方法返回的结构一致
      // 前端期望: result.content.data.content
      return this.formatResponse(true, {
        content: {
          success: true,
          data: parsed.data
        }
      })
    } else {
      return this.formatResponse(false, null, parsed.error)
    }
  }

  /**
   * 完整流程模式 - 包含质量评估、修正和配图生成
   */
  async fullProcess(input) {
    this.logStep('完整流程模式', input)

    let currentContent = null
    let maxRetries = 2
    let attempt = 0
    
    // 最终结果对象，保持与 execute 结构一致
    const finalResults = {
      content: null,
      quality: null,
      prompts: null,
      image: null
    }

    while (attempt <= maxRetries) {
      attempt++

      // 1. 生成内容
      // 复用 contentTool 而不是调用 quickGenerate，以便控制返回结构
      const contentTool = new ContentGenerationTool()
      const contentResultStr = await contentTool._call(JSON.stringify(input))
      const contentResult = JSON.parse(contentResultStr)
      
      if (!contentResult.success) {
        return this.formatResponse(false, null, contentResult.error)
      }
      
      currentContent = contentResult.data.content
      finalResults.content = contentResult
      this.logStep('文案生成结果', {
        content: currentContent?.slice(0, 300),
        isRawText: contentResult.data?.isRawText
      })

      // 2. 质量评估
      const qualityTool = new QualityAssessmentTool()
      const qualityResultStr = await qualityTool._call(JSON.stringify({
        content: currentContent,
        framework: input.framework
      }))
      const qualityResult = JSON.parse(qualityResultStr)
      finalResults.quality = qualityResult
      if (qualityResult?.success) {
        this.logStep('质量评估结果', qualityResult.data)
      }

      if (qualityResult.success && qualityResult.data.overall_score >= 7) {
        this.logStep('质量达标，生成提示词', { score: qualityResult.data.overall_score })
        
        // 3. 生成图像提示词
        const promptTool = new ImagePromptGenerationTool()
        const promptResultStr = await promptTool._call(JSON.stringify({
          content: currentContent,
          uploadedImageUrl: input.uploadedImageUrl,
          promptCount: 3 // 强制生成3个
        }))
        const promptResult = JSON.parse(promptResultStr)
        finalResults.prompts = promptResult
        if (promptResult?.success) {
          this.logStep('图像提示词结果', { prompts: promptResult.data?.prompts })
        }
        
        // 4. 生成图像 (新增步骤)
        this.logStep('生成配套图像', { mode: input.uploadedImageUrl ? 'image-to-image' : 'text-to-image' })
        const imageTool = new ImageGenerationTool()
        const imageGenParams = {
          prompt: promptResult.data.prompts[0],
          prompts: promptResult.data.prompts,
          mode: input.uploadedImageUrl ? 'image-to-image' : 'text-to-image',
          count: 3,
          size: '1440x2560'
        }
        
        if (input.uploadedImageUrl) {
          imageGenParams.uploadedImages = [input.uploadedImageUrl]
        }
        
        const imageResultStr = await imageTool._call(JSON.stringify(imageGenParams))
        finalResults.image = JSON.parse(imageResultStr)
        if (finalResults.image?.success) {
          this.logStep('图像生成结果', {
            image_urls: finalResults.image.data?.image_urls,
            count: finalResults.image.data?.count
          })
        }

        return this.formatResponse(true, finalResults)
      }

      // 质量不达标，根据建议重新生成
      this.logStep('质量不达标，重新生成', { 
        score: qualityResult.data.overall_score,
        suggestions: qualityResult.data.suggestions
      })

      input.existingContent = currentContent + `\n\n改进建议：${qualityResult.data.suggestions.join(', ')}`
    }

    // 达到最大重试次数，返回当前结果
    return this.formatResponse(true, {
      ...finalResults,
      warning: '达到最大重试次数，可能需要人工审核'
    })
  }

  /**
   * 智能规划 - 根据输入决定执行步骤
   */
  async planExecution(input) {
    const { keywords, userMessage, uploadedImageUrl } = input

    const planPrompt = `作为小红书内容创作Agent,请规划生成步骤:

输入信息:
- 关键词: ${keywords || '无'}
- 用户需求: ${userMessage || '无'}
- 参考图片: ${uploadedImageUrl ? '有' : '无'}

请从以下步骤中选择需要执行的步骤(按优先级排序,用逗号分隔):
1. multimodal_analyzer - 多模态分析(分析参考图片的视觉特征,如果用户上传了图片)
2. framework_matcher - 框架匹配(分析创作框架)
3. memory_retriever - 检索历史记忆(如果有关键词)
4. content_generator - 生成文案
5. quality_assessor - 质量评估
6. image_prompt_generator - 生成图像提示词
7. image_generator - 生成图像(文生图或图生图)
8. memory_storage - 保存记忆(质量达标后)

注意事项:
- 如果用户上传了参考图片,必须优先执行 multimodal_analyzer
- 总是包含 image_generator 以生成配图

输出JSON格式: {"steps": ["step1", "step2"], "reason": "选择理由"}`

    try {
      const response = await LLM_CONFIGS.fast.invoke(planPrompt)
      let resultText = response.content.trim()
      
      // 清理可能的markdown代码块标记和多余文本
      resultText = resultText
        .replace(/```json\n?|```\n?/g, '')  // 移除markdown代码块标记
        .replace(/^[^{\[]*|[^}\]]*$/g, '')  // 移除JSON前后的非JSON文本
        .trim()
      
      // 尝试提取JSON内容
      const jsonMatch = resultText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        resultText = jsonMatch[0]
      }
      
      const result = JSON.parse(resultText)
      
      // 验证返回的格式
      if (!result || !result.steps || !Array.isArray(result.steps)) {
        throw new Error('返回格式不正确，缺少steps字段')
      }
      
      this.logStep('智能规划结果', result)
      return result.steps
    } catch (error) {
      // LLM规划失败,使用默认流程
      console.warn('[Agent] 智能规划失败,使用默认流程:', error.message)
      const defaultPlan = [
        ...(uploadedImageUrl ? ['multimodal_analyzer'] : []),
        'framework_matcher',
        'memory_retriever',
        'content_generator',
        'quality_assessor',
        'image_prompt_generator',
        'image_generator', // 总是包含生成图像
        'memory_storage'
      ]
      return defaultPlan
    }
  }

  /**
   * 自我修正 - 根据质量评估结果优化内容
   */
  async selfCorrection({ content, qualityResult, framework }) {
    this.logStep('开始自我修正', { currentScore: qualityResult.overall_score })

    try {
      // 步骤1: 生成改进建议
      const critiquePrompt = `你是一个专业的小红书内容优化专家。

当前内容:
${content}

质量评估结果:
${JSON.stringify(qualityResult, null, 2)}

请提供具体的改进建议(至少3条,每条建议不超过50字):
1. ...
2. ...
3. ...

只返回改进建议,不要其他内容。`

      const critiqueResponse = await LLM_CONFIGS.analysis.invoke(critiquePrompt)
      const suggestions = critiqueResponse.content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+[\.、\s]+/, '').trim())

      this.logStep('改进建议', { suggestions })

      // 步骤2: 根据建议重新生成
      const rewritePrompt = `你是一个小红书内容创作专家。

原始内容:
${content}

改进建议:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

框架要求: ${framework || '通用'}

请根据改进建议重写内容,保持小红书风格和调性:
1. 标题吸引人,15-25字
2. 正文300-500字
3. 大量使用Emoji
4. 严禁使用Markdown语法
5. 添加3-5个话题标签

直接输出重写后的内容:`

      const rewriteResponse = await LLM_CONFIGS.content.invoke(rewritePrompt)
      const improvedContent = rewriteResponse.content.trim()

      this.logStep('自我修正完成', { 
        originalLength: content.length,
        improvedLength: improvedContent.length 
      })

      return this.formatOutput(true, { content: improvedContent })
    } catch (error) {
      this.logStep('自我修正失败', { error: error.message })
      // 修正失败,返回原内容
      return this.formatOutput(false, null, error.message)
    }
  }
}
