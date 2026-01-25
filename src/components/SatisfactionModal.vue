<template>
  <n-modal
    v-model:show="visible"
    :mask-closable="false"
    preset="card"
    :title="modalTitle"
    class="satisfaction-modal"
    :style="{ maxWidth: modalMode === 'feedback' ? '500px' : '700px' }"
    @close="handleClose"
  >
    <!-- 满意度反馈模式 -->
    <div v-if="modalMode === 'feedback'" class="feedback-mode">
      <div class="feedback-header">
        <n-icon size="48" color="#10b981">
          <check-circle-outlined />
        </n-icon>
        <h3>内容生成完成</h3>
        <n-text depth="3">请问您对当前生成的文案和配图是否满意？</n-text>
      </div>

      <n-space vertical :size="12" style="margin-top: 24px;">
        <n-button
          type="success"
          size="large"
          block
          strong
          @click="handleSatisfied"
          :loading="analyzing"
        >
          <template #icon>
            <n-icon><heart-outlined /></n-icon>
          </template>
          满意并接受
        </n-button>
        <n-button
          type="warning"
          size="large"
          block
          @click="switchToEditMode"
        >
          <template #icon>
            <n-icon><edit-outlined /></n-icon>
          </template>
          我需要修改
        </n-button>
      </n-space>
    </div>

    <!-- 修改模式 -->
    <div v-else-if="modalMode === 'edit'" class="edit-mode">
      <n-form ref="editFormRef" :model="editForm" :rules="editRules">
        <n-form-item label="请输入修改文案的想法" path="contentFeedback">
          <n-input
            v-model:value="editForm.contentFeedback"
            type="textarea"
            placeholder="例如：希望文案更加活泼一些，增加一些互动性的提问..."
            :rows="3"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item label="请输入修改图片的想法" path="imageFeedback">
          <n-input
            v-model:value="editForm.imageFeedback"
            type="textarea"
            placeholder="例如：希望图片更加温馨，色调偏暖，增加一些生活气息..."
            :rows="3"
            :maxlength="500"
            show-count
          />
        </n-form-item>

        <n-form-item label="上传参考图（可选，最多6张）">
          <div class="reference-upload-area">
            <n-upload
              :max="6"
              multiple
              list-type="image-card"
              :on-change="handleReferenceImageUpload"
              :on-remove="handleRemoveReferenceImage"
              accept="image/*"
              :file-list="fileList"
            >
              <n-button>
                <template #icon>
                  <n-icon><cloud-upload-outlined /></n-icon>
                </template>
                上传参考图
              </n-button>
            </n-upload>
            <n-text depth="3" style="margin-top: 8px; display: block; font-size: 12px;">
              上传参考图可以帮助AI更好地理解您的修改意图，支持多图融合
            </n-text>
          </div>
        </n-form-item>
      </n-form>

      <n-space justify="end" :size="12" style="margin-top: 24px;">
        <n-button @click="handleBack">
          <template #icon>
            <n-icon><arrow-left-outlined /></n-icon>
          </template>
          返回
        </n-button>
        <n-button
          type="primary"
          @click="handleSubmitEdit"
          :loading="submitting"
        >
          <template #icon>
            <n-icon><send-outlined /></n-icon>
          </template>
          发送
        </n-button>
      </n-space>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import {
  CheckCircleOutlined,
  HeartOutlined,
  EditOutlined,
  CloudUploadOutlined,
  ArrowLeftOutlined,
  SendOutlined
} from '@vicons/antd'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  iterationCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:show', 'satisfied', 'edit', 'close'])
const message = useMessage()

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// 监听弹窗关闭，重置状态
watch(() => props.show, (newVal) => {
  if (!newVal) {
    // 弹窗关闭时重置所有状态
    analyzing.value = false
    modalMode.value = 'feedback'
  }
})

const modalMode = ref('feedback') // 'feedback' | 'edit'
const analyzing = ref(false)
const submitting = ref(false)
const editFormRef = ref(null)
const fileList = ref([])

const editForm = ref({
  contentFeedback: '',
  imageFeedback: '',
  referenceImages: [],      // 多图支持
  referenceImageUrls: []    // 多图URL支持
})

const editRules = {
  contentFeedback: {
    required: true,
    message: '请输入修改文案的想法',
    trigger: 'blur'
  },
  imageFeedback: {
    required: true,
    message: '请输入修改图片的想法',
    trigger: 'blur'
  }
}

const modalTitle = computed(() => {
  if (modalMode.value === 'feedback') {
    return props.iterationCount > 0 
      ? `第 ${props.iterationCount + 1} 次生成完成` 
      : '生成完成'
  } else {
    return '请描述您的修改需求'
  }
})

// 切换到编辑模式
const switchToEditMode = () => {
  modalMode.value = 'edit'
  // 重置表单
  editForm.value = {
    contentFeedback: '',
    imageFeedback: '',
    referenceImages: [],
    referenceImageUrls: []
  }
  fileList.value = []
}

// 返回到反馈模式
const handleBack = () => {
  modalMode.value = 'feedback'
}

// 用户满意并接受
const handleSatisfied = () => {
  analyzing.value = true
  emit('satisfied')
  // 注意：不在这里重置 analyzing 状态
  // loading 状态会在弹窗关闭时自动重置，由父组件控制关闭时机
}

// 提交编辑请求
const handleSubmitEdit = async () => {
  try {
    await editFormRef.value?.validate()
    
    if (!editForm.value.contentFeedback.trim() || !editForm.value.imageFeedback.trim()) {
      message.warning('请同时填写文案和图片的修改想法')
      return
    }
    
    submitting.value = true
    
    emit('edit', {
      contentFeedback: editForm.value.contentFeedback,
      imageFeedback: editForm.value.imageFeedback,
      referenceImages: editForm.value.referenceImageUrls,  // 传递多图URL数组
      referenceImageUrl: editForm.value.referenceImageUrls[0] || null  // 兼容旧接口
    })
    
    // 关闭模态框并重置状态
    visible.value = false
    modalMode.value = 'feedback'
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 处理参考图上传（支持多图）
const handleReferenceImageUpload = ({ file, fileList: newFileList }) => {
  if (file.file && (file.status === 'finished' || file.status === 'pending')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Url = e.target.result
      // 添加到URL数组
      if (!editForm.value.referenceImageUrls.includes(base64Url)) {
        editForm.value.referenceImageUrls.push(base64Url)
        editForm.value.referenceImages.push(file)
      }
      console.log('[参考图上传成功] 当前数量:', editForm.value.referenceImageUrls.length)
      message.success('参考图上传成功')
    }
    reader.onerror = () => {
      message.error('图片读取失败')
    }
    reader.readAsDataURL(file.file)
  }
  fileList.value = newFileList
}

// 移除参考图
const handleRemoveReferenceImage = ({ file, fileList: newFileList }) => {
  // 找到并移除对应的URL
  const index = editForm.value.referenceImages.findIndex(f => f.id === file.id)
  if (index > -1) {
    editForm.value.referenceImages.splice(index, 1)
    editForm.value.referenceImageUrls.splice(index, 1)
  }
  fileList.value = newFileList
}

// 关闭模态框
const handleClose = () => {
  modalMode.value = 'feedback'
  emit('close')
}

// 暴露方法供父组件调用
defineExpose({
  resetToFeedbackMode: () => {
    modalMode.value = 'feedback'
  }
})
</script>

<style scoped>
.satisfaction-modal {
  border-radius: 16px;
}

.feedback-mode {
  padding: 20px;
}

.feedback-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.feedback-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.edit-mode {
  padding: 10px 0;
}

.reference-upload-area {
  width: 100%;
}
</style>
