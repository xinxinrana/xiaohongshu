



















<template>
  <div :class="['preview-root', { 'is-compact': compact }]">
    <n-card :title="compact ? '' : '👀 实时效果预览'" :bordered="!compact" :class="{ 'compact-card': compact }">
      <template #header-extra v-if="!compact">
        <n-radio-group v-model:value="internalMode" size="small" type="button">
          <n-radio-button value="mobile">手机端</n-radio-button>
          <n-radio-button value="desktop">电脑端</n-radio-button>
        </n-radio-group>
      </template>
      
      <div :class="['preview-wrapper', displayMode]">
        <div :class="['preview-container', displayMode]">
          <div :class="['xiaohongshu-post', displayMode]">
            <!-- 图片展示区 (在桌面模式下可能在左侧) -->
            <div class="post-images" v-if="(images && images.length) || (content && content.images && content.images.length)">
              <n-carousel show-arrow dot-type="line" class="preview-carousel">
                <div v-for="(img, index) in images" :key="'gen-' + index" class="image-item">
                  <n-image
                    width="100%"
                    :height="displayMode === 'mobile' ? '400px' : '600px'"
                    :src="img.url"
                    object-fit="cover"
                    preview-disabled
                  />
                  <div class="image-overlay">
                    <n-button 
                      circle 
                      type="primary"
                      size="medium"
                      @click="downloadImage(img.url, index)"
                      class="download-btn"
                    >
                      <template #icon>
                        <n-icon><download-outlined /></n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
                <div v-for="(img, index) in (content?.images || [])" :key="'sug-' + index" class="image-placeholder">
                  <div class="placeholder-content">
                    <n-icon size="32">🖼️</n-icon>
                    <n-text strong size="small">{{ img.type }}</n-text>
                    <n-text depth="3" style="font-size: 12px;">{{ img.description }}</n-text>
                  </div>
                </div>
              </n-carousel>
            </div>

            <div class="post-right-section">
              <!-- 模拟头部 -->
              <div class="post-header">
                <n-avatar round size="medium" src="/2026115204749.png" />
                <div class="user-info">
                  <n-text strong size="small">AI 创作者</n-text>
                  <n-text depth="3" style="font-size: 11px;">刚刚 · 发布于 AI 实验室</n-text>
                </div>
                <n-button quaternary circle size="small">
                  <template #icon><n-icon><plus-outlined /></n-icon></template>
                </n-button>
              </div>
              
              <div class="post-content-area">
                <template v-if="content">
                  <template v-if="content.isRawText">
                    <div class="post-body raw-text-body">{{ content.content }}</div>
                  </template>
                  <template v-else>
                    <n-text tag="h3" strong class="post-title">{{ content.title }}</n-text>
                    <div class="post-body" v-html="formatContent(content.body)"></div>
                  </template>
                  
                  <n-space class="post-tags" :size="4" v-if="!content.isRawText && content.tags">
                    <n-text
                      v-for="(tag, index) in content.tags"
                      :key="index"
                      class="tag-link"
                    >
                      {{ tag }}
                    </n-text>
                  </n-space>
                </template>
                
                <n-divider />
                
                <div class="post-footer">
                  <n-text depth="3" style="font-size: 12px;">编辑于 {{ new Date().toLocaleDateString() }}</n-text>
                </div>
              </div>
              
              <!-- 模拟互动栏 -->
              <div class="post-actions-bar">
                <n-space justify="space-around" align="center" style="width: 100%">
                  <div class="action-item" @click="toggleLike">
                    <n-text :style="{ color: isLiked ? '#ff2442' : 'inherit', fontSize: '13px' }">
                      {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
                    </n-text>
                  </div>
                  <div class="action-item">
                    <n-text style="font-size: 13px;">⭐ {{ favCount }}</n-text>
                  </div>
                  <div class="action-item">
                    <n-text style="font-size: 13px;">💬 {{ commentCount }}</n-text>
                  </div>
                </n-space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { PlusOutlined, DownloadOutlined } from '@vicons/antd'

const message = useMessage()

/**
 * 下载图片到本地
 * @param {string} url 图片URL
 * @param {number} index 图片索引
 */
const downloadImage = async (url, index) => {
  try {
    // 使用后端代理下载图片，解决跨域问题
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) throw new Error('网络响应不正常')
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `ai-generated-image-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    message.success('图片下载成功')
  } catch (error) {
    console.error('下载图片失败:', error)
    message.error('下载失败，请尝试刷新页面或检查网络')
  }
}

const props = defineProps({
  content: {
    type: Object,
    default: null
  },
  images: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: 'mobile'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const internalMode = ref('mobile')
const displayMode = computed(() => props.compact ? props.mode : internalMode.value)

const isLiked = ref(false)
const likeCount = ref(Math.floor(Math.random() * 500) + 100)
const favCount = ref(Math.floor(Math.random() * 300) + 50)
const commentCount = ref(Math.floor(Math.random() * 50) + 10)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

const formatContent = (body) => {
  if (!body) return ''
  return body
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<p>${line}</p>`)
    .join('')
}
</script>

<style scoped>
.preview-root {
  width: 100%;
}

.compact-card {
  background: transparent !important;
  border: none !important;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;
}

.preview-wrapper.mobile {
  padding: 10px;
}

.preview-wrapper.desktop {
  padding: 20px;
  width: 100%;
}

.preview-container {
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-container.mobile {
  width: 340px;
  height: 600px;
  border-radius: 30px;
  border: 6px solid #1a1a1a;
  overflow-y: auto;
}

.preview-container.desktop {
  width: 100%;
  max-width: 800px;
  min-height: 500px;
  border-radius: 12px;
}

.xiaohongshu-post {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.xiaohongshu-post.desktop {
  flex-direction: row;
  align-items: stretch;
}

.xiaohongshu-post.desktop .post-images {
  width: 55%;
  border-right: 1px solid #f0f0f0;
}

.xiaohongshu-post.desktop .post-right-section {
  width: 45%;
  display: flex;
  flex-direction: column;
}

.post-right-section {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.download-btn {
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-item:hover .download-btn {
  transform: translateY(0);
}

.preview-carousel {
}

.image-placeholder {
  height: 300px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.post-content-area {
  padding: 0 14px;
  flex: 1;
  overflow-y: auto;
}

.xiaohongshu-post.desktop .post-content-area {
  max-height: 450px;
}

.post-title {
  font-size: 16px;
  line-height: 1.4;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.post-body {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.raw-text-body {
  padding-top: 10px;
}

.tag-link {
  color: #13386c;
  font-size: 13px;
  margin-right: 4px;
}

.post-actions-bar {
  border-top: 1px solid #f0f0f0;
  padding: 10px 0;
  background: white;
  position: sticky;
  bottom: 0;
}

.action-item {
  cursor: pointer;
}

/* 隐藏滚动条 */
.preview-container.mobile::-webkit-scrollbar {
  width: 0px;
}
</style>





