
<template>
  <div v-if="visible" class="pill-input-wrapper" :class="{ 'with-recommendations': showQuickKeywords }">
    <!-- 已上传图片预览（仅增强模式显示） -->
    <transition name="fade-slide">
      <div v-if="enhancedMode && uploadedImages.length > 0" class="uploaded-image-preview">
        <div class="uploaded-images-grid">
          <div v-for="(img, index) in uploadedImages" :key="index" class="uploaded-image-item">
            <n-image
              :src="img"
              width="60"
              height="60"
              object-fit="cover"
              preview-disabled
              style="border-radius: 8px;"
            />
            <n-button text type="error" size="tiny" class="remove-image-btn" @click="removeImage(index)">
              <template #icon><n-icon size="12"><close-outlined /></n-icon></template>
            </n-button>
          </div>
        </div>
        <n-text depth="3" style="font-size: 12px; margin-left: 8px;">已上传 {{ uploadedImages.length }} 张参考图</n-text>
        <n-button text type="error" size="small" @click="handleRemoveAllImages" style="margin-left: auto;">
          <template #icon><n-icon><delete-outlined /></n-icon></template>
          全部移除
        </n-button>
      </div>
    </transition>
    
    <!-- 设置面板（仅增强模式显示） -->
    <transition name="fade-slide">
      <div v-if="enhancedMode && showSettingsPanel" class="settings-panel">
        <div class="settings-row">
          <div class="setting-item">
            <span class="setting-label">尺寸</span>
            <n-select 
              v-model:value="imageSettings.size" 
              :options="sizeOptions" 
              size="small"
              style="width: 140px"
            />
          </div>
          <div class="setting-item">
            <span class="setting-label">清晰度</span>
            <n-radio-group v-model:value="imageSettings.quality" size="small">
              <n-radio-button value="2K">2K</n-radio-button>
              <n-radio-button value="4K">4K</n-radio-button>
            </n-radio-group>
          </div>
          <div class="setting-item">
            <span class="setting-label">张数</span>
            <n-input-number 
              v-model:value="imageSettings.count" 
              :min="1" 
              :max="15"
              size="small"
              style="width: 80px"
            />
          </div>
          <div class="setting-item">
            <span class="setting-label">广告标语</span>
            <n-switch v-model:value="imageSettings.enableSlogan" size="small" />
          </div>
        </div>
        
        <!-- 广告标语配置（条件显示） -->
        <transition name="fade-slide">
          <div v-if="imageSettings.enableSlogan" class="slogan-config">
            <n-input
              v-model:value="imageSettings.sloganText"
              placeholder="输入广告标语文字..."
              size="small"
              style="flex: 1"
            />
            <n-select
              v-model:value="imageSettings.sloganStyle"
              :options="sloganStyleOptions"
              size="small"
              style="width: 120px"
              placeholder="样式"
            />
          </div>
        </transition>
      </div>
    </transition>
    
    <div class="input-main-pill">
      <!-- 图片上传按钮（仅增强模式显示） -->
      <n-upload
        v-if="enhancedMode"
        ref="uploadRef"
        :show-file-list="false"
        :on-change="handleImageUpload"
        accept="image/*"
        :max="6"
        multiple
        :file-list="fileList"
      >
        <n-button quaternary circle class="add-btn" :type="uploadedImages.length > 0 ? 'primary' : 'default'">
          <template #icon><n-icon><plus-outlined /></n-icon></template>
        </n-button>
      </n-upload>
      
      <n-input
        v-model:value="keywords"
        type="text"
        placeholder="输入关键词或粘贴链接，AI 为您一键创作..."
        :bordered="false"
        class="main-input"
        @keyup.enter="handleAnalyze"
      />

      <div class="input-actions">
        <n-button quaternary circle @click="showQuickKeywords = !showQuickKeywords" :active="showQuickKeywords">
          <template #icon><n-icon><appstore-outlined /></n-icon></template>
        </n-button>
        
        <!-- 设置按钮（仅增强模式显示） -->
        <n-button 
          v-if="enhancedMode"
          quaternary 
          circle 
          @click="showSettingsPanel = !showSettingsPanel" 
          :type="showSettingsPanel ? 'primary' : 'default'"
        >
          <template #icon><n-icon><setting-outlined /></n-icon></template>
        </n-button>
        
        <n-button quaternary circle @click="message.info('语音识别功能开发中...')">
          <template #icon><n-icon><audio-outlined /></n-icon></template>
        </n-button>
        
        <!-- 新模式按钮 -->
        <n-button 
          :type="enhancedMode ? 'primary' : 'default'" 
          circle 
          class="enhanced-mode-btn" 
          @click="toggleEnhancedMode"
          :title="enhancedMode ? '当前：增强模式' : '切换到增强模式'"
        >
          <template #icon>
            <n-icon><rocket-outlined /></n-icon>
          </template>
        </n-button>
        
        <n-button type="primary" circle class="send-btn" @click="handleAnalyze" :loading="analyzing">
          <template #icon><n-icon><arrow-up-outlined /></n-icon></template>
        </n-button>
      </div>
    </div>

    <!-- MCP 工具选择区 -->
    <transition name="fade-slide">
      <div v-if="showQuickKeywords" class="recommendations-area">
        <n-space :size="8">
          <n-button
            v-for="tag in hotKeywords"
            :key="tag.key"
            round
            size="small"
            :type="activeTools.includes(tag.key) ? 'primary' : 'default'"
            :secondary="!activeTools.includes(tag.key)"
            strong
            class="recommend-btn"
            @click="addKeyword(tag)"
          >
            <template #icon>
              <n-icon><component :is="tag.icon" /></n-icon>
            </template>
            {{ tag.label }}
          </n-button>
        </n-space>
      </div>
    </transition>
    
    <!-- 隐藏按钮 -->
    <div class="hide-trigger" @click="visible = false">
      <n-icon><down-outlined /></n-icon>
    </div>
  </div>
  
  <div v-else class="show-trigger-btn" @click="visible = true">
    <n-button circle type="primary" secondary>
      <template #icon><n-icon><up-outlined /></n-icon></template>
    </n-button>
  </div>
</template>

<script setup>
import { ref, watch, h } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  AudioOutlined, 
  PlusOutlined, 
  ArrowUpOutlined, 
  AppstoreOutlined,
  SearchOutlined,
  GlobalOutlined,
  CloudServerOutlined,
  LineChartOutlined,
  ShoppingOutlined,
  DownOutlined,
  UpOutlined,
  RocketOutlined,
  DeleteOutlined,
  SettingOutlined,
  CloseOutlined
} from '@vicons/antd'

const props = defineProps({
  analyzing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyzed', 'enhancedModeChange', 'imageUploaded', 'imageRemoved', 'settingsChanged'])
const message = useMessage()

const keywords = ref('')
const showQuickKeywords = ref(true)
const showSettingsPanel = ref(false)
const visible = ref(true)
const enhancedMode = ref(false)  // 增强模式标志
const uploadedImages = ref([])  // 多图上传支持
const uploadingImage = ref(false)  // 上传中状态
const uploadRef = ref(null)  // 上传组件引用
const fileList = ref([])  // 文件列表，用于控制n-upload状态

// 图像生成设置
const imageSettings = ref({
  size: '1664x928',
  quality: '2K',
  count: 3,
  enableSlogan: false,
  sloganText: '',
  sloganStyle: 'xiaohongshu'
})

// 尺寸选项
const sizeOptions = [
  { label: '1664x928 (横屏)', value: '1664x928' },
  { label: '1024x1024 (正方形)', value: '1024x1024' },
  { label: '720x1280 (竖屏)', value: '720x1280' },
  { label: '1280x720 (16:9)', value: '1280x720' },
  { label: '768x1344', value: '768x1344' },
  { label: '1344x768', value: '1344x768' }
]

// 标语样式选项
const sloganStyleOptions = [
  { label: '小红书标题', value: 'xiaohongshu' },
  { label: '电商促销', value: 'ecommerce' },
  { label: '品牌宣传', value: 'brand' },
  { label: '极简海报', value: 'minimal' }
]

const hotKeywords = [
  { label: '联网搜索', icon: GlobalOutlined, key: 'search' },
  { label: '笔记爬虫', icon: CloudServerOutlined, key: 'crawler' },
  { label: '电商监控', icon: ShoppingOutlined, key: 'monitor' },
  { label: '趋势分析', icon: LineChartOutlined, key: 'trend' }
]

const activeTools = ref(['search', 'crawler'])

const toggleTool = (key) => {
  const index = activeTools.value.indexOf(key)
  if (index > -1) {
    activeTools.value.splice(index, 1)
  } else {
    activeTools.value.push(key)
  }
}

const addKeyword = (tag) => {
  // 不再直接替换关键词，而是切换工具状态
  toggleTool(tag.key)
}

const handleAnalyze = async () => {
  if (!keywords.value.trim()) {
    message.warning('请输入关键词')
    return
  }
  
  emit('analyzed', {
    keywords: keywords.value,
    tools: activeTools.value,
    enhancedMode: enhancedMode.value,
    uploadedImages: uploadedImages.value,
    imageSettings: imageSettings.value
  })
}

// 切换增强模式
const toggleEnhancedMode = () => {
  enhancedMode.value = !enhancedMode.value
  emit('enhancedModeChange', enhancedMode.value)
  
  if (enhancedMode.value) {
    message.success('已切换到增强模式，支持多轮迭代优化')
  } else {
    message.info('已切换到普通模式')
    showSettingsPanel.value = false
  }
}

/**
 * 处理图片上传（支持多图）
 * @param {Object} options - 上传选项
 */
const handleImageUpload = async ({ file }) => {
  if (!file.file) return
  
  // 检查数量限制
  if (uploadedImages.value.length >= 6) {
    message.warning('最多上传6张参考图')
    return
  }
  
  try {
    uploadingImage.value = true
    
    // 将图片转换为Base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Url = e.target.result
      uploadedImages.value.push(base64Url)
      emit('imageUploaded', uploadedImages.value)
      message.success('图片上传成功！')
      uploadingImage.value = false
    }
    reader.onerror = () => {
      message.error('图片读取失败')
      uploadingImage.value = false
    }
    reader.readAsDataURL(file.file)
  } catch (error) {
    console.error('图片上传失败:', error)
    message.error('图片上传失败，请重试')
    uploadingImage.value = false
  }
}

/**
 * 移除单张图片
 */
const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
  emit('imageUploaded', uploadedImages.value)
}

/**
 * 移除所有图片
 */
const handleRemoveAllImages = () => {
  uploadedImages.value = []
  fileList.value = []
  emit('imageRemoved')
  message.info('已移除所有图片')
}

// 兼容旧的单图接口
const uploadedImageUrl = ref(null)
const handleRemoveImage = handleRemoveAllImages

// 监听设置变化
watch(imageSettings, (newSettings) => {
  emit('settingsChanged', newSettings)
}, { deep: true })

const setValues = (data) => {
  keywords.value = data.keywords || ''
}

defineExpose({
  setValues,
  getEnhancedMode: () => enhancedMode.value,
  setEnhancedMode: (val) => { enhancedMode.value = val },
  getUploadedImageUrl: () => uploadedImages.value[0] || null,
  getUploadedImages: () => uploadedImages.value,
  setUploadedImageUrl: (url) => { 
    if (url) uploadedImages.value = [url]
  },
  setUploadedImages: (urls) => { uploadedImages.value = urls || [] },
  clearImage: () => { uploadedImages.value = [] },
  getImageSettings: () => imageSettings.value,
  setImageSettings: (settings) => { Object.assign(imageSettings.value, settings) }
})
</script>

<style scoped>
.pill-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
}

/* 已上传图片预览区 */
.uploaded-image-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  width: 100%;
  max-width: 700px;
}

.uploaded-images-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.uploaded-image-item {
  position: relative;
}

.remove-image-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 2px;
}

/* 设置面板 */
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 700px;
  backdrop-filter: blur(10px);
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.slogan-config {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.input-main-pill {
  width: 100%;
  background: white;
  border-radius: 100px;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 8px 0 16px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.input-main-pill:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
}

/* 上传组件样式 - 限制宽度防止覆盖输入框 */
.input-main-pill :deep(.n-upload) {
  flex-shrink: 0;
  width: auto;
}

.input-main-pill :deep(.n-upload-file-input) {
  width: 34px !important;
  height: 34px !important;
}

.add-btn {
  flex-shrink: 0;
  margin-right: 8px;
}

.main-input {
  flex: 1;
  font-size: 16px;
}

.main-input :deep(.n-input__placeholder) {
  color: #94a3b8;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-btn {
  width: 44px !important;
  height: 44px !important;
  background: #1e293b !important;
}

.enhanced-mode-btn.n-button--primary-type {
  background: linear-gradient(135deg, #ff6b35 0%, #f7b731 25%, #5f27cd 75%, #ffffff 100%) !important;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.tools-area, .recommendations-area {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: 100px;
  border: 1px solid rgba(0,0,0,0.02);
}

.recommend-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 0 16px !important;
}

.recommend-btn:not(.n-button--primary-type) {
  background: #1e293b !important;
  color: white !important;
  border: none !important;
}

.recommend-btn.n-button--primary-type {
  background: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hide-trigger {
  position: absolute;
  right: -40px;
  top: 20px;
  cursor: pointer;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.3s;
}

.pill-input-wrapper:hover .hide-trigger {
  opacity: 1;
}

.show-trigger-btn {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>





