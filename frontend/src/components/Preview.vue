



































<template>
  <div class="preview" v-if="content">
    <el-card shadow="hover">
      <template #header>
        <div class="preview-header">
          <h3>👁️ 内容预览</h3>
          <el-radio-group v-model="previewMode" size="small">
            <el-radio-button label="mobile">📱 手机端</el-radio-button>
            <el-radio-button label="desktop">💻 电脑端</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div class="preview-content">
        <div :class="['preview-container', previewMode]">
          <div class="xiaohongshu-post">
            <div class="post-header">
              <div class="user-avatar">👤</div>
              <div class="user-info">
                <div class="username">小红书用户</div>
                <div class="post-time">刚刚</div>
              </div>
              <div class="post-options">•••</div>
            </div>
            
            <div class="post-title">{{ content.title }}</div>
            
            <div class="post-body" v-html="formatContent(content.body)"></div>
            
            <div class="post-tags">
              <span
                v-for="(tag, index) in content.tags.slice(0, 5)"
                :key="index"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            
            <div class="post-actions">
              <div class="action-item">
                <span class="icon">❤️</span>
                <span class="count">{{ randomCount() }}</span>
              </div>
              <div class="action-item">
                <span class="icon">💬</span>
                <span class="count">{{ randomCount() }}</span>
              </div>
              <div class="action-item">
                <span class="icon">⭐</span>
                <span class="count">{{ randomCount() }}</span>
              </div>
              <div class="action-item share">
                <span class="icon">➤</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    default: null
  }
})

const previewMode = ref('mobile')

const formatContent = (body) => {
  return body
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      if (line.includes('✅') || line.includes('✨') || line.includes('•')) {
        return `${line}`
      }
      return `<p>${line}</p>`
    })
    .join('')
}

const randomCount = () => {
  return Math.floor(Math.random() * 1000) + 100
}
</script>

<style scoped>
.preview {
  max-width: 800px;
  margin: 20px auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
}

.preview-content {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.preview-container {
  display: flex;
  justify-content: center;
}

.preview-container.mobile {
  max-width: 420px;
}

.preview-container.desktop {
  max-width: 640px;
}

.xiaohongshu-post {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  width: 100%;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: #ff2442;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.post-options {
  color: #909399;
  cursor: pointer;
}

.post-title {
  padding: 0 16px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  line-height: 1.5;
}

.post-body {
  padding: 0 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.post-body p {
  margin: 0 0 8px 0;
}

.post-body p:last-child {
  margin: 0;
}

.post-tags {
  padding: 0 16px;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #409eff;
  background-color: #e6f7ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 24px;
  cursor: pointer;
}

.action-item .icon {
  margin-right: 4px;
  font-size: 18px;
}

.action-item .count {
  font-size: 14px;
  color: #909399;
}

.action-item.share {
  margin-left: auto;
  margin-right: 0;
}

.el-card :deep(.el-card__header) {
  background-color: #ff2442;
  color: white;
}
</style>















