










<template>
  <n-card title="输入关键词" size="large" hoverable>
    <template #header-extra>
      <n-icon size="24" color="#ff2442">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
        </svg>
      </n-icon>
    </template>
    
    <n-input
      v-model:value="keywords"
      type="textarea"
      placeholder="输入关键词，如：复古穿搭、夏日探店、职场成长..."
      size="large"
      :autosize="{ minRows: 2, maxRows: 4 }"
      :loading="analyzing"
      clearable
      @input="handleInput"
      @keyup.enter.ctrl="handleAnalyze"
    />
    
    <n-space vertical class="mt-4" v-if="showQuickKeywords">
      <n-text type="info">热门关键词推荐</n-text>
      <n-space>
        <n-tag
          v-for="tag in hotKeywords"
          :key="tag"
          round
          checkable
          type="info"
          size="medium"
          @click="addKeyword(tag)"
        >
          {{ tag }}
        </n-tag>
      </n-space>
    </n-space>

    <!-- 新增：特殊要求输入 -->
    <n-collapse class="mt-4">
      <n-collapse-item title="特殊要求 (可选)" name="special">
        <n-input
          v-model:value="specialRequirements"
          type="textarea"
          placeholder="例如：必须包含价格、避免使用口语化表达、增加互动问题、指定人设等..."
          size="medium"
          :autosize="{ minRows: 2, maxRows: 3 }"
        />
      </n-collapse-item>
    </n-collapse>
    
    <template #footer>
      <n-button
        type="primary"
        size="large"
        @click="handleAnalyze"
        :loading="analyzing"
        block
        strong
      >
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.5 65.6-158.8c42.3-42.4 98.6-65.8 158.4-65.8s116.1 23.4 158.4 65.8C612.7 295.5 636 351.8 636 412s-23.3 116.5-65.6 158.4z"/>
            </svg>
          </n-icon>
        </template>
        分析并生成内容
      </n-button>
    </template>
  </n-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'

const props = defineProps({
  analyzing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyzed'])
const message = useMessage()

const keywords = ref('')
const specialRequirements = ref('')
const showQuickKeywords = ref(true)

const handleInput = (val) => {
  keywords.value = val
}

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

// 监听关键词变化，自动隐藏推荐标签
watch(keywords, (newValue) => {
  if (newValue && newValue.trim()) {
    showQuickKeywords.value = false
  } else {
    showQuickKeywords.value = true
  }
})

const addKeyword = (tag) => {
  if (keywords.value) {
    keywords.value += ', ' + tag
  } else {
    keywords.value = tag
  }
}

const handleAnalyze = async () => {
  if (!keywords.value.trim()) {
    message.warning('请输入关键词')
    return
  }
  
  emit('analyzed', {
    keywords: keywords.value,
    specialRequirements: specialRequirements.value
  })
}
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}
</style>





