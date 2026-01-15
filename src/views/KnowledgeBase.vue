<template>
  <div class="knowledge-base-container">
    <n-space vertical :size="24">
      <n-card title="知识库管理" subtitle="在这里存储您的品牌知识、风格偏好或参考资料，AI 在生成文案时将参考这些内容。">
        <template #header-extra>
          <n-space>
            <n-button type="info" ghost @click="handleImportTemplate">
              <template #icon>📥</template>
              导入行业模板
            </n-button>
            <n-button type="primary" @click="showAddModal = true">
              <template #icon>
                <n-icon><PlusOutlined /></n-icon>
              </template>
              添加知识条目
            </n-button>
          </n-space>
        </template>
        
        <n-empty v-if="items.length === 0" description="暂无知识条目，点击右上角添加">
          <template #extra>
            <n-button dashed @click="showAddModal = true">立即添加</n-button>
          </template>
        </n-empty>

        <n-grid :cols="2" :x-gap="12" :y-gap="12" v-else>
          <n-gi v-for="item in items" :key="item.id">
            <n-card :title="item.title" hoverable>
              <template #header-extra>
                <n-button text type="error" @click="handleDelete(item.id)">
                  <template #icon>
                    <n-icon><DeleteOutlined /></n-icon>
                  </template>
                </n-button>
              </template>
              <n-ellipsis :line-clamp="3" expand-trigger="click" line-height="1.6">
                {{ item.content }}
              </n-ellipsis>
              <template #footer>
                <n-tag size="small" :type="getTagType(item.type)">
                  {{ getTypeName(item.type) }}
                </n-tag>
              </template>
            </n-card>
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>

    <!-- 添加条目弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      style="width: 600px"
      title="添加知识条目"
      :bordered="false"
    >
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="formValue.title" placeholder="例如：品牌语气指南" />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select
            v-model:value="formValue.type"
            :options="typeOptions"
            placeholder="选择知识类型"
          />
        </n-form-item>
        <n-form-item label="详细内容" path="content">
          <n-input
            v-model:value="formValue.content"
            type="textarea"
            :rows="6"
            placeholder="请输入详细的参考资料或要求..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showAddModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { PlusOutlined, DeleteOutlined } from '@vicons/antd'
import { knowledgeAPI } from '../services/api'

const message = useMessage()
const dialog = useDialog()
const items = ref([])
const showAddModal = ref(false)
const saving = ref(false)
const formRef = ref(null)

const formValue = ref({
  title: '',
  type: 'style',
  content: ''
})

const rules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  content: { required: true, message: '请输入内容', trigger: 'blur' }
}

const typeOptions = [
  { label: '文案风格', value: 'style' },
  { label: '品牌背景', value: 'brand' },
  { label: '参考资料', value: 'reference' },
  { label: '避坑指南', value: 'avoid' }
]

const getTypeName = (type) => {
  const opt = typeOptions.find(o => o.value === type)
  return opt ? opt.label : '其他'
}

const getTagType = (type) => {
  const map = {
    style: 'info',
    brand: 'success',
    reference: 'warning',
    avoid: 'error'
  }
  return map[type] || 'default'
}

const fetchItems = async () => {
  const res = await knowledgeAPI.getAll()
  if (res.success) {
    items.value = res.data
  }
}

const handleSave = async () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      saving.value = true
      try {
        await knowledgeAPI.add(formValue.value)
        message.success('保存成功')
        showAddModal.value = false
        formValue.value = { title: '', type: 'style', content: '' }
        await fetchItems()
      } catch (e) {
        message.error('保存失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const handleDelete = (id) => {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条知识条目吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await knowledgeAPI.delete(id)
      message.success('删除成功')
      await fetchItems()
    }
  })
}

const handleImportTemplate = () => {
  message.info('行业模板导入功能开发中，敬请期待...')
}

onMounted(fetchItems)
</script>

<style scoped>
.knowledge-base-container {
  max-width: 900px;
  margin: 0 auto;
}
</style>