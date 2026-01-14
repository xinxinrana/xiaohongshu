













<template>
  <div class="framework-selector-container">
    <n-divider title-placement="left">
      <n-space align="center" :size="8">
        <n-icon size="20">✨</n-icon>
        <span class="section-title">选择写作框架 (可多选)</span>
      </n-space>
    </n-divider>

    <n-grid :cols="2" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
      <n-grid-item v-for="fw in frameworks" :key="fw.id">
        <div 
          :class="['framework-card', { active: isSelected(fw.id) }]"
          @click="toggleFramework(fw.id)"
        >
          <div class="card-icon">
            {{ getIcon(fw.id) }}
          </div>
          <div class="card-content">
            <div class="card-header">
              <n-text strong class="card-title">{{ fw.name }}</n-text>
              <n-tag
                v-if="fw.matchScore > 80"
                type="success"
                size="tiny"
                round
                class="match-badge"
              >
                推荐
              </n-tag>
            </div>
            <n-text depth="3" class="card-desc">
              {{ fw.description }}
            </n-text>
          </div>
          <div class="active-indicator" v-if="isSelected(fw.id)">
            <n-icon size="16">✅</n-icon>
          </div>
        </div>
      </n-grid-item>
    </n-grid>

    <div class="selected-summary" v-if="selectedIds.length > 0">
      <n-space align="center" wrap>
        <n-text depth="3">已选方案：</n-text>
        <n-tag 
          v-for="id in selectedIds" 
          :key="id"
          type="success" 
          size="medium" 
          round 
          closable 
          @close="toggleFramework(id)"
        >
          {{ getFrameworkName(id) }}
        </n-tag>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  frameworks: {
    type: Array,
    default: () => []
  },
  value: {
    type: [String, Array],
    default: () => []
  }
})

const emit = defineEmits(['update:value', 'selected'])

const selectedIds = ref(Array.isArray(props.value) ? props.value : (props.value ? [props.value] : []))

const isSelected = (id) => selectedIds.value.includes(id)

const toggleFramework = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
  
  const emitValue = selectedIds.value.join(',')
  emit('update:value', emitValue)
  emit('selected', emitValue)
}

const getFrameworkName = (id) => {
  const fw = props.frameworks.find(f => f.id === id)
  return fw ? fw.name : id
}

const getIcon = (id) => {
  const icons = {
    'viral': '🔥',
    'emotional': '🎭',
    'tutorial': '📚',
    'promotion': '🛍️',
    'lifestyle': '☕',
    'news': '📰',
    'review': '⭐'
  }
  return icons[id] || '📝'
}

watch(() => props.value, (newVal) => {
  if (typeof newVal === 'string') {
    selectedIds.value = newVal ? newVal.split(',').filter(Boolean) : []
  } else if (Array.isArray(newVal)) {
    selectedIds.value = [...newVal]
  }
})

// 默认选中第一个
watch(() => props.frameworks, (newFws) => {
  if (newFws.length > 0 && selectedIds.value.length === 0) {
    toggleFramework(newFws[0].id)
  }
}, { immediate: true })
</script>

<style scoped>
.framework-selector-container {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.framework-card {
  position: relative;
  display: flex;
  padding: 16px;
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.framework-card:hover {
  border-color: #18a058;
  background: #f6fffa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.08);
}

.framework-card.active {
  border-color: #18a058;
  background: #f6fffa;
  box-shadow: 0 4px 12px rgba(24, 160, 88, 0.12);
}

.card-icon {
  font-size: 24px;
  margin-right: 12px;
  display: flex;
  align-items: flex-start;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 15px;
  color: #1a1a1a;
}

.card-desc {
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.active-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #18a058;
}

.selected-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .framework-card {
    padding: 12px;
  }
  .card-icon {
    font-size: 20px;
    margin-right: 8px;
  }
}
</style>





