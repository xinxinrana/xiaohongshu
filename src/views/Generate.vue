<template>
  <div class="generate-container">
    <div class="main-content-scroll">
      <div class="generate-main">
        <!-- 初始欢迎与功能区域 -->
        <div v-if="!generatedContent && !generating" class="welcome-dashboard">
          <div class="greeting-section">
            <h1 class="greeting-text">你好 Nixtio，<br/>今天准备好创造爆款了吗？</h1>
            <div class="robot-avatar">
              <img src="/2026115204749.png" alt="AI Robot" class="robot-img" />
              <div class="robot-speech">
                <n-text depth="3">你好呀！👋<br/>需要灵感吗？</n-text>
              </div>
            </div>
          </div>

          <!-- 功能导向卡片 -->
          <div class="feature-cards">
            <div class="feature-card-item">
              <div class="card-icon yellow">
                <n-icon size="24"><block-outlined /></n-icon>
              </div>
              <h3 class="card-title">激发灵感，提供反馈，并同步管理所有创作任务。</h3>
              <n-text depth="3" class="card-tag">快速开始</n-text>
            </div>
            
            <div class="feature-card-item">
              <div class="card-icon colorful">
                <n-icon size="24" color="#10b981"><team-outlined /></n-icon>
              </div>
              <h3 class="card-title">无缝连接，分享创意，轻松达成团队协作目标。</h3>
              <n-text depth="3" class="card-tag">团队协作</n-text>
            </div>

            <div class="feature-card-item">
              <div class="card-icon blue">
                <n-icon size="24"><calendar-outlined /></n-icon>
              </div>
              <h3 class="card-title">高效规划时间，明确创作优先级，保持专注。</h3>
              <n-text depth="3" class="card-tag">计划管理</n-text>
            </div>
          </div>

          <!-- 原有核心功能：选品推荐 -->
          <div class="original-function-section">
            <div class="section-divider">
              <n-divider title-placement="left">选品创作中心</n-divider>
            </div>
            <ProductPromotion @select="handleProductSelect" />
          </div>
        </div>

        <n-space vertical :size="24">
          <!-- 生成过程状态展示 -->
          <n-card v-if="generating" class="processing-card glass-card">
            <n-space vertical :size="12">
              <div class="loading-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <n-spin size="small" />
                <n-text strong class="processing-title">正在为您打造爆款内容...</n-text>
              </div>
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

          <!-- 编辑器区域 (原功能) -->
          <ContentEditor
            v-if="generatedContent"
            :content="generatedContent"
            :images="generatedImages"
            :image-loading="imageGenerating"
            @regenerate="handleRegenerate"
            @preview="handlePreview"
            @content-change="handleContentChange"
            class="editor-section"
          />
          
          <!-- 质量分析 (原功能) -->
          <QualityAnalysis
            v-if="qualityAnalysis"
            :analysis="qualityAnalysis"
            class="analysis-section"
          />
        </n-space>
      </div>
    </div>

    <!-- 底部固定输入区 -->
    <div class="bottom-input-container" :style="{ right: currentSidebarWidth + 'px' }">
      <div class="pro-tip">
        <n-icon size="14" color="#8b5cf6"><star-outlined /></n-icon>
        <n-text depth="3">解锁更多专业功能</n-text>
      </div>
      
      <KeywordInput 
        ref="keywordInputRef" 
        @analyzed="handleQuickGenerate" 
        :analyzing="generating"
        class="floating-input-bar"
      />
    </div>

    <!-- 右侧悬浮预览区 - 仅在生成中或生成后展示 -->
    <div 
      v-if="generatedContent || generating"
      class="preview-sidebar" 
      :class="[previewDevice, { 'has-content': generatedContent || editedContent }]"
    >
      <div class="sidebar-header">
        <n-text strong>实时效果预览</n-text>
        <n-radio-group v-model:value="previewDevice" size="small" type="button">
          <n-radio-button value="mobile">手机</n-radio-button>
          <n-radio-button value="desktop">电脑</n-radio-button>
        </n-radio-group>
      </div>
      <div class="sidebar-content">
        <Preview
          v-if="generatedContent || editedContent"
          :content="editedContent || generatedContent"
          :images="generatedImages"
          :mode="previewDevice"
          compact
        />
        <div v-else class="empty-preview">
          <n-empty description="生成内容后在此实时预览效果" />
        </div>
      </div>
    </div>

    <!-- 历史记录侧边栏 -->
    <n-drawer v-model:show="showHistory" :width="400" placement="left" class="history-drawer">
      <n-drawer-content title="生成历史" closable>
        <n-list hoverable clickable>
          <n-list-item v-for="item in historyList" :key="item.id" @click="loadHistory(item)">
            <template #prefix>
              <n-icon size="24" color="#3b82f6"><file-text-outlined /></n-icon>
            </template>
            <n-thing :title="item.keywords || '无标题生成'">
              <template #description>
                <n-text depth="3">{{ formatDate(item.timestamp) }}</n-text>
              </template>
              <n-ellipsis :line-clamp="1" :tooltip="false">
                {{ typeof item.content === 'string' ? item.content : item.content?.content }}
              </n-ellipsis>
            </n-thing>
            <template #suffix>
              <n-button size="small" quaternary circle type="error" @click.stop="deleteHistory(item.id)">
                <template #icon><n-icon><delete-outlined /></n-icon></template>
              </n-button>
            </template>
          </n-list-item>
        </n-list>
        <template #footer>
          <n-button block quaternary @click="clearHistory" v-if="historyList.length > 0">
            清空所有历史
          </n-button>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  HistoryOutlined, 
  FileTextOutlined, 
  DeleteOutlined,
  BlockOutlined,
  CalendarOutlined,
  StarOutlined,
  TeamOutlined
} from '@vicons/antd'
import { generationAPI, imageGenerationAPI } from '../services/api'
import { historyService } from '../services/history'
import KeywordInput from '../components/KeywordInput.vue'
import ProductPromotion from '../components/ProductPromotion.vue'
import ContentEditor from '../components/ContentEditor.vue'
import QualityAnalysis from '../components/QualityAnalysis.vue'
import Preview from '../components/Preview.vue'

const message = useMessage()

const analysisResult = ref(null)
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
const currentSpecialRequirements = ref('')
const previewDevice = ref('mobile')
const showHistory = ref(false)

// 计算当前侧边栏宽度
const currentSidebarWidth = computed(() => {
  if (!generatedContent.value && !generating.value) return 0
  return previewDevice.value === 'desktop' ? 800 : 400
})

const historyList = ref([])
const keywordInputRef = ref(null)

onMounted(() => {
  loadHistoryList()
})

/**
 * 处理选品点击
 * @param {Object} data 包含关键词和特殊要求的对象
 */
const handleProductSelect = (data) => {
  if (keywordInputRef.value) {
    keywordInputRef.value.setValues(data)
    message.success('已自动填充选品信息，点击“分析并生成内容”开始创作')
  }
}

const loadHistoryList = () => {
  historyList.value = historyService.getAll()
}

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

/**
 * 一键快捷生成逻辑
 */
const handleQuickGenerate = async (data) => {
  currentKeywords.value = data.keywords
  currentSpecialRequirements.value = data.specialRequirements || ''
  if (!currentKeywords.value) {
    message.warning('请先输入关键词')
    return
  }
  
  generating.value = true
  generationProgress.value = 0
  processingLogs.value = []
  generatedImages.value = []
  generatedContent.value = null
  editedContent.value = null
  
  try {
    addLog('行业分析', `正在识别 "${currentKeywords.value}" 领域的顶级博主风格...`, 'info')
    generationProgress.value = 20
    
    const streamingContent = {
      isRawText: true,
      content: '',
      selectedMethodology: '自动匹配顶级博主风格'
    }

    const response = await generationAPI.autoGenerate(currentKeywords.value, {
      specialRequirements: currentSpecialRequirements.value,
      onStream: (fullContent, delta) => {
        if (streamingContent.content === '') {
          addLog('文案创作', '已锁定最佳方法论，正在流式生成爆款文案...', 'success')
          generationProgress.value = 50
          generatedContent.value = streamingContent
        }
        streamingContent.content = fullContent
        editedContent.value = { ...streamingContent }
        generationProgress.value = Math.min(50 + Math.floor(fullContent.length / 10), 85)
      }
    })
    
    if (response.data.success) {
      addLog('内容校验', '文案生成完毕，正在进行质量诊断...', 'info')
      generationProgress.value = 90
      
      generatedContent.value = response.data.data
      editedContent.value = { ...response.data.data }
      
      await generateQualityAnalysis()
      
      addLog('视觉设计', '正在将文案转化为小红书推荐比例 (3:4) 高清大片...', 'info')
      await generateImages(generatedContent.value.content)
      
      generationProgress.value = 100
      addLog('任务完成', '爆款图文套装已就绪！', 'success')
      message.success('全自动爆款文案已生成！')
      
      // 保存到历史
      saveToHistory()
    }
  } catch (error) {
    console.error('全自动生成失败:', error)
    addLog('生成失败', error.message, 'error')
    message.error('生成失败，请稍后重试')
  } finally {
    setTimeout(() => {
      generating.value = false
    }, 1500)
  }
}

/**
 * 自动生成配套图片
 */
const generateImages = async (content) => {
  if (!content) return
  
  imageGenerating.value = true
  try {
    const prompts = await imageGenerationAPI.generatePrompts(content)
    if (!prompts || prompts.length === 0) return

    const imagePromises = prompts.map(prompt => 
      imageGenerationAPI.generate({ prompt, size: '960x1280' })
    )
    
    const results = await Promise.all(imagePromises)
    generatedImages.value = results.filter(r => r.success).map(r => ({ url: r.url }))
    
    if (generatedImages.value.length > 0) {
      message.success(`成功生成 ${generatedImages.value.length} 张配套图片`)
      // 更新历史中的图片
      saveToHistory()
    }
  } catch (error) {
    console.error('图片生成失败:', error)
  } finally {
    imageGenerating.value = false
  }
}

const generateQualityAnalysis = async () => {
  if (!generatedContent.value) return
  
  try {
    const response = await generationAPI.generateAnalysis(
      editedContent.value,
      'viral'
    )
    if (response.data.success) {
      qualityAnalysis.value = response.data.data
    }
  } catch (error) {
    console.error('生成分析失败:', error)
  }
}

const handleRegenerate = () => {
  handleQuickGenerate({ 
    keywords: currentKeywords.value,
    specialRequirements: currentSpecialRequirements.value
  })
}

const handlePreview = () => {
  showPreview.value = true
}

const handleContentChange = (content) => {
  editedContent.value = content
}

/**
 * 历史记录相关逻辑
 */
const saveToHistory = () => {
  historyService.save({
    keywords: currentKeywords.value,
    specialRequirements: currentSpecialRequirements.value,
    content: editedContent.value || generatedContent.value,
    images: generatedImages.value,
    qualityAnalysis: qualityAnalysis.value
  })
  loadHistoryList()
}

const loadHistory = (item) => {
  currentKeywords.value = item.keywords
  currentSpecialRequirements.value = item.specialRequirements || ''
  generatedContent.value = item.content
  editedContent.value = { ...item.content }
  generatedImages.value = item.images || []
  qualityAnalysis.value = item.qualityAnalysis
  showHistory.value = false
  message.success('已恢复历史生成结果')
}

const deleteHistory = (id) => {
  historyService.remove(id)
  loadHistoryList()
  message.info('已删除记录')
}

const clearHistory = () => {
  historyService.clear()
  loadHistoryList()
  message.success('已清空历史记录')
}

const formatDate = (ts) => {
  return new Date(ts).toLocaleString()
}
</script>

<style scoped>
/* 整体容器 */
.generate-container {
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
}

.main-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 40px 40px 160px 40px;
  scrollbar-width: none;
}

.main-content-scroll::-webkit-scrollbar {
  display: none;
}

.generate-main {
  max-width: 1000px;
  margin: 0 auto;
}

/* 欢迎面板样式 */
.welcome-dashboard {
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out;
}

.greeting-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  padding: 0 10px;
}

.greeting-text {
  font-size: 48px;
  line-height: 1.1;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.04em;
  margin: 0;
}

.robot-avatar {
  position: relative;
  width: 100px;
  height: 100px;
}

.robot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.robot-speech {
  position: absolute;
  top: 10px;
  left: -120px;
  background: white;
  padding: 10px 14px;
  border-radius: 16px 16px 2px 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  font-size: 12px;
  white-space: nowrap;
  border: 1px solid rgba(0,0,0,0.03);
  z-index: 10;
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 60px;
}

.feature-card-item {
  background: white;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 4px rgba(0,0,0,0.01);
  transition: all 0.3s ease;
}

.feature-card-item:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.04);
  transform: translateY(-2px);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.yellow { background: #fef9c3; color: #ca8a04; }
.card-icon.blue { background: #dbeafe; color: #2563eb; }
.card-icon.colorful { background: #f1f5f9; }

.card-title {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
  color: #334155;
  margin: 0;
  flex: 1;
}

.card-tag {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

/* 原有功能区 */
.original-function-section {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.04);
}

.section-divider {
  margin-bottom: 20px;
}

/* 状态与编辑器区域 */
.editor-section, .analysis-section, .processing-card {
  background: white !important;
  border-radius: 20px !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02) !important;
}

/* 底部输入区 - 悬浮在最底层且始终可见 */
.bottom-input-container {
  position: fixed; /* 使用 fixed 确保相对于窗口定位 */
  bottom: 0;
  left: 80px; /* 避开左侧瘦身侧边栏宽度 */
  right: 0;
  padding: 10px 40px 30px 40px;
  background: linear-gradient(to top, #f8fafc 85%, rgba(248, 250, 252, 0));
  z-index: 1000; /* 确保在最上层 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none; /* 允许点击穿透背景区域 */
  transition: right 0.5s ease-out;
}

.bottom-input-container > * {
  pointer-events: auto; /* 恢复子元素的交互 */
}

.pro-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  width: 100%;
  max-width: 800px;
  padding: 0 20px;
}

.powered-by {
  margin-left: auto;
  color: #94a3b8;
}

.floating-input-bar {
  width: 100%;
  max-width: 800px;
}

/* 预览侧边栏 */
.preview-sidebar {
  width: 400px;
  height: 100%;
  background: white;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  animation: slideInRight 0.5s ease-out;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.preview-sidebar.desktop {
  width: 800px;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>







