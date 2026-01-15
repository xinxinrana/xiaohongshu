<template>
  <div class="batch-generate-container">
    <n-grid :cols="24" :x-gap="24" class="main-grid">
      <!-- 左侧：输入区域 -->
      <n-gi :span="10">
        <n-space vertical :size="20">
          <n-card title="批量需求输入" class="glass-card">
            <template #header-extra>
              <n-text depth="3">每行代表一个生成需求</n-text>
            </template>
            <n-input
              v-model:value="rawRequirements"
              type="textarea"
              placeholder="请输入需求列表，例如：
复古穿搭分享
夏日冷饮推荐
职场新人避坑指南
周末去哪儿玩"
              :autosize="{ minRows: 15, maxRows: 25 }"
              :disabled="processing"
            />
            <template #footer>
              <n-space justify="end">
                <n-button 
                  type="primary" 
                  size="large" 
                  @click="startBatch" 
                  :loading="processing"
                  :disabled="!requirementsList.length"
                >
                  <template #icon><n-icon><play-circle-outlined /></n-icon></template>
                  开始批量生成 ({{ requirementsList.length }})
                </n-button>
              </n-space>
            </template>
          </n-card>
          
          <n-card title="设置" size="small" class="glass-card">
            <n-form-item label="包含配图生成" label-placement="left">
              <n-switch v-model:value="includeImages" :disabled="processing" />
            </n-form-item>
            <n-form-item label="生成并发数" label-placement="left">
              <n-input-number v-model:value="concurrency" :min="1" :max="3" :disabled="processing" />
            </n-form-item>
          </n-card>
        </n-space>
      </n-gi>

      <!-- 右侧：执行状态与结果 -->
      <n-gi :span="14">
        <n-card title="执行队列" class="glass-card full-height-card">
          <template #header-extra>
            <n-button 
              v-if="results.length > 0" 
              type="success" 
              secondary 
              @click="downloadAll"
              :disabled="processing && !results.length"
            >
              <template #icon><n-icon><cloud-download-outlined /></n-icon></template>
              打包下载全部 ({{ results.length }})
            </n-button>
          </template>

          <div class="queue-container">
            <n-empty v-if="!queue.length" description="暂无执行任务" />
            <n-list v-else hoverable clickable>
              <n-list-item v-for="(item, index) in queue" :key="index">
                <template #prefix>
                  <n-tag :type="getStatusType(item.status)" size="small">
                    {{ getStatusText(item.status) }}
                  </n-tag>
                </template>
                <n-thing :title="item.requirement">
                  <template #description>
                    <n-progress
                      v-if="item.status === 'processing'"
                      type="line"
                      :percentage="item.progress"
                      processing
                      size="small"
                    />
                    <n-text depth="3" v-else-if="item.status === 'completed'">
                      生成完成，包含 {{ item.images?.length || 0 }} 张配图
                    </n-text>
                    <n-text type="error" v-else-if="item.status === 'error'">
                      {{ item.error || '生成出错' }}
                    </n-text>
                  </template>
                  <template #extra>
                    <n-button 
                      v-if="item.status === 'completed'" 
                      quaternary 
                      circle 
                      size="small"
                      @click="previewItem(item)"
                    >
                      <template #icon><n-icon><eye-outlined /></n-icon></template>
                    </n-button>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 预览弹窗 -->
    <n-modal v-model:show="showPreviewModal" preset="card" style="width: 900px" title="内容预览">
      <Preview 
        v-if="previewingItem" 
        :content="{ isRawText: true, content: previewingItem.content }" 
        :images="previewingItem.images.map(url => ({ url }))"
        mode="desktop"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  useMessage, 
  NGrid, NGi, NCard, NInput, NButton, NSpace, NText, 
  NList, NListItem, NTag, NThing, NProgress, NSwitch, NFormItem, NInputNumber, NEmpty, NIcon,
  NModal
} from 'naive-ui'
import { 
  PlayCircleOutlined, 
  CloudDownloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  EyeOutlined
} from '@vicons/antd'
import { generationAPI, imageGenerationAPI } from '../services/api'
import Preview from '../components/Preview.vue'
import JSZip from 'jszip'

const message = useMessage()

// 状态变量
const rawRequirements = ref('')
const processing = ref(false)
const includeImages = ref(true)
const concurrency = ref(1)
const queue = ref([])
const results = ref([])
const showPreviewModal = ref(false)
const previewingItem = ref(null)

// 计算属性：解析后的需求列表
const requirementsList = computed(() => {
  return rawRequirements.value
    .split('\n')
    .map(r => r.trim())
    .filter(r => r.length > 0)
})

/**
 * 开始批量任务
 */
const startBatch = async () => {
  if (processing.value) return
  
  const list = requirementsList.value
  if (!list.length) return

  processing.value = true
  results.value = []
  queue.value = list.map(req => ({
    requirement: req,
    status: 'pending',
    progress: 0,
    content: null,
    images: []
  }))

  // 简单的并发控制处理
  for (let i = 0; i < queue.value.length; i++) {
    await processItem(i)
  }

  processing.value = false
  message.success('批量生成任务已完成')
}

/**
 * 处理单个需求
 */
const processItem = async (index) => {
  const item = queue.value[index]
  item.status = 'processing'
  item.progress = 20

  try {
    // 1. 生成文案
    const res = await generationAPI.autoGenerate(item.requirement)
    if (res.data.success) {
      item.content = res.data.data.content
      item.progress = 60
      
      // 2. 生成配图 (可选)
      if (includeImages.value) {
        const prompts = await imageGenerationAPI.generatePrompts(item.content)
        if (prompts && prompts.length > 0) {
          const imagePromises = prompts.map(prompt => 
            imageGenerationAPI.generate({ prompt })
          )
          const imageResults = await Promise.all(imagePromises)
          item.images = imageResults.filter(r => r.success).map(r => r.url)
        }
      }
      
      item.status = 'completed'
      item.progress = 100
      results.value.push({
        requirement: item.requirement,
        content: item.content,
        images: item.images
      })
    } else {
      throw new Error('生成文案失败')
    }
  } catch (error) {
    console.error(`处理需求 "${item.requirement}" 出错:`, error)
    item.status = 'error'
    item.error = error.message
  }
}

/**
 * 下载所有结果为 ZIP
 */
const downloadAll = async () => {
  if (!results.value.length) return
  
  const zip = new JSZip()
  const mainFolder = zip.folder("批量生成结果_" + new Date().toLocaleDateString())
  
  message.loading('正在打包内容，请稍候...', { duration: 0 })
  
  for (const [index, res] of results.value.entries()) {
    const folderName = `${index + 1}_${res.requirement.replace(/[\\/:*?"<>|]/g, '_')}`
    const taskFolder = mainFolder.folder(folderName)
    
    // 保存文案
    taskFolder.file("文案.md", `# 需求：${res.requirement}\n\n${res.content}`)
    
    // 保存图片
    if (res.images && res.images.length > 0) {
      const imgFolder = taskFolder.folder("images")
      for (let i = 0; i < res.images.length; i++) {
        try {
          // 使用后端代理下载图片，解决跨域问题
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(res.images[i])}`
          const imgResponse = await fetch(proxyUrl)
          if (!imgResponse.ok) throw new Error('网络响应不正常')
          const blob = await imgResponse.blob()
          imgFolder.file(`image_${i + 1}.png`, blob)
        } catch (err) {
          console.error(`通过代理下载图片失败: ${res.images[i]}`, err)
          // 保底方案：记录链接
          taskFolder.file(`image_${i + 1}_url.txt`, res.images[i])
        }
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" })
  const url = window.URL.createObjectURL(content)
  const link = document.createElement('a')
  link.href = url
  link.download = `小红书批量生成_${new Date().getTime()}.zip`
  link.click()
  window.URL.revokeObjectURL(url)
  
  message.destroyAll()
  message.success('打包下载成功！')
}

/**
 * 预览单个任务结果
 */
const previewItem = (item) => {
  previewingItem.value = item
  showPreviewModal.value = true
}

// 工具函数
const getStatusType = (status) => {
  const map = {
    pending: 'default',
    processing: 'info',
    completed: 'success',
    error: 'error'
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    pending: '等待中',
    processing: '生成中',
    completed: '已完成',
    error: '出错'
  }
  return map[status]
}
</script>

<style scoped>
.batch-generate-container {
  padding: 12px;
  height: calc(100vh - 120px);
}

.main-grid {
  height: 100%;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 16px !important;
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.queue-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
