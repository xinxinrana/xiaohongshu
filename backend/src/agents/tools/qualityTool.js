/**
 * 质量评估工具
 * 从多个维度评估生成内容的质量
 */

import { XHSTool } from '../base/BaseTool.js'
import { LLM_CONFIGS } from '../base/BaseLLM.js'

export class QualityAssessmentTool extends XHSTool {
  constructor() {
    super(
      'quality_assessor',
      '评估生成内容的质量，从视觉冲击力、文案钩子、平台适配度、互动性等维度进行评分（1-10分）并提供改进建议'
    )
  }

  async _call(input) {
    const { content, framework } = this.parseInput(input)
    
    this.logStep('开始质量评估', { 
      contentLength: content?.length,
      framework
    })

    try {
      const prompt = `作为小红书内容质量评估专家，请对以下内容进行全方位评估。

待评估内容：
${content || '无'}
${framework ? `写作框架：${framework}` : ''}

请从以下维度进行评分（1-10分，10分最高）并简要说明：
1. **视觉冲击力**：内容是否能吸引眼球，有吸引力
2. **文案钩子**：开头是否能有效抓住用户注意力
3. **平台适配度**：是否符合小红书平台的调性和风格
4. **互动性**：是否能引导用户评论、点赞、收藏
5. **信息价值**：内容是否有实质性价值，对用户有用
6. **语言流畅度**：文案是否通顺，无语法错误

最后请给出：
- 综合评分（1-10分）
- 2-3条具体的改进建议

请以 JSON 格式返回评估结果（不要使用markdown代码块标记）：
{
  "visual_impact": {"score": 8, "comment": "..."},
  "hook_effectiveness": {"score": 7, "comment": "..."},
  "platform_fit": {"score": 9, "comment": "..."},
  "engagement": {"score": 6, "comment": "..."},
  "information_value": {"score": 8, "comment": "..."},
  "language_fluency": {"score": 9, "comment": "..."},
  "overall_score": 7.8,
  "suggestions": ["建议1", "建议2"]
}

注意：每个comment字段不超过50字，每条建议不超过30字。`

      const response = await LLM_CONFIGS.analysis.invoke(prompt)
      let resultText = response.content.trim()

      // 尝试解析 JSON
      let assessment
      try {
        // 清理多种可能的格式问题
        let cleanedJson = resultText
          .replace(/```json\n?|```\n?/g, '')  // 移除markdown代码块标记
          .replace(/^[^{\[]*|[^}\]]*$/g, '')  // 移除JSON前后的非JSON文本
          .trim()
        
        // 尝试提取JSON对象（处理可能截断的JSON）
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanedJson = jsonMatch[0]
        }
        
        // 尝试解析JSON
        assessment = JSON.parse(cleanedJson)
        
        // 验证必要的字段
        if (!assessment.overall_score) {
          throw new Error('缺少overall_score字段')
        }
        
        // 确保所有字段都存在
        if (!assessment.visual_impact) assessment.visual_impact = { score: 7, comment: '未评估' }
        if (!assessment.hook_effectiveness) assessment.hook_effectiveness = { score: 7, comment: '未评估' }
        if (!assessment.platform_fit) assessment.platform_fit = { score: 7, comment: '未评估' }
        if (!assessment.engagement) assessment.engagement = { score: 7, comment: '未评估' }
        if (!assessment.information_value) assessment.information_value = { score: 7, comment: '未评估' }
        if (!assessment.language_fluency) assessment.language_fluency = { score: 7, comment: '未评估' }
        if (!assessment.suggestions || !Array.isArray(assessment.suggestions)) {
          assessment.suggestions = ['内容基本合格']
        }
        
      } catch (parseError) {
        console.warn('JSON 解析失败，使用默认评分，原始内容前200字符:', resultText.substring(0, 200))
        assessment = {
          visual_impact: { score: 7, comment: '无法解析' },
          hook_effectiveness: { score: 7, comment: '无法解析' },
          platform_fit: { score: 7, comment: '无法解析' },
          engagement: { score: 7, comment: '无法解析' },
          information_value: { score: 7, comment: '无法解析' },
          language_fluency: { score: 7, comment: '无法解析' },
          overall_score: 7,
          suggestions: ['内容基本合格，建议增加更多细节']
        }
      }

      this.logStep('质量评估完成', { 
        overallScore: assessment.overall_score 
      })

      return this.formatOutput(true, assessment)
    } catch (error) {
      this.logStep('质量评估失败', { error: error.message })
      return this.formatOutput(false, null, error.message)
    }
  }
}
