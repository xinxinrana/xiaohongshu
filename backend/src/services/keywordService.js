
import { callAI } from './aiService.js'

const PROMPTS = {
  analyzeKeywords: `你是一个小红书内容分析专家。请分析用户输入的关键词，并返回JSON格式结果。

任务：
1. 分析用户关键词的意图
2. 确定主题
3. 识别目标受众
4. 推荐最适合的写作框架

可用的框架有：
- AIDA模型框架：注意-兴趣-欲望-行动，适合营销推广
- SCQA模型框架：情境-冲突-问题-答案，适合问题解决
- 黄金圈法则框架：为什么-怎么做-是什么，适合价值传递
- 小红书爆款框架：综合视觉钩子+情绪价值+实用信息+互动引导
- 情感共鸣框架：通过情感连接打动用户
- 干货分享框架：提供实用知识和技巧
- 种草推荐框架：展示产品优势和使用体验
- 生活方式分享框架：展示生活状态和价值主张

请以以下JSON格式返回：
{
  "intent": "关键词意图（营销、解决问题、分享等）",
  "topic": "核心主题",
  "targetAudience": "目标人群",
  "recommendedFrameworks": [
    {
      "id": "框架名称",
      "name": "框架名称",
      "description": "简短描述，不超过50字",
      "matchScore": 85
    }
  ]
}`
}

export async function analyzeKeywords(keywords) {
  try {
    const prompt = `${PROMPTS.analyzeKeywords}\n\n用户关键词：${keywords}`
    const response = await callAI(prompt)
    
    let analysis
    try {
      analysis = JSON.parse(response)
    } catch (e) {
      analysis = {
        intent: '内容创作',
        topic: keywords,
        targetAudience: '对小红书内容感兴趣的用户',
        recommendedFrameworks: []
      }
    }
    
    if (!analysis.recommendedFrameworks || analysis.recommendedFrameworks.length === 0) {
      analysis.recommendedFrameworks = [
        {
          id: '小红书爆款框架',
          name: '小红书爆款框架',
          description: '综合视觉钩子+情绪价值+实用信息',
          matchScore: 85
        }
      ]
    }
    
    return analysis
  } catch (error) {
    console.error('AI分析失败，使用默认规则:', error)
    return {
      intent: '内容创作',
      topic: keywords,
      targetAudience: '对内容感兴趣的用户',
      recommendedFrameworks: [
        {
          id: '小红书爆款框架',
          name: '小红书爆款框架',
          description: '综合视觉钩子+情绪价值+实用信息',
          matchScore: 85
        }
      ]
    }
  }
}
