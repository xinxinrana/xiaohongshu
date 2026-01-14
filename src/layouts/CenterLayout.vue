

<template>
  <div class="center-layout">
    <div class="center-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 内容最大宽度
  maxWidth: {
    type: String,
    default: '600px'
  },
  // 是否添加内边距
  padding: {
    type: Boolean,
    default: true
  }
})

const contentStyle = computed(() => ({
  maxWidth: props.maxWidth,
  padding: props.padding ? 'var(--spacing-6)' : '0'
}))
</script>

<style scoped>
.center-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  padding: var(--spacing-4);
}

.center-content {
  width: 100%;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 640px) {
  .center-layout {
    padding: var(--spacing-2);
  }
  
  .center-content {
    padding: var(--spacing-4) !important;
  }
}
</style>


