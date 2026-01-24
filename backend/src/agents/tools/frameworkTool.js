/**
 * 框架匹配工具
 * 根据关键词分析用户意图，推荐最合适的写作框架
 */

import { XHSTool } from '../base/BaseTool.js'
import { FrameworkService } from '../../services/frameworkService.js'

export class FrameworkMatchTool extends XHSTool {
  constructor() {
    super(
      'framework_matcher',
      '根据关键词分析用户创作意图，匹配最合适的小红书写作框架（如干货分享、产品测评、生活记录等）'
    )
  }

  async _call(input) {
    const { keywords } = this.parseInput(input)
    
    this.logStep('开始匹配框架', { keywords })

    try {
      // 调用现有的框架服务
      const frameworks = await FrameworkService.matchFrameworks(keywords)
      
      this.logStep('框架匹配完成', { 
        matchedCount: frameworks.length,
        topFramework: frameworks[0]?.name 
      })

      // 返回匹配结果
      return this.formatOutput(true, {
        intent: frameworks[0]?.description || '通用创作',
        recommendedFramework: frameworks[0]?.name || '通用框架',
        allFrameworks: frameworks.map(f => ({
          name: f.name,
          description: f.description,
          score: f.matchScore || 0
        }))
      })
    } catch (error) {
      this.logStep('框架匹配失败', { error: error.message })
      
      // 降级：返回默认框架
      return this.formatOutput(true, {
        intent: '通用创作',
        recommendedFramework: '通用框架',
        allFrameworks: [{ name: '通用框架', description: '适合各类内容创作', score: 0.5 }]
      })
    }
  }
}
