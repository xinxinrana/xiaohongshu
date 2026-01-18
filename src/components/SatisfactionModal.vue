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

        <n-form-item label="上传参考图（可选）">
          <n-upload
            :max="1"
            list-type="image-card"
            :on-change="handleReferenceImageUpload"
            :on-remove="handleRemoveReferenceImage"
            accept="image/*"
          >
            <n-button>
              <template #icon>
                <n-icon><cloud-upload-outlined /></n-icon>
              </template>
              上传参考图
            </n-button>
          </n-upload>
          <n-text depth="3" style="margin-top: 8px; display: block; font-size: 12px;">
            上传参考图可以帮助AI更好地理解您的修改意图
          </n-text>
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

const editForm = ref({
  contentFeedback: '',
  imageFeedback: '',
  referenceImage: null,
  referenceImageUrl: null
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
    referenceImage: null,
    referenceImageUrl: null
  }
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
      referenceImageUrl: editForm.value.referenceImageUrl
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

// 处理参考图上传
const handleReferenceImageUpload = ({ file, fileList }) => {
  // 共有两种状态需要处理：
  // 1. 有 action 时：状态会是 'finished'
  // 2. 无 action 时：状态是 'pending'，需要手动读取文件
  if (file.file && (file.status === 'finished' || file.status === 'pending')) {
    editForm.value.referenceImage = file
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.value.referenceImageUrl = e.target.result
      console.log('[参考图上传成功] Base64长度:', e.target.result?.length)
      message.success('参考图上传成功')
    }
    reader.onerror = () => {
      message.error('图片读取失败')
    }
    reader.readAsDataURL(file.file)
  }
}

// 移除参考图
const handleRemoveReferenceImage = () => {
  editForm.value.referenceImage = null
  editForm.value.referenceImageUrl = null
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
</style>
