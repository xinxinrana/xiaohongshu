/**
 * 综合测试脚本
 * 集成测试 OCR、图像生成、Agent 功能
 * 使用方法：node test-all.js [选项]
 * 选项：
 *   --ocr       仅测试 OCR
 *   --image     仅测试图像生成
 *   --agent     仅测试 Agent
 *   --all       测试所有（默认）
 */

import dotenv from 'dotenv'
import { VisionService } from './src/services/visionService.js'
import { ImageService } from './src/services/imageService.js'
import { XiaohongshuAgent } from './src/agents/xiaohongshuAgent.js'
import { glmLLM } from './src/agents/base/BaseLLM.js'
import axios from 'axios'

// 加载环境变量
dotenv.config()

console.log('='.repeat(70))
console.log('🚀 小红书生成器 - 综合功能测试')
console.log('='.repeat(70))

// 测试配置
const TEST_CONFIG = {
  // 测试图片URL（使用包含文字的图片测试OCR）
  testImageUrl: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop',
  imageGenerationPrompt: '一只可爱的橘猫坐在窗台上，阳光洒在它的毛发上，表情愉悦，活泼可爱，逼真准确',
  testKeywords: '咖啡店探店',
  testUserMessage: '推荐一家有氛围感的咖啡店'
}

const API_BASE_URL = 'http://localhost:8099/api'

// 测试结果
const testResults = {
  llm: { name: 'LLM配置', status: 'pending', error: null },
  visionAnalysis: { name: '视觉分析', status: 'pending', error: null },
  ocr: { name: 'OCR识别', status: 'pending', error: null },
  imageGeneration: { name: '图像生成', status: 'pending', error: null },
  agentConfig: { name: 'Agent配置', status: 'pending', error: null },
  agentExecution: { name: 'Agent执行', status: 'pending', error: null }
}

// ============================================
// 测试1: LLM 配置测试
// ============================================
async function testLLMConfig() {
  console.log('\n📋 测试1: LLM 配置测试')
  console.log('-'.repeat(70))

  try {
    console.log('配置信息:')
    console.log(`- Base URL: ${process.env.SHENGSUAN_BASE_URL}`)
    console.log(`- Model: ${process.env.SHENGSUAN_MODEL}`)
    console.log(`- API Key: ${process.env.SHENGSUAN_API_KEY?.substring(0, 20)}...`)

    console.log('\n正在调用 LLM...')
    const response = await glmLLM.invoke('你好，请用一句话介绍自己。')

    if (response && response.content) {
      console.log('✅ LLM 调用成功!')
      console.log(`回复: ${response.content.substring(0, 100)}...`)
      testResults.llm.status = 'passed'
      return true
    } else {
      throw new Error('LLM 返回内容为空')
    }
  } catch (error) {
    console.log('❌ LLM 配置测试失败:', error.message)
    if (error.response) {
      console.log('响应状态:', error.response.status)
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    testResults.llm.status = 'failed'
    testResults.llm.error = error.message
    return false
  }
}

// ============================================
// 测试2: 视觉分析测试
// ============================================
async function testVisionAnalysis() {
  console.log('\n📋 测试2: 视觉分析')
  console.log('-'.repeat(70))

  try {
    console.log('测试图片:', TEST_CONFIG.testImageUrl)
    console.log('\n正在分析图片...')

    const result = await VisionService.analyzeImage(TEST_CONFIG.testImageUrl, {
      detailLevel: 'detailed'
    })

    if (result.success && result.data) {
      console.log('✅ 视觉分析成功!')
      console.log('\n分析结果:')
      const analysis = result.data.analysis
      console.log(`- 视觉风格: ${analysis.visual_style}`)
      console.log(`- 氛围感: ${analysis.mood_atmosphere}`)
      console.log(`- 构图: ${analysis.composition}`)
      console.log(`- 场景类型: ${analysis.scene_type}`)
      console.log(`- 平台适配度: ${analysis.platform_fit?.score}/10`)
      console.log(`- 推荐框架: ${analysis.creative_suggestions?.recommended_framework}`)
      testResults.visionAnalysis.status = 'passed'
      return true
    } else {
      throw new Error('视觉分析返回结果异常')
    }
  } catch (error) {
    console.log('❌ 视觉分析失败:', error.message)
    testResults.visionAnalysis.status = 'failed'
    testResults.visionAnalysis.error = error.message
    return false
  }
}

// ============================================
// 测试3: OCR 文字识别测试
// ============================================
async function testOCR() {
  console.log('\n📋 测试3: OCR 文字识别')
  console.log('-'.repeat(70))

  try {
    console.log('测试图片:', TEST_CONFIG.testImageUrl)
    console.log('\n正在识别文字...')

    const result = await VisionService.extractText(TEST_CONFIG.testImageUrl)

    if (result.success && result.data) {
      console.log('✅ OCR 识别成功!')
      console.log('\n识别结果:')
      const ocrResult = result.data.analysis
      console.log(`- 是否有文字: ${ocrResult.has_text || '无'}`)
      if (ocrResult.text_content) {
        console.log(`- 文字内容: ${ocrResult.text_content.substring(0, 100)}...`)
      }
      if (ocrResult.text_regions && ocrResult.text_regions.length > 0) {
        console.log(`- 文字区域数: ${ocrResult.text_regions.length}`)
        ocrResult.text_regions.forEach((region, idx) => {
          console.log(`  [${idx + 1}] ${region.position}: ${region.text?.substring(0, 30)}...`)
        })
      }
      testResults.ocr.status = 'passed'
      return true
    } else {
      throw new Error('OCR 返回结果异常')
    }
  } catch (error) {
    console.log('❌ OCR 识别失败:', error.message)
    testResults.ocr.status = 'failed'
    testResults.ocr.error = error.message
    return false
  }
}

// ============================================
// 测试4: 图像生成测试（通过服务层）
// ============================================
async function testImageGenerationService() {
  console.log('\n📋 测试4: 图像生成 (服务层)')
  console.log('-'.repeat(70))

  try {
    console.log('提示词:', TEST_CONFIG.imageGenerationPrompt)
    console.log('\n正在生成图像...')

    const result = await ImageService.generateImageFromText(TEST_CONFIG.imageGenerationPrompt, {
      size: '1664x928',
      n: 1,
      prompt_extend: true,
      watermark: false
    })

    if (result.success && result.data && result.data.data && result.data.data.data) {
      const imageUrl = result.data.data.data.image_urls?.[0]
      if (imageUrl) {
        console.log('✅ 图像生成成功!')
        console.log(`\n图像URL: ${imageUrl}`)
        testResults.imageGeneration.status = 'passed'
        return true
      } else {
        throw new Error('生成结果中没有图像URL')
      }
    } else {
      throw new Error('图像生成返回结果异常')
    }
  } catch (error) {
    console.log('❌ 图像生成失败:', error.message)
    testResults.imageGeneration.status = 'failed'
    testResults.imageGeneration.error = error.message
    return false
  }
}

// ============================================
// 测试5: 图像生成测试（通过 API）
// ============================================
async function testImageGenerationAPI() {
  console.log('\n📋 测试5: 图像生成 (API层)')
  console.log('-'.repeat(70))

  try {
    console.log('API地址:', API_BASE_URL)
    console.log('提示词:', TEST_CONFIG.imageGenerationPrompt)
    console.log('\n正在调用 API...')

    const response = await axios.post(
      `${API_BASE_URL}/image/text-to-image`,
      {
        prompt: TEST_CONFIG.imageGenerationPrompt,
        negative_prompt: '低分辨率、错误、最差质量、低质量、残缺',
        size: '1664x928',
        n: 1,
        prompt_extend: true,
        watermark: false
      },
      { timeout: 60000 }
    )

    if (response.data && response.data.success) {
      console.log('✅ API 调用成功!')
      console.log('\n响应数据:', JSON.stringify(response.data, null, 2))

      const imageUrl = response.data.data?.data?.image_urls?.[0] ||
                       response.data.data?.data?.image_url
      if (imageUrl) {
        console.log(`\n图像URL: ${imageUrl}`)
      }

      testResults.imageGeneration.status = 'passed'
      return true
    } else {
      throw new Error(response.data?.error || 'API 返回失败')
    }
  } catch (error) {
    console.log('❌ API 调用失败:', error.message)
    if (error.response) {
      console.log('状态码:', error.response.status)
      console.log('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    testResults.imageGeneration.status = 'failed'
    testResults.imageGeneration.error = error.message
    return false
  }
}

// ============================================
// 测试6: Agent 配置测试
// ============================================
async function testAgentConfig() {
  console.log('\n📋 测试6: Agent 配置')
  console.log('-'.repeat(70))

  try {
    console.log('正在实例化 Agent...')
    const agent = new XiaohongshuAgent()

    console.log('✅ Agent 实例化成功!')
    console.log(`- Agent 名称: ${agent.name}`)
    console.log(`- 可用工具数: ${agent.tools?.length || 0}`)
    if (agent.tools && agent.tools.length > 0) {
      console.log(`- 工具列表: ${agent.tools.map(t => t.name).join(', ')}`)
    }

    testResults.agentConfig.status = 'passed'
    return true
  } catch (error) {
    console.log('❌ Agent 配置测试失败:', error.message)
    testResults.agentConfig.status = 'failed'
    testResults.agentConfig.error = error.message
    return false
  }
}

// ============================================
// 测试7: Agent 执行测试（快速生成模式）
// ============================================
async function testAgentExecution() {
  console.log('\n📋 测试7: Agent 执行 (快速生成模式)')
  console.log('-'.repeat(70))

  try {
    console.log('输入信息:')
    console.log(`- 关键词: ${TEST_CONFIG.testKeywords}`)
    console.log(`- 用户需求: ${TEST_CONFIG.testUserMessage}`)
    console.log('\n正在执行 Agent...')

    const agent = new XiaohongshuAgent()
    const result = await agent.execute({
      keywords: TEST_CONFIG.testKeywords,
      userMessage: TEST_CONFIG.testUserMessage
    })

    if (result.success && result.data) {
      console.log('✅ Agent 执行成功!')
      console.log('\n执行结果:')
      console.log(`- 框架匹配: ${result.data.framework?.success ? '成功' : '失败'}`)
      console.log(`- 文案生成: ${result.data.content?.success ? '成功' : '失败'}`)
      console.log(`- 质量评估: ${result.data.quality?.success ? '成功' : '失败'}`)

      if (result.data.content?.success) {
        console.log(`\n生成的文案 (前150字符):`)
        console.log(result.data.content.data.content.substring(0, 150) + '...')
      }

      testResults.agentExecution.status = 'passed'
      return true
    } else {
      throw new Error(result.error || 'Agent 执行返回失败')
    }
  } catch (error) {
    console.log('❌ Agent 执行失败:', error.message)
    console.log('堆栈信息:', error.stack?.split('\n').slice(0, 5).join('\n'))
    testResults.agentExecution.status = 'failed'
    testResults.agentExecution.error = error.message
    return false
  }
}

// ============================================
// 主测试函数
// ============================================
async function main() {
  const args = process.argv.slice(2)
  const testOCR = args.includes('--ocr')
  const testImage = args.includes('--image')
  const testAgent = args.includes('--agent')
  const testAll = !testOCR && !testImage && !testAgent || args.includes('--all')

  try {
    // 1. LLM 配置测试（所有测试的基础）
    const llmPassed = await testLLMConfig()
    if (!llmPassed) {
      console.log('\n⚠️  LLM 配置测试失败，部分依赖 LLM 的测试可能失败')
    }
    await sleep(1000)

    // 2. 视觉分析和 OCR 测试
    if (testAll || testOCR) {
      await testVisionAnalysis()
      await sleep(1000)
      await testOCR()
      await sleep(1000)
    }

    // 3. 图像生成测试
    if (testAll || testImage) {
      // 优先尝试 API 层测试（需要后端服务运行）
      await testImageGenerationAPI()
      await sleep(1000)

      // 如果 API 测试失败，尝试服务层测试
      if (testResults.imageGeneration.status === 'failed') {
        console.log('\n💡 API 测试失败，尝试服务层直接测试...')
        await testImageGenerationService()
        await sleep(1000)
      }
    }

    // 4. Agent 测试
    if (testAll || testAgent) {
      await testAgentConfig()
      await sleep(1000)

      if (llmPassed) {
        await testAgentExecution()
      } else {
        console.log('\n⚠️  跳过 Agent 执行测试（LLM 配置失败）')
        testResults.agentExecution.status = 'skipped'
      }
    }

    // 输出测试结果汇总
    printTestSummary()

  } catch (error) {
    console.error('\n❌ 测试执行异常:', error)
    process.exit(1)
  }
}

// 辅助函数：延迟
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 辅助函数：打印测试结果汇总
function printTestSummary() {
  console.log('\n' + '='.repeat(70))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(70))

  let passedCount = 0
  let failedCount = 0
  let skippedCount = 0

  Object.entries(testResults).forEach(([key, result]) => {
    let statusIcon = '❌'
    if (result.status === 'passed') {
      statusIcon = '✅'
      passedCount++
    } else if (result.status === 'skipped') {
      statusIcon = '⏭️ '
      skippedCount++
    } else {
      failedCount++
    }

    console.log(`${statusIcon} ${result.name.padEnd(20)} ${result.status.toUpperCase()}`)
    if (result.error) {
      console.log(`   错误: ${result.error}`)
    }
  })

  console.log('-'.repeat(70))
  console.log(`总计: ${Object.keys(testResults).length}`)
  console.log(`✅ 通过: ${passedCount}`)
  console.log(`❌ 失败: ${failedCount}`)
  console.log(`⏭️  跳过: ${skippedCount}`)
  console.log('='.repeat(70))

  if (failedCount === 0) {
    console.log('🎉 所有测试通过！系统功能正常。')
  } else {
    console.log('⚠️  部分测试失败，请检查配置和网络连接。')
    console.log('\n💡 提示:')
    if (testResults.llm.status === 'failed') {
      console.log('   - 检查 SHENGSUAN_API_KEY 和 SHENGSUAN_MODEL 配置')
    }
    if (testResults.imageGeneration.status === 'failed') {
      console.log('   - 检查 VOLCENGINE_API_KEY 和 VOLCENGINE_MODEL 配置')
      console.log('   - 确保后端服务已启动 (npm run dev)')
    }
    if (testResults.agentExecution.status === 'failed') {
      console.log('   - 确保 LLM 配置正确')
      console.log('   - 检查 Agent 工具依赖是否正常')
    }
    process.exit(1)
  }
}

// 运行测试
main()
