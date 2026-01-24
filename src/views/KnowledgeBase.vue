<template>
  <div class="knowledge-base-container">
    <n-space vertical :size="24">
      <div class="page-header">
        <div class="page-title">
          <n-text strong style="font-size: 20px;">知识库管理</n-text>
          <n-text depth="3" style="margin-top: 4px;">管理可复用的品牌知识与创作记忆</n-text>
        </div>
        <n-space>
          <n-button secondary @click="handleImportTemplate">导入行业模板</n-button>
          <n-button secondary @click="handleRefresh">刷新</n-button>
          <n-button type="error" ghost @click="handleClear">清空记忆</n-button>
          <n-button type="primary" @click="openCreate">
            <template #icon>
              <n-icon><PlusOutlined /></n-icon>
            </template>
            新增记忆
          </n-button>
        </n-space>
      </div>

      <n-grid :cols="3" :x-gap="16" :y-gap="16">
        <n-gi>
          <n-card size="small" class="stat-card">
            <n-text depth="3">记忆总量</n-text>
            <div class="stat-value">{{ stats.totalMemories }}</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" class="stat-card">
            <n-text depth="3">平均质量</n-text>
            <div class="stat-value">{{ stats.avgQualityScore.toFixed(1) }}</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" class="stat-card">
            <n-text depth="3">近7日新增</n-text>
            <div class="stat-value">{{ stats.recentCount }}</div>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card class="filter-card">
        <n-space align="center" justify="space-between" wrap>
          <n-space align="center">
            <n-input v-model:value="searchText" placeholder="搜索标题、内容或关键词" clearable style="width: 260px;" />
            <n-select v-model:value="selectedType" :options="typeFilterOptions" style="width: 160px;" />
            <n-select v-model:value="selectedFramework" :options="frameworkOptions" style="width: 200px;" />
            <n-input-number v-model:value="qualityMin" :min="0" :max="10" :step="1" style="width: 140px;" placeholder="最低质量" />
          </n-space>
          <n-text depth="3">共 {{ filteredItems.length }} 条记忆</n-text>
        </n-space>
      </n-card>

      <n-card class="list-card">
        <n-empty v-if="filteredItems.length === 0" description="暂无符合条件的记忆">
          <template #extra>
            <n-button dashed @click="openCreate">立即新增</n-button>
          </template>
        </n-empty>

        <n-grid v-else :cols="2" :x-gap="16" :y-gap="16">
          <n-gi v-for="item in filteredItems" :key="item.id">
            <n-card :title="getTitle(item)" hoverable size="small">
              <template #header-extra>
                <n-space>
                  <n-button text @click="openEdit(item)">
                    <template #icon>
                      <n-icon><EditOutlined /></n-icon>
                    </template>
                  </n-button>
                  <n-button text type="error" @click="handleDelete(item.id)">
                    <template #icon>
                      <n-icon><DeleteOutlined /></n-icon>
                    </template>
                  </n-button>
                </n-space>
              </template>
              <n-space vertical size="small">
                <n-text depth="3">{{ getMetaLine(item) }}</n-text>
                <n-ellipsis :line-clamp="3" expand-trigger="click" line-height="1.6">
                  {{ item.content }}
                </n-ellipsis>
                <n-space>
                  <n-tag size="small" :type="getTagType(getType(item))">{{ getTypeName(getType(item)) }}</n-tag>
                  <n-tag size="small" type="info">质量 {{ getQuality(item) }}</n-tag>
                  <n-tag v-if="getFramework(item)" size="small" type="success">{{ getFramework(item) }}</n-tag>
                </n-space>
                <n-space v-if="getKeywords(item).length">
                  <n-tag v-for="keyword in getKeywords(item)" :key="keyword" size="small" type="default">
                    {{ keyword }}
                  </n-tag>
                </n-space>
              </n-space>
            </n-card>
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>

    <n-modal
      v-model:show="showFormModal"
      preset="card"
      style="width: 640px"
      :title="editingId ? '编辑记忆' : '新增记忆'"
      :bordered="false"
    >
      <n-form :model="formValue" :rules="rules" ref="formRef">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="formValue.title" placeholder="例如：品牌语气指南" />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select v-model:value="formValue.type" :options="typeOptions" placeholder="选择类型" />
        </n-form-item>
        <n-form-item label="关键词">
          <n-input v-model:value="formValue.keywords" placeholder="多个关键词用逗号分隔" />
        </n-form-item>
        <n-form-item label="框架">
          <n-input v-model:value="formValue.framework" placeholder="例如：小红书爆款框架" />
        </n-form-item>
        <n-form-item label="质量评分">
          <n-input-number v-model:value="formValue.qualityScore" :min="0" :max="10" :step="0.5" style="width: 180px;" />
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input v-model:value="formValue.content" type="textarea" :rows="6" placeholder="请输入记忆内容" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showFormModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@vicons/antd'
import { knowledgeAPI } from '../services/api'

const message = useMessage()
const dialog = useDialog()
const items = ref([])
const stats = ref({
  totalMemories: 0,
  avgQualityScore: 0,
  recentCount: 0,
  frameworks: {}
})
const searchText = ref('')
const selectedType = ref('all')
const selectedFramework = ref('all')
const qualityMin = ref(0)
const showFormModal = ref(false)
const editingId = ref('')
const saving = ref(false)
const formRef = ref(null)

const formValue = ref({
  title: '',
  type: 'reference',
  content: '',
  keywords: '',
  framework: '',
  qualityScore: 0
})

const rules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  content: { required: true, message: '请输入内容', trigger: 'blur' }
}

const typeOptions = [
  { label: '文案风格', value: 'style' },
  { label: '品牌背景', value: 'brand' },
  { label: '参考资料', value: 'reference' },
  { label: '避坑指南', value: 'avoid' },
  { label: '流程规范', value: 'process' }
]

const typeFilterOptions = [
  { label: '全部类型', value: 'all' },
  ...typeOptions
]

const frameworkOptions = computed(() => {
  const frameworks = stats.value.frameworks || {}
  const options = Object.keys(frameworks).map(name => ({
    label: `${name} (${frameworks[name]})`,
    value: name
  }))
  return [{ label: '全部框架', value: 'all' }, ...options]
})

const getTypeName = (type) => {
  const opt = typeOptions.find(o => o.value === type)
  return opt ? opt.label : '其他'
}

const getTagType = (type) => {
  const map = {
    style: 'info',
    brand: 'success',
    reference: 'warning',
    avoid: 'error',
    process: 'default'
  }
  return map[type] || 'default'
}

const getType = (item) => item.metadata?.type || 'reference'

const getQuality = (item) => {
  const score = item.metadata?.qualityScore
  return Number.isFinite(score) ? score : 0
}

const getFramework = (item) => item.metadata?.framework || ''

const getKeywords = (item) => item.metadata?.keywords || []

const getTitle = (item) => {
  const title = item.metadata?.title
  if (title) return title
  return item.content?.slice(0, 18) || '未命名记忆'
}

const getMetaLine = (item) => {
  const timeValue = item.metadata?.updatedAt || item.metadata?.timestamp || item.metadata?.createdAt
  const timeText = timeValue ? new Date(timeValue).toLocaleString() : '时间未知'
  return `${timeText} · ${getKeywords(item).length ? '关键词 ' + getKeywords(item).join('、') : '无关键词'}`
}

const filteredItems = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return items.value.filter((item) => {
    const contentText = (item.content || '').toLowerCase()
    const titleText = (item.metadata?.title || '').toLowerCase()
    const keywordsText = (item.metadata?.keywords || []).join(' ').toLowerCase()
    const matchKeyword = !keyword || contentText.includes(keyword) || titleText.includes(keyword) || keywordsText.includes(keyword)
    const matchType = selectedType.value === 'all' || getType(item) === selectedType.value
    const matchFramework = selectedFramework.value === 'all' || getFramework(item) === selectedFramework.value
    const matchQuality = getQuality(item) >= qualityMin.value
    return matchKeyword && matchType && matchFramework && matchQuality
  })
})

const refreshList = async () => {
  try {
    const [listRes, statsRes] = await Promise.all([
      knowledgeAPI.getAll(),
      knowledgeAPI.getStats()
    ])
    if (listRes.success) {
      items.value = listRes.data.memories || []
    }
    if (statsRes.success) {
      stats.value = statsRes.data
    }
  } catch (error) {
    message.error('获取记忆失败')
  }
}

const resetForm = () => {
  formValue.value = {
    title: '',
    type: 'reference',
    content: '',
    keywords: '',
    framework: '',
    qualityScore: 0
  }
  editingId.value = ''
}

const openCreate = () => {
  resetForm()
  showFormModal.value = true
}

const openEdit = (item) => {
  editingId.value = item.id
  formValue.value = {
    title: item.metadata?.title || '',
    type: getType(item),
    content: item.content || '',
    keywords: getKeywords(item).join('，'),
    framework: getFramework(item),
    qualityScore: getQuality(item)
  }
  showFormModal.value = true
}

const handleSave = async () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      saving.value = true
      try {
        if (editingId.value) {
          await knowledgeAPI.update(editingId.value, formValue.value)
        } else {
          await knowledgeAPI.add(formValue.value)
        }
        message.success('保存成功')
        showFormModal.value = false
        resetForm()
        await refreshList()
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
    content: '确定要删除这条记忆吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await knowledgeAPI.delete(id)
      message.success('删除成功')
      await refreshList()
    }
  })
}

const handleClear = () => {
  dialog.warning({
    title: '确认清空',
    content: '此操作会删除所有记忆，是否继续？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await knowledgeAPI.clear()
      message.success('已清空')
      await refreshList()
    }
  })
}

const handleRefresh = async () => {
  await refreshList()
  message.success('已刷新')
}

const handleImportTemplate = () => {
  message.info('行业模板导入功能开发中')
}

onMounted(refreshList)
</script>

<style scoped>
.knowledge-base-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 8px 4px 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  display: flex;
  flex-direction: column;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #edf2f7;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-top: 8px;
}

.filter-card {
  background: #ffffff;
  border: 1px solid #edf2f7;
}

.list-card {
  background: #ffffff;
  border: 1px solid #edf2f7;
}
</style>
