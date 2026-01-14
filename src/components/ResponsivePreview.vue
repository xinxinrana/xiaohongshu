



<template>
  <div class="responsive-preview">
    <div class="preview-header">
      <h2 class="preview-title">响应式预览</h2>
      <div class="preview-controls">
        <label class="control-label">
          <input
            type="checkbox"
            v-model="showLabels"
            class="control-checkbox"
          />
          显示尺寸标签
        </label>
      </div>
    </div>

    <div class="preview-grid" :class="{ 'show-labels': showLabels }">
      <div
        v-for="viewport in viewports"
        :key="viewport.name"
        class="viewport-wrapper"
      >
        <div class="viewport-header" v-if="showLabels">
          <span class="viewport-name">{{ viewport.label }}</span>
          <span class="viewport-size">{{ viewport.width }}px</span>
        </div>
        <div class="viewport-frame" :style="getViewportStyle(viewport)">
          <div class="viewport-content">
            <slot :viewport="viewport">
              <iframe
                :src="previewUrl"
                class="viewport-iframe"
                frameborder="0"
              ></iframe>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  url: {
    type: String,
    default: ''
  },
  // 自定义视口配置
  customViewports: {
    type: Array,
    default: null
  }
})

const showLabels = ref(true)

// 默认视口配置
const defaultViewports = [
  { name: 'mobile-s', label: '手机 S', width: 320, icon: '📱' },
  { name: 'mobile-m', label: '手机 M', width: 375, icon: '📱' },
  { name: 'mobile-l', label: '手机 L', width: 425, icon: '📱' },
  { name: 'tablet', label: '平板', width: 768, icon: '📱' },
  { name: 'laptop', label: '笔记本', width: 1024, icon: '💻' },
  { name: 'desktop', label: '桌面', width: 1440, icon: '🖥️' }
]

const viewports = computed(() => {
  return props.customViewports || defaultViewports
})

const previewUrl = computed(() => {
  return props.url || window.location.href
})

function getViewportStyle(viewport) {
  return {
    width: `${viewport.width}px`,
    minHeight: '400px'
  }
}
</script>

<style scoped>
.responsive-preview {
  width: 100%;
  padding: var(--spacing-6);
  background: var(--color-bg-secondary);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid var(--color-border-light);
}

.preview-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.preview-controls {
  display: flex;
  gap: var(--spacing-4);
}

.control-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.control-checkbox {
  cursor: pointer;
}

/* 网格布局 */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-6);
  justify-items: center;
}

/* 视口容器 */
.viewport-wrapper {
  width: 100%;
  max-width: 100%;
}

.viewport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-bottom: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.viewport-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.viewport-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

/* 视口框架 */
.viewport-frame {
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.show-labels .viewport-frame {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  border-top: none;
}

.viewport-frame:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.viewport-content {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.viewport-iframe {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  display: block;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .responsive-preview {
    padding: var(--spacing-4);
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>




