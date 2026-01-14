






<template>
  <div class="framework-selector" v-if="frameworks.length">
    <el-card shadow="hover">
      <template #header>
        <h3>🎯 选择写作框架</h3>
      </template>
      
      <el-radio-group v-model="selectedFramework" class="framework-list">
        <el-radio 
          v-for="fw in frameworks" 
          :key="fw.id"
          :label="fw.id"
          class="framework-item"
          border
        >
          <div class="framework-content">
            <div class="fw-name">{{ fw.name }}</div>
            <div class="fw-desc">{{ fw.description }}</div>
            <el-tag 
              v-if="fw.matchScore > 0" 
              size="small" 
              type="success"
              effect="dark"
              class="match-tag"
            >
              匹配度: {{ fw.matchScore }}
            </el-tag>
          </div>
        </el-radio>
      </el-radio-group>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  frameworks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selected'])

const selectedFramework = ref('')

watch(selectedFramework, (newValue) => {
  if (newValue) {
    emit('selected', newValue)
  }
})
</script>

<style scoped>
.framework-selector {
  max-width: 800px;
  margin: 20px auto;
}

.framework-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.framework-item {
  width: 100%;
  margin: 0;
}

.framework-item :deep(.el-radio__label) {
  width: 100%;
  padding: 16px;
}

.framework-content {
  width: 100%;
}

.fw-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.fw-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.match-tag {
  margin-top: 8px;
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




