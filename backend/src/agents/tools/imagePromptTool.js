/**
 * 图像提示词生成工具
 * 根据文案内容生成专业的 AI 绘画提示词
 */

import { XHSTool } from '../base/BaseTool.js'
import { LLM_CONFIGS } from '../base/BaseLLM.js'

export class ImagePromptGenerationTool extends XHSTool {
  constructor() {
    super(
      'image_prompt_generator',
      '根据小红书文案内容，提取配图场景并转化为专业的 AI 绘画提示词（适用于 Doubao-Seedream 模型）'
    )
  }

  async _call(input) {
    const { content, uploadedImageUrl, promptCount = 3 } = this.parseInput(input)
    
    this.logStep('开始生成图像提示词', { 
      contentLength: content?.length,
      hasReferenceImage: !!uploadedImageUrl 
    })

    try {
      let prompt = `你是一个专业的 AI 绘画提示词工程师。请根据以下小红书文案内容，提取出最适合的 ${promptCount} 个配图场景，并将每个场景转化为专业、详细、具有视觉冲击力的 AI 绘画提示词。

文案内容：
${content || '无'}
${uploadedImageUrl ? '用户已上传参考图片，请生成能够与参考图风格相呼应的提示词。' : ''}

要求：
1. 提示词要非常具体、详细，包含风格、光影、色彩、构图等元素
2. 每个提示词应独立成篇，能够生成完整的配图
3. 提示词要符合 Doubao-Seedream-4.5 模型的输入规范
4. ${promptCount}个提示词应该互补，覆盖文案的不同内容维度
5. 参考风格示例："星际穿越，黑洞，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义"
6. 小红书风格示例："清新简约，自然光，ins风，治愈系，日系，韩系，ins风打卡"

请直接返回${promptCount}个提示词，每个提示词占一行，不要编号，格式如下：
提示词1
提示词2
提示词3`

      const response = await LLM_CONFIGS.prompts.invoke(prompt)
      const fullText = response.content.trim()

      // 解析返回的提示词
      const prompts = fullText.split('\n')
        .map(p => p.trim())
        .map(p => p.replace(/^\d+[\.、\s]+/, '').trim())  // 移除可能的编号
        .filter(p => p.length > 0)
        .slice(0, promptCount)

      // 确保有足够的提示词
      const finalPrompts = [...prompts]
      
      // 如果生成的提示词不足，且一个都没有生成，则抛出错误（不使用纯假提示词）
      if (finalPrompts.length === 0) {
        throw new Error('AI未能生成有效的图像提示词')
      }

      // 如果有部分生成，但不足 count，则复用已生成的
      while (finalPrompts.length < promptCount) {
        // 循环使用已生成的提示词，而不是使用硬编码的"假"提示词
        finalPrompts.push(finalPrompts[finalPrompts.length % prompts.length])
      }

      this.logStep('图像提示词生成完成', { 
        promptCount: finalPrompts.length 
      })

      return this.formatOutput(true, { 
        prompts: finalPrompts 
      })
    } catch (error) {
      this.logStep('图像提示词生成失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}
