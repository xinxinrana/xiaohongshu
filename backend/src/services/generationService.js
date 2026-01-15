import { callAI } from './aiService.js'

const PROMPTS = {
  generateContent: `你是一个专业的小红书内容创作专家。请根据给定的关键词和框架，创作一篇高质量的小红书图文内容。

框架说明请参考以下模板格式：

小红的书爆款框架：视觉钩子 + 情绪价值 + 实用信息 + 互动引导

AIDA模型框架：注意（吸引注意力）→ 兴趣（激发兴趣）→ 欲望（产生欲望）→ 行动（引导行动）

SCQA模型框架：情境（描述现状）→ 冲突（发现问题）→ 问题（提出疑问）→ 答案（提供方案）

黄金圈法则框架：为什么（动机和信念）→ 怎么做（方法和过程）→ 是什么（核心定义）

情感共鸣框架：情感唤醒（打开心扉）→ 真实细节（打动人心）→ 开放共鸣（引发互动）

干货分享框架：明确需求（问题前置）→ 核心内容（可执行步骤）→ 验证保障（信心增强）

种草推荐框架：识别需求（场景唤醒）→ 展示效果（使用体验）→ 降低疑虑（理性分析）→ 稀缺促动（立即行动）

生活方式分享框架：身份定义（建立标签）→ 日常细节（可感知生活）→ 价值传递（深层意义）→ 可复制性（轻松起步）

请以以下JSON格式返回内容：
{
  "title": "标题，20-25字，吸引眼球",
  "body": "正文内容，分段清晰，使用emoji增强可读性，每段不超过100字。注意：小红书不支持加粗，请不要使用Markdown加粗语法（如 **文本**）",
  "images": [
    {"type": "封面", "description": "封面图描述", "style": "风格"},
    {"type": "细节图", "description": "细节图描述", "style": "风格"}
  ],
  "tags": ["#标签1", "#标签2", "#标签3", "#标签4", "#标签5"]
}`,

  generateAnalysis: `你是一个内容质量分析专家。请分析给定的内容质量，重点关注为什么这是一篇好文章。

请以以下JSON格式返回分析结果：
{
  "hook": {
    "type": "钩子类型（悬念提问/痛点直击/猎奇揭秘/直接切入）",
    "effectiveness": "有效性（高/中/低）",
    "reason": "为什么有效的详细解释"
  },
  "framework": {
    "name": "框架名称",
    "strengths": ["优势1", "优势2", "优势3"],
    "whyEffective": "为什么这个框架有效的详细解释，包括底层逻辑和心理学原理"
  },
  "structure": {
    "hasClearFlow": true,
    "hasInteraction": true
  },
  "appeal": {
    "emotionScore": "情感感染力评分（1-10）",
    "valueScore": "实用价值评分（1-10）",
    "actionScore": "行动引导评分（1-10）",
    "overallRating": "综合评价",
    "reason": "综合评价的理由"
  }
}`
}

export class GenerationService {
  static async generateContent(keywords, frameworkId, options = {}) {
    try {
      const prompt = `${PROMPTS.generateContent}\n\n关键词: ${keywords}\n使用框架: ${frameworkId}`
      const response = await callAI(prompt)
      
      let content
      try {
        content = JSON.parse(response)
      } catch (e) {
        // 如果AI返回的不是JSON，创建默认内容
        content = this.createFallbackContent(keywords, frameworkId)
      }
      
      // 确保所有必需字段都存在
      if (!content.title) content.title = `关于${keywords}的分享`
      if (!content.body) content.body = `分享一些关于${keywords}的心得和经验。`
      if (!content.images || !Array.isArray(content.images)) {
        content.images = [
          { type: '封面', description: `${keywords}相关图片`, style: '真实感' }
        ]
      }
      if (!content.tags || !Array.isArray(content.tags)) {
        content.tags = [`#${keywords}`, '#小红书', '#分享']
      }
      
      return content
    } catch (error) {
      console.error('AI生成失败，使用备用方案:', error)
      return this.createFallbackContent(keywords, frameworkId)
    }
  }
  
  static createFallbackContent(keywords, frameworkId) {
    const keywordList = Array.isArray(keywords) ? keywords : keywords.split(/[,，\s]+/)
    const mainKeyword = keywordList[0] || '主题'
    
    return {
      title: `${mainKeyword}：我的心得分享`,
      body: `今天想和大家分享一下${mainKeyword}。\n\n✨ 核心要点：\n• 第一步：做好准备工作\n• 第二步：循序渐进地实践\n• 第三步：不断总结优化\n\n❤️ 如果觉得有用，记得点赞收藏哦！`,
      images: [
        {
          type: '封面',
          description: `${mainKeyword}相关的高清图片`,
          style: '真实感'
        }
      ],
      tags: [`#${mainKeyword}`, '#小红书', '#分享', '#经验', '#干货']
    }
  }
  
  static async generateAnalysis(content, framework) {
    try {
      const prompt = `${PROMPTS.generateAnalysis}\n\n内容:\n标题: ${content.title}\n正文: ${content.body}\n\n使用框架: ${framework}`
      const response = await callAI(prompt)
      
      let analysis
      try {
        analysis = JSON.parse(response)
      } catch (e) {
        analysis = this.createFallbackAnalysis(content, framework)
      }
      
      // 确保所有必需字段都存在
      if (!analysis.hook) {
        analysis.hook = {
          type: '直接切入',
          effectiveness: '中',
          reason: '内容直接进入主题'
        }
      }
      if (!analysis.framework) {
        analysis.framework = {
          name: framework,
          strengths: ['结构清晰', '内容实用'],
          whyEffective: '这个框架帮助组织内容，提升表达效果'
        }
      }
      if (!analysis.structure) {
        analysis.structure = {
          hasClearFlow: true,
          hasInteraction: content.body.includes('点赞') || content.body.includes('收藏')
        }
      }
      if (!analysis.appeal) {
        analysis.appeal = {
          emotionScore: 7,
          valueScore: 8,
          actionScore: 7,
          overallRating: '这是一篇不错的图文',
          reason: '内容实用，结构清晰'
        }
      }
      
      return analysis
    } catch (error) {
      console.error('AI分析失败，使用备用方案:', error)
      return this.createFallbackAnalysis(content, framework)
    }
  }
  
  static createFallbackAnalysis(content, framework) {
    return {
      hook: {
        type: '直接切入',
        effectiveness: '中',
        reason: '标题直接进入主题，吸引目标用户'
      },
      framework: {
        name: framework,
        strengths: [
          '使用小红书认可的爆款框架',
          '内容结构清晰易懂',
          '符合用户阅读习惯'
        ],
        whyEffective: `该框架专门针对小红书平台优化，通过${framework}的结构组织内容，提升可读性和传播效果。视觉钩子能吸引注意力，情感价值能产生共鸣，实用信息提供价值，互动引导增加传播。`
      },
      structure: {
        hasClearFlow: true,
        hasInteraction: content.body.includes('点赞') || content.body.includes('收藏') || content.body.includes('评论区')
      },
      appeal: {
        emotionScore: 7,
        valueScore: 8,
        actionScore: 7,
        overallRating: '这是一篇质量不错的图文',
        reason: '内容有实用价值，结构清晰，有互动引导，符合小红书用户的阅读习惯'
      }
    }
  }
}
