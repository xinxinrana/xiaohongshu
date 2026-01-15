



















<template>
  <n-card title="👀 双端预览预览" size="large" hoverable v-if="content">
    <n-space justify="center" class="mb-6">
      <n-radio-group v-model:value="previewMode" size="large">
        <n-radio-button value="mobile">
          <n-space align="center">
            <n-icon size="20">📱</n-icon>
            手机端
          </n-space>
        </n-radio-button>
        <n-radio-button value="desktop">
          <n-space align="center">
            <n-icon size="20">💻</n-icon>
            电脑端
          </n-space>
        </n-radio-button>
      </n-radio-group>
    </n-space>
    
    <div :class="['preview-wrapper', previewMode]">
      <n-card :class="['preview-container', previewMode]" :bordered="true" hoverable>
        <div class="xiaohongshu-post">
          <!-- 模拟头部 -->
          <div class="post-header">
            <n-avatar round size="large" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
            <div class="user-info">
              <n-text strong>小红书创作者</n-text>
              <n-text depth="3">刚刚 · 发布于 上海</n-text>
            </div>
            <n-button quaternary circle>
              <template #icon>➕</template>
            </n-button>
          </div>
          
          <!-- 图片建议展示区 (模拟图片) -->
          <div class="post-images" v-if="(images && images.length) || (content.images && content.images.length)">
            <n-carousel show-arrow dot-type="line">
              <!-- 优先展示生成的真实图片 -->
              <div v-for="(img, index) in images" :key="'gen-' + index" class="image-item">
                <n-image
                  width="100%"
                  height="500px"
                  :src="img.url"
                  object-fit="cover"
                />
              </div>
              <!-- 其次展示图片建议占位 -->
              <div v-for="(img, index) in content.images" :key="'sug-' + index" class="image-placeholder">
                <div class="placeholder-content">
                  <n-icon size="48">🖼️</n-icon>
                  <n-text strong>{{ img.type }}</n-text>
                  <n-text depth="3">{{ img.description }}</n-text>
                </div>
              </div>
            </n-carousel>
          </div>
          
          <div class="post-content-area">
            <!-- 支持纯文本模式 -->
            <template v-if="content.isRawText">
              <div class="post-body raw-text-body" style="white-space: pre-wrap;">{{ content.content }}</div>
            </template>
            <template v-else>
              <n-text tag="h3" strong class="post-title">{{ content.title }}</n-text>
              <div class="post-body" v-html="formatContent(content.body)"></div>
            </template>
            
            <n-space class="post-tags" :size="4" v-if="!content.isRawText">
              <n-text
                v-for="(tag, index) in content.tags"
                :key="index"
                class="tag-link"
              >
                {{ tag }}
              </n-text>
            </n-space>
            
            <n-divider />
            
            <div class="post-footer">
              <n-text depth="3">编辑于 2024-01-13</n-text>
            </div>
          </div>
          
          <!-- 模拟互动栏 -->
          <div class="post-actions-bar">
            <n-space justify="space-around" align="center" style="width: 100%">
              <div class="action-item" @click="toggleLike">
                <n-text :style="{ color: isLiked ? '#ff2442' : 'inherit' }">
                  {{ isLiked ? '❤️' : '🤍' }} {{ likeCount }}
                </n-text>
              </div>
              <div class="action-item">
                <n-text>⭐ {{ favCount }}</n-text>
              </div>
              <div class="action-item">
                <n-text>💬 {{ commentCount }}</n-text>
              </div>
              <div class="action-item">
                <n-text>🚀 分享</n-text>
              </div>
            </n-space>
          </div>
        </div>
      </n-card>
    </div>
  </n-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    default: null
  },
  images: {
    type: Array,
    default: () => []
  }
})

const previewMode = ref('mobile')
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
.mb-6 {
  margin-bottom: 24px;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  background: #f0f2f5;
  padding: 40px 20px;
  border-radius: 12px;
}

.preview-container.mobile {
  width: 375px;
  height: 667px;
  padding: 0;
  overflow-y: auto;
  border: 8px solid #333;
  border-radius: 36px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.preview-container.desktop {
  width: 800px;
  min-height: 600px;
}

.xiaohongshu-post {
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-placeholder {
  height: 500px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.post-content-area {
  padding: 16px;
  flex: 1;
}

.post-title {
  font-size: 18px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.post-body {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.tag-link {
  color: #13386c;
  cursor: pointer;
}

.post-footer {
  margin-top: 12px;
}

.post-actions-bar {
  border-top: 1px solid #eee;
  padding: 12px 0;
  background: white;
  position: sticky;
  bottom: 0;
}

.action-item {
  cursor: pointer;
  transition: transform 0.1s;
}

.action-item:active {
  transform: scale(0.9);
}

/* 隐藏滚动条 */
.preview-container.mobile::-webkit-scrollbar {
  width: 0px;
}
</style>





