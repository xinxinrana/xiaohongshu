/**
 * 多模态分析测试脚本
 * 测试胜算云视觉模型集成
 */

import dotenv from 'dotenv'
import { VisionService } from './src/services/visionService.js'
import { XiaohongshuAgent } from './src/agents/xiaohongshuAgent.js'

// 加载环境变量
dotenv.config()

console.log('='.repeat(60))
console.log('🖼️  多模态分析测试')
console.log('='.repeat(60))

// 测试图片URL(示例)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop'

// 测试1: 视觉分析功能
async function testVisionAnalysis() {
  console.log('\n📋 测试1: 视觉分析')
  console.log('-'.repeat(60))

  try {
    const result = await VisionService.analyzeImage(TEST_IMAGE_URL, {
      detailLevel: 'detailed'
    })

    if (result.success) {
      console.log('✅ 视觉分析成功!')
      console.log('\n分析结果:')
      console.log('视觉风格:', result.data.analysis.visual_style)
      console.log('氛围感:', result.data.analysis.mood_atmosphere)
      console.log('构图:', result.data.analysis.composition)
      console.log('场景类型:', result.data.analysis.scene_type)
      console.log('平台适配度:', result.data.analysis.platform_fit?.score, '/ 10')
      console.log('\n创作建议:')
      console.log('文案风格:', result.data.analysis.creative_suggestions?.content_style?.join('、'))
      console.log('推荐标签:', result.data.analysis.creative_suggestions?.tags?.join('、'))
      console.log('推荐框架:', result.data.analysis.creative_suggestions?.recommended_framework)

      if (result.data.analysis.interpretation) {
        console.log('\nGLM-4.7 深度解读(前200字符):')
        console.log(result.data.analysis.interpretation.substring(0, 200) + '...')
      }

      return true
    } else {
      console.log('❌ 视觉分析失败')
      return false
    }
  } catch (error) {
    console.log('❌ 视觉分析异常:', error.message)
    return false
  }
}

// 测试2: OCR文字识别
async function testOCR() {
  console.log('\n📋 测试2: OCR文字识别')
  console.log('-'.repeat(60))

  try {
    const result = await VisionService.extractText(TEST_IMAGE_URL)

    if (result.success) {
      console.log('✅ OCR识别成功!')
      console.log('\n识别结果:')
      console.log('是否有文字:', result.data.analysis?.has_text || '无')
      if (result.data.analysis?.text_content) {
        console.log('文字内容:', result.data.analysis.text_content)
      }
      if (result.data.analysis?.text_regions?.length > 0) {
        console.log('文字区域:', result.data.analysis.text_regions.length, '个')
      }

      return true
    } else {
      console.log('❌ OCR识别失败')
      return false
    }
  } catch (error) {
    console.log('❌ OCR识别异常:', error.message)
    return false
  }
}

// 测试3: Agent多模态集成
async function testAgentWithImage() {
  console.log('\n📋 测试3: Agent多模态集成')
  console.log('-'.repeat(60))

  try {
    const agent = new XiaohongshuAgent()

    const result = await agent.execute({
      keywords: '咖啡店',
      userMessage: '分析这张咖啡店图片并生成文案',
      uploadedImageUrl: TEST_IMAGE_URL
    })

    console.log('✅ Agent执行完成!')

    if (result.success) {
      console.log('\n执行结果:')
      console.log('- 多模态分析:', result.data?.multimodal?.success ? '成功' : '失败')
      console.log('- 框架匹配:', result.data?.framework?.success ? '成功' : '失败')
      console.log('- 文案生成:', result.data?.content?.success ? '成功' : '失败')
      console.log('- 质量评估:', result.data?.quality?.success ? '成功' : '失败')

      if (result.data?.content?.success) {
        console.log('\n生成的文案(前200字符):')
        console.log(result.data.content.data.content.substring(0, 200) + '...')
      }

      if (result.data?.multimodal?.success) {
        const multimodal = result.data.multimodal.data
        console.log('\n视觉特征摘要:')
        console.log('风格:', multimodal.visual_style)
        console.log('场景:', multimodal.scene_type)
      }
    }

    return true
  } catch (error) {
    console.log('❌ Agent执行异常:', error.message)
    return false
  }
}

// 主测试函数
async function runTests() {
  const results = {
    visionAnalysis: false,
    ocr: false,
    agentIntegration: false
  }

  console.log('测试图片URL:', TEST_IMAGE_URL)

  results.visionAnalysis = await testVisionAnalysis()
  results.ocr = await testOCR()
  results.agentIntegration = await testAgentWithImage()

  console.log('\n' + '='.repeat(60))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(60))
  console.log('✅ 视觉分析测试:', results.visionAnalysis ? '通过' : '失败')
  console.log('✅ OCR识别测试:', results.ocr ? '通过' : '失败')
  console.log('✅ Agent集成测试:', results.agentIntegration ? '通过' : '失败')
  console.log('='.repeat(60))

  const allPassed = results.visionAnalysis && results.ocr && results.agentIntegration

  if (allPassed) {
    console.log('🎉 所有测试通过!多模态分析功能正常。')
  } else {
    console.log('⚠️  部分测试失败,请检查配置和网络连接。')
    process.exit(1)
  }
}

runTests()
