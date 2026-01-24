<template>
  <div class="workbench-container">
    <!-- 左侧配置栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <n-h2 style="margin: 0; font-size: 20px;">
          <n-icon size="24" color="#2080f0" style="vertical-align: middle; margin-right: 8px;">
            <laptop-outlined />
          </n-icon>
          智能创作工作台
        </n-h2>
        <n-text depth="3" style="font-size: 12px; margin-left: 32px;">Xiaohongshu Agent v2.0</n-text>
      </div>

      <n-divider style="margin: 16px 0;" />

      <n-form
        ref="formRef"
        :model="formData"
        label-placement="top"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <n-form-item label="创作模式" path="action">
          <n-radio-group v-model:value="formData.action" name="mode">
            <n-space vertical>
              <n-radio value="auto">
                <div class="radio-content">
                  <span class="radio-title">智能规划 (Auto)</span>
                  <span class="radio-desc">Agent 自动分析需求并规划最佳执行路径</span>
                </div>
              </n-radio>
              <n-radio value="quick">
                <div class="radio-content">
                  <span class="radio-title">快速生成 (Quick)</span>
                  <span class="radio-desc">跳过复杂分析，仅生成文案，速度最快</span>
                </div>
              </n-radio>
              <n-radio value="full">
                <div class="radio-content">
                  <span class="radio-title">完整流程 (Full)</span>
                  <span class="radio-desc">包含质量评估和自我修正，追求最高质量</span>
                </div>
              </n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="核心关键词" path="keywords">
          <n-input
            v-model:value="formData.keywords"
            type="textarea"
            placeholder="例如：夏季穿搭、显瘦、法式风情"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="创作需求" path="userMessage">
          <n-input
            v-model:value="formData.userMessage"
            type="textarea"
            placeholder="例如：希望语气活泼一点，突出性价比，适合学生党"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
        </n-form-item>

        <n-form-item label="参考图片 (可选)" path="uploadedImageUrl">
          <n-upload
            :default-upload="false"
            @change="handleImageChange"
            list-type="image-card"
            :max="1"
            accept="image/*"
            v-model:file-list="fileList"
          >
            <div>点击上传</div>
          </n-upload>
          <n-text depth="3" style="font-size: 12px; margin-top: 8px; display: block;">
            支持上传本地图片，AI 将分析图片风格进行创作
          </n-text>
        </n-form-item>

        <n-button 
          type="primary" 
          block 
          size="large" 
          :loading="loading" 
          @click="handleGenerate"
          style="margin-top: 24px;"
        >
          <template #icon>
            <n-icon><thunderbolt-outlined /></n-icon>
          </template>
          开始智能创作
        </n-button>
      </n-form>
    </div>

    <!-- 右侧主区域 -->
    <div class="main-area">
      <!-- 顶部状态步进器 -->
      <div class="status-bar" v-if="loading || hasResult">
        <n-steps :current="currentStepIndex" :status="stepStatus">
          <n-step title="智能规划" description="分析意图" />
          <n-step title="多模态分析" description="视觉理解" />
          <n-step title="框架匹配" description="结构优化" />
          <n-step title="文案创作" description="内容生成" />
          <n-step title="质量评估" description="自我修正" />
          <n-step title="配图生成" description="视觉呈现" />
        </n-steps>
      </div>

      <div class="content-wrapper">
        <!-- 左侧：执行日志 -->
        <div class="log-panel" v-if="loading || logs.length > 0">
          <div class="panel-header">
            <n-icon><code-outlined /></n-icon>
            <span>Agent 执行日志</span>
          </div>
          <div class="log-content" ref="logContentRef">
            <div v-if="logs.length === 0" class="empty-logs">等待任务开始...</div>
            <div v-else v-for="(log, index) in logs" :key="index" class="log-item">
              <span class="log-time">[{{ formatTime(log.timestamp) }}]</span>
              <span class="log-step" :class="getStepClass(log.step)">
                <n-icon v-if="getStepClass(log.step) === 'text-success'" style="vertical-align: text-bottom; margin-right: 2px;">
                  <check-circle-outlined />
                </n-icon>
                <n-icon v-else-if="getStepClass(log.step) === 'text-error'" style="vertical-align: text-bottom; margin-right: 2px;">
                  <warning-outlined />
                </n-icon>
                {{ log.step }}
              </span>
              <span class="log-detail">{{ formatLogDetail(log.data) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：结果展示 -->
        <div class="result-panel">
          <div class="panel-header" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <n-icon><file-text-outlined /></n-icon>
              <span>生成结果</span>
            </div>
            <!-- 预览模式切换 -->
            <n-radio-group v-if="hasResult" v-model:value="previewMode" size="small">
              <n-radio-button value="mobile">手机预览</n-radio-button>
              <n-radio-button value="desktop">电脑预览</n-radio-button>
            </n-radio-group>
          </div>
          
          <div v-if="!hasResult && !loading" class="empty-state">
            <n-empty description="在左侧输入信息，开始您的创作之旅">
              <template #icon>
                <n-icon><robot-outlined /></n-icon>
              </template>
            </n-empty>
          </div>

          <div v-else-if="loading && !hasResult" class="loading-state">
            <n-spin size="large" description="Agent 正在思考中..." />
          </div>

          <div v-else class="result-content" style="padding: 0; background: #f0f2f5;">
            <!-- 质量评分条 -->
            <div v-if="result.quality" style="padding: 12px 16px; background: white; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;">
               <div style="display: flex; align-items: center; gap: 12px;">
                  <n-statistic label="" :value="result.quality.data.overall_score">
                    <template #prefix>质量评分: </template>
                    <template #suffix> / 10</template>
                  </n-statistic>
                  <n-tag v-if="result.quality.data.overall_score >= 7" type="success" size="small">
                    <template #icon><n-icon><check-circle-outlined /></n-icon></template>
                    优秀
                  </n-tag>
                  <n-tag v-else type="warning" size="small">
                    <template #icon><n-icon><warning-outlined /></n-icon></template>
                    需优化
                  </n-tag>
               </div>
               <n-button size="small" secondary type="primary" @click="copyContent">
                  <template #icon><n-icon><copy-outlined /></n-icon></template>
                  复制文案
                </n-button>
            </div>

            <!-- 预览组件 -->
            <div style="padding: 20px; height: calc(100% - 60px); overflow-y: auto; display: flex; justify-content: center;">
              <Preview 
                :content="result.content?.data" 
                :images="formattedImages"
                :mode="previewMode"
                :compact="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted, nextTick, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  LaptopOutlined, 
  ThunderboltOutlined, 
  CodeOutlined, 
  FileTextOutlined, 
  RobotOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CopyOutlined
} from '@vicons/antd'
import { agentAPI } from '../services/api'
import Preview from '../components/Preview.vue'

const message = useMessage()
const logContentRef = ref(null)

// 表单数据
const formData = reactive({
  action: 'auto',
  keywords: '',
  userMessage: '',
  uploadedImageUrl: ''
})

// 状态
const loading = ref(false)
const fileList = ref([]) // 文件列表
const logs = ref([])
const result = ref({})
const hasResult = ref(false)
const previewMode = ref('mobile')
let pollTimer = null

// 步骤控制
const currentStepIndex = ref(0)
const stepStatus = ref('process')

const formattedImages = computed(() => {
  if (result.value.image?.data?.image_urls) {
    return result.value.image.data.image_urls.map(url => ({ url }))
  }
  if (result.value.image?.image_urls) {
    return result.value.image.image_urls.map(url => ({ url }))
  }
  if (result.value.image_urls) {
    return result.value.image_urls.map(url => ({ url }))
  }
  return []
})

const stepsMap = {
  'Agent 开始执行': 0,
  '智能规划结果': 0,
  '多模态分析参考图片': 1,
  '分析创作框架': 2,
  '生成文案内容': 3,
  '评估内容质量': 4,
  '质量未达标,触发自我修正': 4,
  '生成图像提示词': 5,
  '生成配套图像': 5,
  '图像生成结果': 5,
  'Agent 执行完成': 6
}

// 监听日志更新步骤
watch(logs, (newLogs) => {
  if (newLogs.length === 0) return
  const lastLog = newLogs[newLogs.length - 1]
  const stepName = lastLog.step
  
  // 实时解析中间结果
  try {
    const logData = typeof lastLog.data === 'string' ? JSON.parse(lastLog.data) : lastLog.data
    
    // 1. 捕获文案内容 (如果尚未有内容)
    if ((stepName === '生成文案内容' || stepName === '自我修正完成') && logData?.data?.content) {
      if (!result.value.content) result.value.content = { data: {} }
      result.value.content.data.content = logData.data.content
    }
    
    // 2. 捕获质量评估结果
    if ((stepName === '评估内容质量' || stepName === '质量未达标,触发自我修正') && logData?.data?.overall_score) {
      if (!result.value.quality) result.value.quality = { data: {} }
      result.value.quality.data = logData.data
    }
    
    // 3. 捕获图像提示词
    if (stepName === '生成图像提示词' && logData?.data?.prompts) {
      if (!result.value.prompts) result.value.prompts = { data: {} }
      result.value.prompts.data = logData.data
    }

    if (stepName === '图像生成结果' && (logData?.image_urls || logData?.data?.image_urls)) {
      const imageUrls = logData.image_urls || logData.data.image_urls
      if (!result.value.image) result.value.image = { data: {} }
      result.value.image.data.image_urls = imageUrls
      result.value.image.data.count = logData.count || logData.data?.count || imageUrls.length
    }
    
    // 5. 捕获生成结果 (兜底机制：如果API超时，通过日志获取最终结果)
    if (stepName === 'Agent 执行结果' && loading.value) {
      console.log('通过日志捕获到最终结果')
      // 合并结果
      result.value = { ...result.value, ...logData }
      hasResult.value = true
      stepStatus.value = 'finish'
      currentStepIndex.value = 6
      loading.value = false
      stopPollingLogs()
      message.success('创作完成！')
    }
  } catch (e) {
    console.warn('解析日志数据失败', e)
  }

  if (stepsMap[stepName] !== undefined) {
    currentStepIndex.value = stepsMap[stepName]
    // 自动滚动日志
    nextTick(() => {
      if (logContentRef.value) {
        logContentRef.value.scrollTop = logContentRef.value.scrollHeight
      }
    })
  }
}, { deep: true })

const handleImageChange = (options) => {
  const { file, fileList: newFileList } = options
  
  // 如果是移除操作
  if (options.event === 'remove') {
    formData.uploadedImageUrl = ''
    fileList.value = newFileList
    return
  }
  
  // 检查是否有文件
  if (!file || !file.file) return

  // 检查文件类型
  if (!file.file.type.startsWith('image/')) {
    message.error('只能上传图片文件')
    // 移除不合法文件
    return
  }

  // 检查大小 (10MB)
  if (file.file.size > 10 * 1024 * 1024) {
    message.error('图片大小不能超过 10MB')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.uploadedImageUrl = e.target.result
      message.success('图片加载成功')
    }
    reader.onerror = () => {
      message.error('图片读取失败')
      // 出错时移除该文件
      fileList.value = fileList.value.filter(f => f.id !== file.id)
    }
    reader.readAsDataURL(file.file)
  } catch (error) {
    console.error('图片处理错误:', error)
    message.error('图片处理错误')
  }
}

const handleGenerate = async () => {
  if (!formData.keywords && !formData.uploadedImageUrl) {
    message.warning('请输入关键词或上传参考图片')
    return
  }

  loading.value = true
  hasResult.value = false
  logs.value = []
  result.value = {}
  currentStepIndex.value = 0
  stepStatus.value = 'process'

  // 清空后端历史
  try {
    await agentAPI.clearHistory()
  } catch (e) {
    console.warn('清空历史失败', e)
  }

  // 开始轮询日志
  startPollingLogs()

  try {
    const res = await agentAPI.generate(formData)
    
    if (res.success) {
      result.value = res.data
      hasResult.value = true
      stepStatus.value = 'finish'
      currentStepIndex.value = 6 // 完成
      message.success('创作完成！')
    } else {
      stepStatus.value = 'error'
      message.error(res.error || '生成失败')
    }
  } catch (error) {
    console.error(error)
    stepStatus.value = 'error'
    message.error('请求失败，请检查网络或后端服务')
  } finally {
    loading.value = false
    stopPollingLogs()
    // 最后再拉取一次完整日志
    await fetchLogs()

    // 关键修复：如果请求失败/超时，尝试从日志中恢复结果
    if (!hasResult.value && logs.value.length > 0) {
      const resultLog = logs.value.find(log => log.step === 'Agent 执行结果')
      if (resultLog && resultLog.data) {
        console.log('从日志中恢复结果:', resultLog.data)
        result.value = resultLog.data
        hasResult.value = true
        stepStatus.value = 'finish'
        currentStepIndex.value = 6
        message.success('创作完成（从历史记录恢复）')
      }
    }
  }
}

const startPollingLogs = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = setInterval(fetchLogs, 1000)
}

const stopPollingLogs = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
}

const fetchLogs = async () => {
  try {
    const res = await agentAPI.getHistory()
    if (res.success) {
      logs.value = res.data
    }
  } catch (e) {
    console.error('获取日志失败', e)
  }
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString()
}

const formatLogDetail = (data) => {
  if (!data) return ''
  if (typeof data === 'string') return data
  // 简化显示
  const simpleData = { ...data }
  if (simpleData.content && simpleData.content.length > 50) {
    simpleData.content = simpleData.content.substring(0, 50) + '...'
  }
  return JSON.stringify(simpleData)
}

const getStepClass = (step) => {
  if (step.includes('失败') || step.includes('错误')) return 'text-error'
  if (step.includes('成功') || step.includes('完成')) return 'text-success'
  return 'text-info'
}

const copyContent = () => {
  if (result.value.content?.data?.content) {
    navigator.clipboard.writeText(result.value.content.data.content)
    message.success('已复制到剪贴板')
  }
}

onUnmounted(() => {
  stopPollingLogs()
})
</script>

<style scoped>
.workbench-container {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.sidebar {
  width: 380px;
  background: white;
  border-right: 1px solid #eef2f6;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}

.radio-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.radio-title {
  font-weight: 500;
  color: #333;
}

.radio-desc {
  font-size: 12px;
  color: #999;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
}

.status-bar {
  background: white;
  padding: 20px 40px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.content-wrapper {
  display: flex;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

.log-panel, .result-panel {
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  overflow: hidden;
}

.log-panel {
  width: 40%;
  border: 1px solid #eef2f6;
}

.result-panel {
  flex: 1;
  border: 1px solid #eef2f6;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fafafc;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.log-item {
  margin-bottom: 8px;
  line-height: 1.5;
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
}

.log-time {
  color: #888;
  margin-right: 8px;
}

.log-step {
  font-weight: bold;
  margin-right: 8px;
  color: #4ec9b0;
}

.log-detail {
  color: #ce9178;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-display pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.generated-image {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-state, .loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.text-error { color: #f87171 !important; }
.text-success { color: #4ade80 !important; }
.text-info { color: #60a5fa !important; }

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>
