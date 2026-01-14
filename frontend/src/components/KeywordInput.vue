





<template>
  <div class="keyword-input">
    <el-card shadow="hover">
      <template #header>
        <h3>🔍 输入关键词</h3>
      </template>
      
      <el-input
        v-model="keywords"
        type="textarea"
        :rows="3"
        placeholder="输入一个关键词或多个关键词，用逗号或空格分隔"
        @input="onInput"
      />
      
      <div class="quick-keywords" v-if="showQuickKeywords">
        <p>热门关键词推荐：</p>
        <el-tag
          v-for="tag in hotKeywords"
          :key="tag"
          @click="addKeyword(tag)"
          class="keyword-tag"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
      
      <div class="actions">
        <el-button type="primary" @click="handleAnalyze" :loading="analyzing" size="large">
          分析并生成 <el-icon><Search /></el-icon>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { analysisAPI } from '../services/api'

const emit = defineEmits(['analyzed'])

const keywords = ref('')
const showQuickKeywords = ref(true)
const analyzing = ref(false)

const hotKeywords = [
  '学习方法',
  '好物推荐',
  '生活方式',
  '情感共鸣',
  '干货分享',
  '种草',
  '技巧',
  '教程'
]

const onInput = () => {
  if (keywords.value.trim()) {
    showQuickKeywords.value = false
  }
}

const addKeyword = (tag) => {
  if (keywords.value) {
    keywords.value += ', ' + tag
  } else {
    keywords.value = tag
  }
}

const handleAnalyze = async () => {
  if (!keywords.value.trim()) {
    return
  }
  
  analyzing.value = true
  
  try {
    const response = await analysisAPI.analyze(keywords.value)
    
    if (response.data.success) {
      emit('analyzed', {
        keywords: keywords.value,
        analysis: response.data.data
      })
    }
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    analyzing.value = false
  }
}
</script>

<style scoped>
.keyword-input {
  max-width: 800px;
  margin: 0 auto;
}

.quick-keywords {
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.quick-keywords p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.keyword-tag {
  margin: 0 8px 8px 0;
  cursor: pointer;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-card :deep(.el-card__header) {
  background-color: #ff2442;
  color: white;
}

.el-card :deep(.el-card__header h3) {
  margin: 0;
  font-size: 18px;
}
</style>



