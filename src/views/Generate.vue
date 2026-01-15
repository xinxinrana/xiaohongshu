













<template>
  <n-space vertical :size="24">
    <!-- 1. 关键词输入区 - 改为一键生成 -->
    <KeywordInput @analyzed="handleQuickGenerate" :analyzing="generating" />
    
    <!-- 2. 框架选择区 (隐藏或作为高级选项，现在默认不显示) -->
    <n-collapse v-if="false">
      <n-collapse-item title="高级选项：手动选择框架" name="advanced">
        <n-card hoverable class="framework-selection-card">
          <FrameworkSelector
            :frameworks="displayFrameworks"
            v-model:value="selectedFramework"
            @selected="handleFrameworkSelected"
          />
        </n-card>
      </n-collapse-item>
    </n-collapse>
    
    <!-- 3. 生成结果展示区 -->
    <n-space vertical :size="24" v-if="generatedContent || generating">
      <!-- 生成过程状态展示 -->
      <n-card v-if="generating" class="processing-card">
        <n-space vertical :size="12">
          <n-text strong class="processing-title">AI 正在深度创作中...</n-text>
          <n-timeline>
            <n-timeline-item
              v-for="(log, index) in processingLogs"
              :key="index"
              :type="log.type"
              :title="log.title"
              :content="log.content"
              :time="log.time"
            />
          </n-timeline>
          <n-progress
            type="line"
            :percentage="generationProgress"
            :indicator-placement="'inside'"
            processing
          />
        </n-space>
      </n-card>

      <ContentEditor
        v-if="generatedContent"
        :content="generatedContent"
        :images="generatedImages"
        :image-loading="imageGenerating"
        @regenerate="handleRegenerate"
        @preview="handlePreview"
        @content-change="handleContentChange"
      />
      
      <QualityAnalysis
        v-if="qualityAnalysis"
        :analysis="qualityAnalysis"
      />
      
      <Preview
        v-if="showPreview"
        :content="editedContent"
        :images="generatedImages"
      />
    </n-space>
  </n-space>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { generationAPI, imageGenerationAPI } from '../services/api'
import KeywordInput from '../components/KeywordInput.vue'
import FrameworkSelector from '../components/FrameworkSelector.vue'
import ContentEditor from '../components/ContentEditor.vue'
import QualityAnalysis from '../components/QualityAnalysis.vue'
import Preview from '../components/Preview.vue'

const message = useMessage()

// 默认框架列表
const defaultFrameworks = [
  { id: 'viral', name: '爆款引流', description: '高点击率标题+情绪价值输出，适合快速起号' },
  { id: 'tutorial', name: '干货教程', description: '结构清晰的步骤分享，提供实用价值' },
  { id: 'promotion', name: '好物种草', description: '真实体验感+痛点解决，转化率更高' },
  { id: 'lifestyle', name: '生活方式', description: '氛围感图文+感性表达，建立人设必备' }
]

const analysisResult = ref(null)
const selectedFramework = ref('viral')
const generatedContent = ref(null)
const editedContent = ref(null)
const qualityAnalysis = ref(null)
const generating = ref(false)
const generationProgress = ref(0)
const processingLogs = ref([])
const imageGenerating = ref(false)
const generatedImages = ref([])
const showPreview = ref(false)
const currentKeywords = ref('')

/**
 * 添加处理日志
 */
const addLog = (title, content, type = 'info') => {
  processingLogs.value.push({
    title,
    content,
    type,
    time: new Date().toLocaleTimeString()
  })
}

// 计算要显示的框架：如果有分析结果用分析结果，否则用默认
const displayFrameworks = computed(() => {
  return analysisResult.value?.recommendedFrameworks || defaultFrameworks
})

const handleAnalyzed = async (data) => {
  analysisResult.value = data.analysis
  currentKeywords.value = data.keywords
  
  // 分析完成后，如果有推荐的框架（JSON 模式），自动选中第一个
  if (analysisResult.value.recommendedFrameworks && analysisResult.value.recommendedFrameworks.length > 0) {
    selectedFramework.value = analysisResult.value.recommendedFrameworks[0].id
  }
}

/**
 * 一键快捷生成逻辑
 * @param {Object} data - 包含 keywords 的对象
 */
const handleQuickGenerate = async (data) => {
  currentKeywords.value = data.keywords
  if (!currentKeywords.value) {
    message.warning('请先输入关键词')
    return
  }
  
  generating.value = true
  generationProgress.value = 0
  processingLogs.value = []
  generatedImages.value = []
  generatedContent.value = null
  
  try {
    addLog('行业分析', `正在识别 "${currentKeywords.value}" 领域的顶级博主风格...`, 'info')
    generationProgress.value = 20
    
    // 初始化流式内容对象
    const streamingContent = {
      isRawText: true,
      content: '',
      selectedMethodology: '自动匹配顶级博主风格'
    }

    const response = await generationAPI.autoGenerate(currentKeywords.value, {
      onStream: (fullContent, delta) => {
        // 第一次收到内容时切换日志
        if (streamingContent.content === '') {
          addLog('文案创作', '已锁定最佳方法论，正在流式生成爆款文案...', 'success')
          generationProgress.value = 50
          // 提前显示内容区域
          generatedContent.value = streamingContent
        }
        streamingContent.content = fullContent
        generationProgress.value = Math.min(50 + Math.floor(fullContent.length / 10), 85)
      }
    })
    
    if (response.data.success) {
      addLog('内容校验', '文案生成完毕，正在进行质量诊断...', 'info')
      generationProgress.value = 90
      
      generatedContent.value = response.data.data
      editedContent.value = { ...response.data.data }
      
      // 1. 生成文案质量分析
      await generateQualityAnalysis()
      
      // 2. 自动开始生成配套图片
      addLog('视觉设计', '正在将文案转化为小红书推荐比例 (3:4) 高清大片...', 'info')
      await generateImages(generatedContent.value.content)
      
      generationProgress.value = 100
      addLog('任务完成', '爆款图文套装已就绪！', 'success')
      message.success('全自动爆款文案已生成！')
      
      // 自动滚动
      setTimeout(() => {
        const target = document.querySelector('.n-space')
        if (target) {
          window.scrollTo({ top: target.scrollHeight, behavior: 'smooth' })
        }
      }, 100)
    }
  } catch (error) {
    console.error('全自动生成失败:', error)
    addLog('生成失败', error.message, 'error')
    message.error('生成失败，请稍后重试')
  } finally {
    // 稍微延迟一下关闭加载状态，让用户看到“任务完成”
    setTimeout(() => {
      generating.value = false
    }, 1500)
  }
}

const handleFrameworkSelected = (frameworkId) => {
  selectedFramework.value = frameworkId
}

const handleGenerate = async () => {
  if (!currentKeywords.value) {
    message.warning('请先输入关键词并点击分析')
    return
  }
  
  if (!selectedFramework.value) {
    message.warning('请选择一个写作框架')
    return
  }
  
  generating.value = true
  generatedImages.value = [] // 重置图片
  
  try {
    const response = await generationAPI.generate(
      currentKeywords.value,
      selectedFramework.value
    )
    
    if (response.data.success) {
      generatedContent.value = response.data.data
      editedContent.value = { ...response.data.data }
      
      // 1. 生成文案质量分析
      generateQualityAnalysis()
      
      // 2. 自动开始生成配套图片
      generateImages(generatedContent.value.content)
      
      message.success('爆款文案已生成，正在为您配套精美图片...')
      // 自动滚动到结果区
      setTimeout(() => {
        window.scrollTo({ top: document.querySelector('.n-space').scrollHeight, behavior: 'smooth' })
      }, 100)
    }
  } catch (error) {
    console.error('生成失败:', error)
    message.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

/**
 * 自动生成配套图片
 * @param {string} content - 文案内容
 */
const generateImages = async (content) => {
  if (!content) {
    console.warn('generateImages: 没有文案内容，取消生成图片')
    return
  }
  
  console.log('--- 开始自动生成配套图片流程 ---')
  imageGenerating.value = true
  try {
    // 1. 先将文案建议转化为专业提示词
    console.log('正在转换文案为提示词...')
    const prompts = await imageGenerationAPI.generatePrompts(content)
    
    if (!prompts || prompts.length === 0) {
      console.warn('未生成有效的图片提示词，prompts:', prompts)
      return
    }

    console.log(`已获得 ${prompts.length} 个提示词，开始并行请求图片生成接口...`)

    // 2. 并行调用图片生成接口
    const imagePromises = prompts.map((prompt, index) => {
      console.log(`正在请求第 ${index + 1} 张图片, 提示词: ${prompt.substring(0, 50)}...`)
      return imageGenerationAPI.generate({ prompt, size: '960x1280' })
    })
    
    const results = await Promise.all(imagePromises)
    console.log('图片生成接口原始结果:', results)

    generatedImages.value = results.filter(r => r.success).map(r => ({ url: r.url }))
    console.log('最终生成的图片列表:', generatedImages.value)
    
    if (generatedImages.value.length > 0) {
      message.success(`成功生成 ${generatedImages.value.length} 张配套图片`)
    } else {
      const firstError = results.find(r => !r.success)?.error || '未知错误'
      message.error(`图片生成失败: ${firstError}`)
    }
  } catch (error) {
    console.error('图片生成流程发生严重错误:', error)
    message.error('图片生成系统异常')
  } finally {
    imageGenerating.value = false
    console.log('--- 图片生成流程结束 ---')
  }
}

const generateQualityAnalysis = async () => {
  if (!generatedContent.value || !selectedFramework.value) {
    return
  }
  
  try {
    const response = await generationAPI.generateAnalysis(
      editedContent.value,
      selectedFramework.value
    )
    
    if (response.data.success) {
      qualityAnalysis.value = response.data.data
    }
  } catch (error) {
    console.error('生成分析失败:', error)
  }
}

const handleRegenerate = () => {
  handleGenerate()
}

const handlePreview = () => {
  showPreview.value = true
}

const handleContentChange = (content) => {
  editedContent.value = content
}
</script>

<style scoped>
.n-space {
  display: flex;
  width: 100%;
}

.n-space.vertical > * {
  width: 100%;
}

.processing-card {
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%);
  border: 1px solid #bae7ff;
}

.processing-title {
  font-size: 18px;
  color: #1890ff;
  display: block;
  margin-bottom: 8px;
}

.framework-selection-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.action-footer {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.generate-btn {
  height: 54px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 8px 20px rgba(24, 160, 88, 0.2);
  transition: all 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(24, 160, 88, 0.3);
}

.hint-text {
  font-size: 13px;
}
</style>







