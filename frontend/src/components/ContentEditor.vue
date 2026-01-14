









<template>
  <div class="content-editor" v-if="content">
    <el-card shadow="hover">
      <template #header>
        <h3>✏️ 编辑内容</h3>
      </template>
      
      <el-form :model="editorContent" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="editorContent.title" placeholder="输入标题" />
        </el-form-item>
        
        <el-form-item label="正文">
          <el-input
            v-model="editorContent.body"
            type="textarea"
            :rows="10"
            placeholder="输入正文内容"
          />
        </el-form-item>
        
        <el-form-item label="话题标签">
          <el-tag
            v-for="(tag, index) in editorContent.tags"
            :key="index"
            closable
            @close="removeTag(index)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="input-new-tag"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + 添加标签
          </el-button>
        </el-form-item>
        
        <el-form-item label="图片建议">
          <div class="image-suggestions">
            <el-alert
              v-for="(img, index) in editorContent.images"
              :key="index"
              :title="img.type"
              :description="img.description"
              type="info"
              :closable="false"
              class="img-item"
            />
          </div>
        </el-form-item>
      </el-form>
      
      <div class="editor-actions">
        <el-button @click="handleRegenerate">重新生成</el-button>
        <el-button type="primary" @click="handlePreview">预览效果</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, defineProps, defineEmits } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['regenerate', 'preview', 'content-change'])

const editorContent = ref({})
const inputVisible = ref(false)
const inputValue = ref('')
const InputRef = ref()

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
    InputRef.value.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    editorContent.value.tags.push('#' + inputValue.value.replace('#', ''))
  }
  inputVisible.value = false
  inputValue.value = ''
}

const handleRegenerate = () => {
  emit('regenerate')
}

const handlePreview = () => {
  emit('preview', editorContent.value)
}
</script>

<style scoped>
.content-editor {
  max-width: 800px;
  margin: 20px auto;
}

.tag-item {
  margin: 0 8px 8px 0;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.image-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.img-item {
  width: 100%;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
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







