<template>
  <n-layout has-sider class="workbench-layout">
    <!-- 左侧操作栏 -->
    <n-layout-sider
      width="360"
      :native-scrollbar="false"
      bordered
      class="control-sider"
    >
      <div class="sider-content">
        <div class="sider-header">
          <h2 class="app-title">创作工作台</h2>
          <p class="app-desc">AI 驱动的图像生成工具</p>
        </div>

        <!-- 提示词输入区 -->
        <div class="control-group">
          <div class="group-header">
            <span class="label">提示词</span>
            <n-button text size="tiny" type="primary" @click="showTemplates = true">
              <template #icon><n-icon><bulb-outlined /></n-icon></template>
              灵感库
            </n-button>
          </div>
          <n-input
            ref="promptInputRef"
            v-model:value="state.prompt"
            type="textarea"
            placeholder="描述画面细节，例如：一只在雨中漫步的赛博朋克风格猫咪，霓虹灯光..."
            :autosize="{ minRows: 4, maxRows: 8 }"
            class="prompt-input"
            @keydown.ctrl.enter="handleGenerate"
          />
          
          <!-- 负面提示词开关 -->
          <div class="negative-toggle" @click="showNegativePrompt = !showNegativePrompt">
            <div class="toggle-label">
              <n-icon :component="showNegativePrompt ? DownOutlined : RightOutlined" size="12" />
              <span>负面提示词 (不想出现的元素)</span>
            </div>
          </div>
          <n-collapse-transition :show="showNegativePrompt">
            <n-input
              v-model:value="state.negativePrompt"
              type="textarea"
              placeholder="例如：模糊，低质量，多余的手指..."
              :autosize="{ minRows: 2, maxRows: 4 }"
              class="negative-input"
            />
          </n-collapse-transition>
        </div>

        <!-- 主要操作按钮 -->
        <div class="action-area">
          <n-button
            type="primary"
            block
            size="large"
            class="generate-btn"
            :loading="state.isGenerating"
            :disabled="!state.prompt.trim()"
            @click="handleGenerate"
          >
            <template #icon><n-icon><thunderbolt-outlined /></n-icon></template>
            {{ state.isGenerating ? '正在生成...' : '立即生成' }}
          </n-button>
          <div class="shortcut-hint">Ctrl + Enter 快速生成</div>
        </div>

        <n-divider class="section-divider" />

        <!-- 参数设置 -->
        <n-collapse :default-expanded-names="['settings']" arrow-placement="right">
          <n-collapse-item title="参数设置" name="settings">
            <div class="param-item">
              <div class="param-label">画面比例</div>
              <n-select 
                v-model:value="state.params.size" 
                :options="sizeOptions" 
                size="small"
              />
            </div>
            
            <div class="param-item">
              <div class="param-label">生成数量: {{ state.params.count }}</div>
              <n-slider 
                v-model:value="state.params.count" 
                :min="1" 
                :max="8" 
                :step="1"
                class="param-slider"
              />
            </div>

            <div class="param-item">
              <div class="param-label">画质精度</div>
              <n-radio-group v-model:value="state.params.resolution" size="small" class="full-width-radio">
                <n-radio-button value="2K" class="flex-1">标准 (2K)</n-radio-button>
                <n-radio-button value="4K" class="flex-1">高清 (4K)</n-radio-button>
              </n-radio-group>
            </div>
          </n-collapse-item>

          <n-collapse-item title="参考图片 (垫图)" name="reference">
            <n-upload
              multiple
              directory-dnd
              :max="6"
              accept="image/*"
              :default-file-list="state.referenceImages"
              list-type="image-card"
              :on-change="handleUploadChange"
              :on-remove="handleUploadRemove"
              class="ref-upload"
            >
              <n-upload-dragger class="mini-dragger">
                <div class="upload-icon">
                  <n-icon :depth="3"><cloud-upload-outlined /></n-icon>
                </div>
                <div class="upload-text">点击或拖拽</div>
              </n-upload-dragger>
            </n-upload>
          </n-collapse-item>
        </n-collapse>
      </div>
    </n-layout-sider>

    <!-- 右侧展示区 -->
    <n-layout-content class="main-content-area">
      <div class="main-header">
        <div class="mode-switch">
          <n-radio-group v-model:value="state.currentMode" size="medium">
            <n-radio-button value="auto">通用模式</n-radio-button>
            <n-radio-button value="storybook">故事绘本</n-radio-button>
            <n-radio-button value="comic">连环画</n-radio-button>
          </n-radio-group>
        </div>
        
        <div class="header-actions">
          <n-button 
            size="small" 
            secondary 
            @click="handleDownloadAll" 
            :disabled="!state.generatedImages.length"
          >
            <template #icon><n-icon><download-outlined /></n-icon></template>
            批量下载
          </n-button>
          <n-button 
            size="small" 
            secondary 
            type="error" 
            @click="handleClearAll" 
            :disabled="!state.generatedImages.length"
          >
            <template #icon><n-icon><delete-outlined /></n-icon></template>
            清空
          </n-button>
        </div>
      </div>

      <div class="canvas-area">
        <!-- 生成状态 -->
        <transition name="fade">
          <div v-if="state.isGenerating" class="generating-overlay">
            <div class="generating-card">
              <n-spin size="medium" />
              <div class="generating-text">AI 正在绘制精彩画面...</div>
              <n-progress 
                type="line" 
                :percentage="state.progress" 
                :show-indicator="true"
                processing
                status="success"
                style="width: 240px; margin-top: 12px;"
              />
            </div>
          </div>
        </transition>

        <!-- 结果展示 -->
        <div v-if="state.generatedImages.length > 0" class="image-waterfall">
          <div 
            v-for="(img, index) in state.generatedImages" 
            :key="img.id" 
            class="image-card"
          >
            <div class="image-wrapper">
              <n-image
                :src="img.url"
                :alt="`Generated ${index + 1}`"
                object-fit="cover"
                lazy
                preview-disabled
                class="result-image"
              />
              <!-- 悬浮操作层 -->
              <div class="image-actions">
                <n-image
                  :src="img.url"
                  class="hidden-preview-trigger"
                  style="display: none"
                  ref="previewRefs"
                />
                <!-- 自定义预览按钮 -->
                <n-button circle secondary class="action-btn" @click="() => showPreview(img.url)">
                  <template #icon><n-icon><eye-outlined /></n-icon></template>
                </n-button>
                <n-button circle secondary class="action-btn" @click="handleDownloadImage(img)">
                  <template #icon><n-icon><download-outlined /></n-icon></template>
                </n-button>
                <n-button circle secondary type="error" class="action-btn" @click="handleDeleteImage(img.id)">
                  <template #icon><n-icon><delete-outlined /></n-icon></template>
                </n-button>
              </div>
            </div>
            <div class="image-info">
              <div class="image-meta">{{ formatTime(img.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-placeholder">
          <div class="empty-content">
            <n-icon size="64" color="#e0e0e0">
              <bg-colors-outlined />
            </n-icon>
            <h3>开始您的创作</h3>
            <p>在左侧输入提示词，让 AI 为您描绘想象</p>
          </div>
        </div>
      </div>
    </n-layout-content>

    <!-- 模板库弹窗 -->
    <n-modal v-model:show="showTemplates" preset="card" title="灵感模板库" style="width: 600px" class="template-modal">
      <n-grid :cols="2" :x-gap="12" :y-gap="12">
        <n-grid-item v-for="template in promptTemplates" :key="template.id">
          <div class="template-card" @click="applyTemplate(template)">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-desc">{{ template.prompt }}</div>
            <div class="template-apply">使用此模板</div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-modal>
  </n-layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NButton,
  NInput,
  NInputNumber,
  NSelect,
  NSlider,
  NRadioGroup,
  NRadioButton,
  NUpload,
  NUploadDragger,
  NImage,
  NIcon,
  NSpin,
  NProgress,
  NModal,
  NCollapseTransition,
  NCollapse,
  NCollapseItem,
  NDivider,
  NGrid,
  NGridItem,
  NEmpty,
  useMessage
} from 'naive-ui'
import {
  CloudUploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  RightOutlined,
  DownOutlined,
  BgColorsOutlined,
  EyeOutlined
} from '@vicons/antd'
import { imageWorkbenchAPI } from '@/services/api'

const message = useMessage()
const promptInputRef = ref(null)
const showTemplates = ref(false)
const showNegativePrompt = ref(false)

// 核心状态
const state = reactive({
  currentMode: 'auto',
  params: {
    resolution: '2K',
    size: '1664x928',
    count: 4
  },
  referenceImages: [],
  prompt: '',
  negativePrompt: '',
  generatedImages: [],
  isGenerating: false,
  progress: 0
})

// 尺寸选项
const sizeOptions = [
  { label: '1664x928 (横屏 16:9)', value: '1664x928' },
  { label: '1024x1024 (正方形 1:1)', value: '1024x1024' },
  { label: '720x1280 (竖屏 9:16)', value: '720x1280' },
  { label: '1280x720 (横屏 16:9)', value: '1280x720' },
  { label: '768x1344 (竖屏)', value: '768x1344' },
  { label: '1344x768 (横屏)', value: '1344x768' },
  { label: '832x1216 (竖屏)', value: '832x1216' },
  { label: '1216x832 (横屏)', value: '1216x832' }
]

// 提示词模板
const promptTemplates = [
  { id: 1, title: '小红书产品图', prompt: '高品质产品摄影，柔和自然光，白色简约背景，专业广告级别，细节清晰，极简主义风格' },
  { id: 2, title: '治愈系风景', prompt: '治愈系风景插画，温暖色调，柔和光影，清新自然，宫崎骏风格，细腻质感' },
  { id: 3, title: '美食特写', prompt: '美食摄影，浅景深，暖色调，食物纹理细腻，食欲诱人，专业美食杂志风格' },
  { id: 4, title: '时尚穿搭', prompt: '时尚街拍风格，都市感，自然光线，简约背景，穿搭展示，时尚杂志质感' },
  { id: 5, title: '可爱插画', prompt: '可爱卡通插画，柔和色彩，圆润线条，萌系风格，治愈感，扁平化设计' },
  { id: 6, title: '赛博朋克', prompt: '赛博朋克风格，霓虹灯光，高科技感，未来城市，雨夜，电影质感' }
]

// 文件上传处理
const handleUploadChange = ({ fileList }) => {
  state.referenceImages = fileList
}

const handleUploadRemove = ({ file }) => {
  state.referenceImages = state.referenceImages.filter(f => f.id !== file.id)
}

// 预览图片
const showPreview = (url) => {
  // 创建一个临时 Image 对象来触发预览，或者使用 naive-ui 的 createDiscreteApi
  // 这里简化处理，直接打开新标签页或使用一个全屏模态框
  // 为了更好的体验，我们在模板中放置了隐藏的 n-image，可以通过数据驱动来显示
  // 但 n-image 的 API 比较简单，这里我们简单实现一个全屏预览
  window.open(url, '_blank')
}

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 生成图像
const handleGenerate = async () => {
  if (!state.prompt.trim()) {
    message.warning('请输入提示词')
    return
  }

  state.isGenerating = true
  state.progress = 0

  try {
    // 准备参考图URL数组
    const referenceImageUrls = []
    for (const file of state.referenceImages) {
      if (file.url) {
        referenceImageUrls.push(file.url)
      } else if (file.file) {
        const base64 = await fileToBase64(file.file)
        referenceImageUrls.push(base64)
      }
    }

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (state.progress < 90) {
        state.progress += 5
      }
    }, 300)

    let result
    const params = {
      prompt: state.prompt,
      max_images: state.params.count,
      size: state.params.size,
      resolution: state.params.resolution,
      negative_prompt: state.negativePrompt || undefined
    }

    if (referenceImageUrls.length > 0) {
      result = await imageWorkbenchAPI.batchGeneration({
        ...params,
        referenceImages: referenceImageUrls
      })
    } else {
      result = await imageWorkbenchAPI.batchGeneration(params)
    }

    clearInterval(progressInterval)
    state.progress = 100

    if (result.success && result.data?.image_urls) {
      const newImages = result.data.image_urls.map((url, index) => ({
        id: `${Date.now()}-${index}`,
        url: url,
        prompt: state.prompt,
        timestamp: new Date().toISOString()
      }))
      state.generatedImages = [...newImages, ...state.generatedImages]
      message.success(`成功生成 ${result.data.image_urls.length} 张图像`)
    } else {
      message.error(result.error || '图像生成失败')
    }
  } catch (error) {
    console.error('生成失败:', error)
    message.error('生成失败: ' + error.message)
  } finally {
    state.isGenerating = false
    setTimeout(() => {
      state.progress = 0
    }, 1000)
  }
}

// 文件转Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 下载单张图片
const handleDownloadImage = (img) => {
  const link = document.createElement('a')
  link.href = img.url
  link.download = `generated-${img.id}.png`
  link.click()
}

// 删除图片
const handleDeleteImage = (id) => {
  state.generatedImages = state.generatedImages.filter(img => img.id !== id)
}

// 下载全部
const handleDownloadAll = () => {
  state.generatedImages.forEach((img, index) => {
    setTimeout(() => {
      handleDownloadImage(img)
    }, index * 500)
  })
}

// 清空全部
const handleClearAll = () => {
  state.generatedImages = []
}

// 应用模板
const applyTemplate = (template) => {
  state.prompt = template.prompt
  showTemplates.value = false
  message.success('已应用模板')
}
</script>

<style scoped>
.workbench-layout {
  height: calc(100vh - 64px); /* 假设顶部导航栏约64px，如果不确定可以设为 100vh */
  background-color: #f7f9fb;
}

.control-sider {
  background-color: #fff;
  border-right: 1px solid #eee;
}

.sider-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sider-header {
  margin-bottom: 24px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.app-desc {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.control-group {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.negative-toggle {
  margin-top: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  transition: color 0.2s;
}

.toggle-label:hover {
  color: #333;
}

.negative-input {
  margin-top: 8px;
  font-size: 12px;
}

.action-area {
  margin-bottom: 24px;
}

.generate-btn {
  font-weight: 600;
  letter-spacing: 1px;
}

.shortcut-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.section-divider {
  margin: 0 0 24px 0;
}

.param-item {
  margin-bottom: 16px;
}

.param-label {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
}

.full-width-radio {
  display: flex;
  width: 100%;
}

.flex-1 {
  flex: 1;
  text-align: center;
}

/* 右侧内容区样式 */
.main-content-area {
  background-color: #f7f9fb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.canvas-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  position: relative;
}

/* 瀑布流/网格布局 */
.image-waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}

.image-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9; /* 默认比例，实际应根据图片调整，这里统一下 */
  overflow: hidden;
  background: #f0f0f0;
}

.result-image {
  width: 100%;
  height: 100%;
  display: block;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  backdrop-filter: blur(2px);
}

.image-card:hover .image-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #333 !important;
}

.action-btn:hover {
  background: #fff !important;
  transform: scale(1.1);
}

.image-info {
  padding: 10px 12px;
  font-size: 12px;
  color: #888;
  border-top: 1px solid #f5f5f5;
}

/* 空状态 */
.empty-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-content {
  text-align: center;
}

.empty-content h3 {
  color: #333;
  margin: 16px 0 8px;
  font-weight: 600;
}

/* 生成中遮罩 */
.generating-overlay {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.generating-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 24px 48px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.generating-text {
  margin-top: 12px;
  font-weight: 500;
  color: #333;
}

/* 模板卡片 */
.template-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}

.template-card:hover {
  border-color: #2080f0;
  background: #f0f9ff;
}

.template-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.template-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.template-apply {
  font-size: 12px;
  color: #2080f0;
  text-align: right;
}

/* 上传组件微调 */
.ref-upload :deep(.n-upload-trigger) {
  width: 100%;
}

.mini-dragger {
  padding: 16px !important;
  background: #f9f9f9;
  border: 1px dashed #ddd;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
  color: #666;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
