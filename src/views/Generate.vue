













<template>
  <div class="generate-container">
    <div class="main-content-scroll">
      <n-space vertical :size="24" class="generate-main">
        <!-- 1. 顶部操作区 -->
        <div class="top-actions">
          <n-button @click="showHistory = true" secondary strong round type="info">
            <template #icon><n-icon><history-outlined /></n-icon></template>
            历史记录
          </n-button>
        </div>

        <!-- 选品推荐区 -->
        <ProductPromotion @select="handleProductSelect" />

        <!-- 2. 关键词输入区 -->
        <KeywordInput ref="keywordInputRef" @analyzed="handleQuickGenerate" :analyzing="generating" />
        
        <!-- 3. 生成结果展示区 -->
        <n-space vertical :size="24" v-if="generatedContent || generating">
          <!-- 生成过程状态展示 -->
          <n-card v-if="generating" class="processing-card glass-card">
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

          <!-- 编辑器区域 -->
          <ContentEditor
            v-if="generatedContent"
            :content="generatedContent"
            :images="generatedImages"
            :image-loading="imageGenerating"
            @regenerate="handleRegenerate"
            @preview="handlePreview"
            @content-change="handleContentChange"
            class="glass-card"
          />
          
          <!-- 质量分析 -->
          <QualityAnalysis
            v-if="qualityAnalysis"
            :analysis="qualityAnalysis"
            class="glass-card"
          />
        </n-space>
      </n-space>
    </div>

    <!-- 右侧悬浮预览区 -->
    <div class="preview-sidebar" :class="[previewDevice, { 'has-content': generatedContent || editedContent }]">
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
  DeleteOutlined 
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
.generate-container {
  display: flex;
  height: calc(100vh - 120px);
  gap: 24px;
  position: relative;
}

.main-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
}

.generate-main {
  max-width: 900px;
  margin: 0 auto;
}

.top-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: -12px;
}

.preview-sidebar {
  width: 420px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.preview-sidebar.desktop {
  width: 850px;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 16px !important;
}

.processing-card {
  border: 1px solid #bae7ff !important;
}

.processing-title {
  font-size: 18px;
  color: #1890ff;
  display: block;
  margin-bottom: 8px;
}
</style>







