<template>
  <n-card title="生成内容" size="large" hoverable v-if="content">
    <div v-if="content.isRawText" class="raw-content-view">
      <n-tabs v-model:value="activeTab" type="segment" animated>
        <n-tab-pane name="preview" tab="预览模式">
          <div class="markdown-body" v-html="markdownHtml"></div>
        </n-tab-pane>
        <n-tab-pane name="edit" tab="编辑模式">
          <n-input
            v-model:value="editorContent.content"
            type="textarea"
            :rows="15"
            placeholder="AI 生成的内容"
            size="large"
            @input="handleRawContentChange"
          />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- AI 生成的配图展示区 -->
    <div class="image-generation-section" v-if="images.length > 0 || imageLoading">
      <n-divider title-placement="left">AI 智能配图</n-divider>
      <n-grid :cols="3" :x-gap="12" :y-gap="12">
        <n-gi v-for="(img, index) in images" :key="index">
          <n-card content-style="padding: 0" hoverable>
            <n-image
              width="100%"
              height="260px"
              :src="img.url"
              fallback-src="https://via.placeholder.com/260x346?text=图片加载失败"
              object-fit="cover"
              show-toolbar-tooltip
            />
          </n-card>
        </n-gi>
        <!-- 加载状态占位 -->
        <n-gi v-if="imageLoading">
          <n-card content-style="padding: 0">
            <n-skeleton height="260px" width="100%" />
          </n-card>
        </n-gi>
      </n-grid>
    </div>

    <n-form v-else>
      <n-form-item label="标题" label-placement="left" :label-width="80">
        <n-input
          v-model:value="editorContent.title"
          placeholder="输入标题"
          size="large"
          clearable
        />
      </n-form-item>
      
      <n-form-item label="正文" label-placement="left" :label-width="80">
        <n-input
          v-model:value="editorContent.body"
          type="textarea"
          :rows="10"
          placeholder="输入正文内容"
          size="large"
          clearable
        />
      </n-form-item>
      
      <n-form-item label="话题标签" label-placement="left" :label-width="80">
        <n-space>
          <n-tag
            v-for="(tag, index) in editorContent.tags"
            :key="index"
            closable
            type="primary"
            size="medium"
            @close="removeTag(index)"
          >
            {{ tag }}
          </n-tag>
          <n-input
            v-if="inputVisible"
            ref="inputRef"
            v-model:value="inputValue"
            placeholder="输入标签按回车添加"
            size="small"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
          />
          <n-button
            v-else
            size="small"
            type="primary"
            dashed
            @click="showInput"
          >
            + 添加标签
          </n-button>
        </n-space>
      </n-form-item>
      
      <n-form-item label="图片建议" label-placement="left" :label-width="80">
        <n-space vertical>
          <n-alert
            v-for="(img, index) in editorContent.images"
            :key="index"
            :title="img.type"
            :description="img.description"
            type="info"
            :closable="false"
          />
        </n-space>
      </n-form-item>
    </n-form>
    
    <template #footer>
      <n-space>
        <n-button @click="handleRegenerate" size="large">
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M792 768c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V640H512v128c0 4.4-3.6 8-8 8h-32v-80h224zM448 480h-48V320c0-17.7 14.3-32 32-32h144c17.7 0 32 14.3 32 32v160h-48v-80c0-4.4-3.6-8-8-8h-96c-4.4 0-8 3.6-8 8v80z"/>
              </svg>
            </n-icon>
          </template>
          重新生成
        </n-button>
        <n-button
          type="primary"
          size="large"
          @click="handlePreview"
          strong
        >
          <template #icon>
            <n-icon>
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
              </svg>
            </n-icon>
          </template>
          预览效果
        </n-button>
        <n-button @click="handleAddToKnowledgeBase" color="#ff2442" size="large" ghost>
          <template #icon>➕</template>
          加入知识库
        </n-button>
        <n-button type="success" size="large" @click="handleApproveAndSchedule">
          <template #icon>🚀</template>
          人工审批并发布
        </n-button>
      </n-space>

      <!-- 发布设置模态框 (UI 展示) -->
      <n-modal v-model:show="showScheduleModal" preset="dialog" title="审批并发布设置">
        <n-space vertical size="large">
          <n-alert title="发布流程" type="success">
            审批通过后，系统将自动调用小红书官方/第三方接口。
          </n-alert>
          <n-form label-placement="left" :label-width="100">
            <n-form-item label="发布时间">
              <n-date-picker type="datetime" placeholder="选择定时发布时间" clearable />
            </n-form-item>
            <n-form-item label="发布账号">
              <n-select :options="[{label: '我的主账号', value: 'main'}]" default-value="main" />
            </n-form-item>
            <n-form-item label="发布类型">
              <n-radio-group value="now">
                <n-space>
                  <n-radio value="now">立即发布</n-radio>
                  <n-radio value="schedule">定时发布</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </n-form>
        </n-space>
        <template #action>
          <n-button type="primary" @click="showScheduleModal = false">确认审批并发布</n-button>
        </template>
      </n-modal>
    </template>
  </n-card>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useMessage, NModal, NForm, NFormItem, NDatePicker, NSelect, NRadioGroup, NRadio, NAlert } from 'naive-ui'
import MarkdownIt from 'markdown-it'

const message = useMessage()
const showScheduleModal = ref(false)

const handleAddToKnowledgeBase = () => {
  message.success('已成功加入知识库')
}

const handleApproveAndSchedule = () => {
  showScheduleModal.value = true
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const props = defineProps({
  content: {
    type: Object,
    default: null
  },
  images: {
    type: Array,
    default: () => []
  },
  imageLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['regenerate', 'preview', 'content-change'])

const editorContent = ref({})
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()
const activeTab = ref('preview')

const markdownHtml = computed(() => {
  if (!editorContent.value.content) return ''
  return md.render(editorContent.value.content)
})

watch(() => props.content, (newContent) => {
  if (newContent) {
    editorContent.value = { ...newContent }
  }
}, { immediate: true })

watch(editorContent, (newContent) => {
  emit('content-change', newContent)
}, { deep: true })

const removeTag = (index) => {
  editorContent.value.tags.splice(index, 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (!editorContent.value.tags) {
      editorContent.value.tags = []
    }
    editorContent.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const handleRegenerate = () => {
  emit('regenerate')
}

const handlePreview = () => {
  emit('preview')
}

const handleRawContentChange = (value) => {
  editorContent.value.content = value
}
</script>

<style scoped>
.markdown-body {
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  min-height: 300px;
  max-height: 600px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  overflow-y: auto;
}

.markdown-body :deep(h1), 
.markdown-body :deep(h2), 
.markdown-body :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(ul), 
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #636c76;
  border-left: 0.25em solid #d0d7de;
  margin: 0 0 16px 0;
}

.raw-content-view {
  margin-bottom: 24px;
}

.image-generation-section {
  margin-top: 24px;
}

.image-generation-section :deep(.n-divider__title) {
  font-weight: 600;
  color: #1890ff;
}
</style>