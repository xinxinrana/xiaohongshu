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
        @imageUploaded="handleImageUpload"
        @imageRemoved="handleImageRemove"
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

    <!-- 增强版工作流：满意度反馈模态框 -->
    <SatisfactionModal
      v-model:show="showSatisfactionModal"
      :iteration-count="iterationCount"
      @satisfied="handleSatisfied"
      @edit="handleEdit"
      @close="showSatisfactionModal = false"
    />
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
import { generationAPI, imageGenerationAPI, enhancedAPI } from '../services/api'
import { historyService, enhancedHistoryService } from '../services/history'
import KeywordInput from '../components/KeywordInput.vue'
import ProductPromotion from '../components/ProductPromotion.vue'
import ContentEditor from '../components/ContentEditor.vue'
import QualityAnalysis from '../components/QualityAnalysis.vue'
import Preview from '../components/Preview.vue'
import SatisfactionModal from '../components/SatisfactionModal.vue'

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

// 增强版工作流状态
const enhancedMode = ref(false)
const showSatisfactionModal = ref(false)
const currentSessionId = ref(null)
const iterationCount = ref(0)
const currentPrompts = ref([])
const uploadedImageUrl = ref(null)

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
 * 处理图片上传
 * @param {string} imageUrl - 图片的Base64或URL
 */
const handleImageUpload = (imageUrl) => {
  uploadedImageUrl.value = imageUrl
  console.log('[图片上传成功]', imageUrl.substring(0, 50) + '...')
  message.success('图片已上传，将用于AI分析')
}

/**
 * 处理图片移除
 */
const handleImageRemove = () => {
  uploadedImageUrl.value = null
  console.log('[图片已移除]')
}

/**
 * 一键快捷生成逻辑
 */
const handleQuickGenerate = async (data) => {
  currentKeywords.value = data.keywords
  currentSpecialRequirements.value = data.specialRequirements || ''
  enhancedMode.value = data.enhancedMode || false
  
  // 从 KeywordInput 组件获取已上传的图片URL
  if (keywordInputRef.value) {
    const imgUrl = keywordInputRef.value.getUploadedImageUrl()
    if (imgUrl) {
      uploadedImageUrl.value = imgUrl
      console.log('[检测到上传图片]', imgUrl.substring(0, 50) + '...')
    }
  }
  
  if (!currentKeywords.value) {
    message.warning('请先输入关键词')
    return
  }
  
  // 根据模式选择不同的生成流程
  if (enhancedMode.value) {
    await handleEnhancedGenerate()
  } else {
    await handleNormalGenerate()
  }
}

/**
 * 普通模式生成逻辑（原有功能）
 */
const handleNormalGenerate = async () => {
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
 * 增强版模式生成逻辑
 */
const handleEnhancedGenerate = async () => {
  generating.value = true
  generationProgress.value = 0
  processingLogs.value = []
  generatedImages.value = []
  generatedContent.value = null
  editedContent.value = null
  currentPrompts.value = []
  
  // 初始化会话 ID
  if (!currentSessionId.value) {
    currentSessionId.value = Date.now().toString()
    iterationCount.value = 0
  }
  
  try {
    // 阶段1：生成文案（第1次AI调用）
    addLog('阶段1/4', '正在生成文案内容...', 'info')
    generationProgress.value = 10
    
    const streamingContent = {
      content: ''
    }
    
    const contentResponse = await enhancedAPI.generateContent(
      currentKeywords.value,
      currentSpecialRequirements.value || currentKeywords.value,
      uploadedImageUrl.value,
      (fullContent, delta) => {
        if (streamingContent.content === '') {
          addLog('文案生成', '正在流式生成爆款文案...', 'success')
          generationProgress.value = 25
        }
        streamingContent.content = fullContent
        generatedContent.value = { content: fullContent, isRawText: true }
        editedContent.value = { content: fullContent, isRawText: true }
      }
    )
    
    // 确保文案已生成
    if (!generatedContent.value || !generatedContent.value.content) {
      generatedContent.value = { content: contentResponse.data.content, isRawText: true }
      editedContent.value = { content: contentResponse.data.content, isRawText: true }
    }
    
    generationProgress.value = 35
    addLog('文案完成', `文案已生成，共${generatedContent.value.content.length}字`, 'success')
    
    // 阶段2：生成提示词（第2次AI调用）
    addLog('阶段2/4', '正在生成配图提示词...', 'info')
    generationProgress.value = 40
    
    const promptsResponse = await enhancedAPI.generatePrompts(
      generatedContent.value.content,
      uploadedImageUrl.value
    )
    
    if (promptsResponse.data.success) {
      currentPrompts.value = promptsResponse.data.prompts
      addLog('提示词生成', `已生成${currentPrompts.value.length}个配图提示词`, 'success')
      generationProgress.value = 50
    } else {
      throw new Error('提示词生成失败')
    }
    
    // 阶段3：生成图像
    addLog('阶段3/4', '正在生成配图（预计60秒）...', 'info')
    imageGenerating.value = true
    generationProgress.value = 55
    
    const imagesResponse = await enhancedAPI.generateImages(
      currentPrompts.value,
      uploadedImageUrl.value
    )
    
    if (imagesResponse.data.success) {
      generatedImages.value = imagesResponse.data.images.map(url => ({ url }))
      addLog('图像生成', `成功生成${generatedImages.value.length}张配图`, 'success')
      generationProgress.value = 90
    } else {
      addLog('图像生成', '图片生成失败，但文案已成功', 'warning')
      generationProgress.value = 90
    }
    
    imageGenerating.value = false
    generationProgress.value = 100
    addLog('阶段4/4', '初始生成完成！', 'success')
    
    // 保存到增强版历史
    saveToEnhancedHistory()
    
    message.success('增强版内容生成完成！')
    
    // 延迟显示满意度反馈模态框
    setTimeout(() => {
      generating.value = false
      showSatisfactionModal.value = true
    }, 1000)
    
  } catch (error) {
    console.error('增强版生成失败:', error)
    addLog('生成失败', error.message, 'error')
    message.error(`生成失败：${error.message}`)
    generating.value = false
    imageGenerating.value = false
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

/**
 * 处理用户满意（生成最终质量分析 - 流式输出）
 */
const handleSatisfied = async () => {
  // 立即关闭弹窗，让用户看到流式生成过程
  showSatisfactionModal.value = false
  
  // 初始化质量分析状态（先显示加载中）
  qualityAnalysis.value = {
    isRawText: true,
    analysis: '',
    isStreaming: true
  }
  
  try {
    addLog('质量分析', '正在流式生成质量分析报告...', 'info')
    
    const analysisResponse = await enhancedAPI.generateFinalAnalysis(
      generatedContent.value.content,
      (fullContent, delta) => {
        // 流式更新质量分析内容
        qualityAnalysis.value = {
          isRawText: true,
          analysis: fullContent,
          isStreaming: true
        }
      }
    )
    
    if (analysisResponse.data.success) {
      qualityAnalysis.value = {
        isRawText: true,
        analysis: analysisResponse.data.analysis,
        isStreaming: false
      }
      
      // 更新历史记录
      saveToEnhancedHistory()
      
      message.success('质量分析报告已生成！')
      addLog('分析完成', '质量分析报告已生成', 'success')
    }
  } catch (error) {
    console.error('质量分析失败:', error)
    message.error('质量分析生成失败')
    qualityAnalysis.value = null
  }
}

/**
 * 处理用户修改请求
 */
const handleEdit = async (editData) => {
  try {
    generating.value = true
    processingLogs.value = []
    generationProgress.value = 0
    iterationCount.value++
    
    addLog(`第${iterationCount.value}次修改`, '正在根据您的反馈优化内容...', 'info')
    
    // 第3次AI调用：编辑文案
    addLog('步骤1/3', '正在修改文案...', 'info')
    generationProgress.value = 20
    
    const editedContentResponse = await enhancedAPI.editContent(
      generatedContent.value.content,
      editData.contentFeedback,
      (fullContent, delta) => {
        // 实时更新文案内容（流式输出）
        generatedContent.value = { content: fullContent, isRawText: true }
        editedContent.value = { content: fullContent, isRawText: true }
        if (generationProgress.value < 40) {
          addLog('文案修改', '正在根据您的反馈重新生成文案...', 'success')
          generationProgress.value = 40
        }
      }
    )
    
    generatedContent.value = { content: editedContentResponse.data.content, isRawText: true }
    editedContent.value = { content: editedContentResponse.data.content, isRawText: true }
    generationProgress.value = 50
    
    // 第4次AI调用：优化提示词
    addLog('步骤2/3', '正在优化图片提示词...', 'info')
    const optimizedPromptsResponse = await enhancedAPI.optimizePrompts(
      currentPrompts.value,
      editData.imageFeedback,
      editData.referenceImageUrl
    )
    
    if (optimizedPromptsResponse.data.success) {
      currentPrompts.value = optimizedPromptsResponse.data.prompts
      addLog('提示词优化', `已优化${currentPrompts.value.length}个提示词`, 'success')
      generationProgress.value = 70
    }
    
    // 图像编辑
    addLog('步骤3/3', '正在重新生成图片...', 'info')
    imageGenerating.value = true
    
    const editedImagesResponse = await enhancedAPI.editImages(
      currentPrompts.value,
      editData.referenceImageUrl || uploadedImageUrl.value
    )
    
    if (editedImagesResponse.data.success) {
      generatedImages.value = editedImagesResponse.data.images.map(url => ({ url }))
      addLog('图片重新生成', `成功生成${generatedImages.value.length}张新图片`, 'success')
      generationProgress.value = 100
    }
    
    imageGenerating.value = false
    
    // 保存迭代记录
    saveIterationToHistory({
      content: generatedContent.value.content,
      prompts: currentPrompts.value,
      images: generatedImages.value,
      contentFeedback: editData.contentFeedback,
      imageFeedback: editData.imageFeedback
    })
    
    message.success(`第${iterationCount.value}次优化完成！`)
    addLog('优化完成', `第${iterationCount.value}次优化完成`, 'success')
    
    // 延迟再次显示满意度模态框
    setTimeout(() => {
      generating.value = false
      showSatisfactionModal.value = true
    }, 1000)
    
  } catch (error) {
    console.error('修改失败:', error)
    addLog('修改失败', error.message, 'error')
    message.error('修改失败，请稍后重试')
    generating.value = false
    imageGenerating.value = false
  }
}

/**
 * 保存到增强版历史
 */
const saveToEnhancedHistory = () => {
  enhancedHistoryService.save({
    keywords: currentKeywords.value,
    userMessage: currentSpecialRequirements.value,
    content: generatedContent.value,
    prompts: currentPrompts.value,
    images: generatedImages.value,
    qualityAnalysis: qualityAnalysis.value,
    iterationCount: iterationCount.value,
    uploadedImageUrl: uploadedImageUrl.value
  }, currentSessionId.value)
}

/**
 * 保存迭代记录
 */
const saveIterationToHistory = (iterationData) => {
  enhancedHistoryService.updateIteration(currentSessionId.value, iterationData)
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







