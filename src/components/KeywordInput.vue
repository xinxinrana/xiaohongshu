










<template>
  <div v-if="visible" class="pill-input-wrapper" :class="{ 'with-recommendations': showQuickKeywords }">
    <div class="input-main-pill">
      <n-button quaternary circle class="add-btn">
        <template #icon><n-icon><plus-outlined /></n-icon></template>
      </n-button>
      
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
        <n-button quaternary circle @click="message.info('语音识别功能开发中...')">
          <template #icon><n-icon><audio-outlined /></n-icon></template>
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
  UpOutlined
} from '@vicons/antd'

const props = defineProps({
  analyzing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['analyzed'])
const message = useMessage()

const keywords = ref('')
const showQuickKeywords = ref(true)
const visible = ref(true)

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
    tools: activeTools.value
  })
}

const setValues = (data) => {
  keywords.value = data.keywords || ''
}

defineExpose({
  setValues
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





