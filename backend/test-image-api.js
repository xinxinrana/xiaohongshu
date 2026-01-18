/**
 * 图像生成API测试脚本
 * 使用方法：node test-image-api.js
 */

import axios from 'axios'

const API_BASE_URL = 'http://localhost:8099/api'

// 测试用例配置
const TEST_CASES = {
  // 1. 文生图测试
  textToImage: {
    endpoint: '/image/text-to-image',
    method: 'POST',
    data: {
      prompt: '一只可爱的橘猫坐在窗台上，阳光洒在它的毛发上，表情愉悦，活泼可爱，逼真准确',
      negative_prompt: '低分辨率、错误、最差质量、低质量、残缺、多余的手指、比例不良',
      size: '1664*928',
      n: 1,
      prompt_extend: true,
      watermark: false
    }
  },
  
  // 2. 图像编辑测试
  editImage: {
    endpoint: '/image/edit',
    method: 'POST',
    data: {
      imageUrl: 'https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg',
      prompt: '将图中的人物改为趴姿势，伸手握住狗的前爪',
      negative_prompt: '',
      watermark: false,
      seed: 1
    }
  },
  
  // 3. 图生图测试
  imageToImage: {
    endpoint: '/image/image-to-image',
    method: 'POST',
    data: {
      imageUrl: 'https://dashscope.oss-cn-beijing.aliyuncs.com/images/dog_and_girl.jpeg',
      prompt: '生成一张类似风格的卡通画，保持人物和狗的布局',
      negative_prompt: '低分辨率、错误、最差质量、低质量、残缺',
      watermark: false,
      seed: 1
    }
  }
}

/**
 * 执行单个测试用例
 */
async function runTest(testName, testCase) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🧪 测试：${testName}`)
  console.log(`${'='.repeat(60)}`)
  console.log('📤 请求数据:')
  console.log(JSON.stringify(testCase.data, null, 2))
  
  try {
    const response = await axios({
      method: testCase.method,
      url: `${API_BASE_URL}${testCase.endpoint}`,
      data: testCase.data,
      timeout: 60000
    })
    
    console.log('\n✅ 请求成功!')
    console.log('📥 响应数据:')
    console.log(JSON.stringify(response.data, null, 2))
    
    // 如果返回了任务ID，可以查询任务状态
    const taskId = response.data?.data?.task_id || response.data?.data?.request_id
    if (taskId) {
      console.log(`\n💡 任务ID: ${taskId}`)
      console.log('💡 可以使用以下命令查询任务状态:')
      console.log(`   curl ${API_BASE_URL}/image/task/${taskId}`)
    }
    
    return true
  } catch (error) {
    console.log('\n❌ 请求失败!')
    if (error.response) {
      console.log('状态码:', error.response.status)
      console.log('错误信息:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('错误信息:', error.message)
    }
    return false
  }
}

/**
 * 查询任务状态
 */
async function queryTaskStatus(taskId) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 查询任务状态: ${taskId}`)
  console.log(`${'='.repeat(60)}`)
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/image/task/${taskId}`,
      { timeout: 30000 }
    )
    
    console.log('✅ 查询成功!')
    console.log('📥 响应数据:')
    console.log(JSON.stringify(response.data, null, 2))
    
    return response.data
  } catch (error) {
    console.log('❌ 查询失败!')
    if (error.response) {
      console.log('状态码:', error.response.status)
      console.log('错误信息:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.log('错误信息:', error.message)
    }
    return null
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始测试图像生成API')
  console.log(`📍 API地址: ${API_BASE_URL}`)
  
  const args = process.argv.slice(2)
  
  // 如果提供了任务ID参数，直接查询任务状态
  if (args.length > 0 && args[0].startsWith('task-')) {
    await queryTaskStatus(args[0])
    return
  }
  
  // 运行所有测试用例
  const results = {
    total: 0,
    success: 0,
    failed: 0
  }
  
  for (const [testName, testCase] of Object.entries(TEST_CASES)) {
    results.total++
    const success = await runTest(testName, testCase)
    if (success) {
      results.success++
    } else {
      results.failed++
    }
    
    // 每个测试之间等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // 输出测试总结
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 测试总结')
  console.log(`${'='.repeat(60)}`)
  console.log(`总计: ${results.total}`)
  console.log(`✅ 成功: ${results.success}`)
  console.log(`❌ 失败: ${results.failed}`)
  console.log('')
  
  console.log('💡 使用提示:')
  console.log('1. 运行所有测试: node test-image-api.js')
  console.log('2. 查询任务状态: node test-image-api.js <taskId>')
  console.log('')
}

// 运行测试
main().catch(error => {
  console.error('测试执行出错:', error)
  process.exit(1)
})
