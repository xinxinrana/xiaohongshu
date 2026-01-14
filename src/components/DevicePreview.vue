


<template>
  <div class="device-preview-wrapper">
    <!-- 工具栏 -->
    <div class="preview-toolbar">
      <div class="toolbar-left">
        <button
          v-for="device in devices"
          :key="device.name"
          :class="['device-btn', { active: currentDevice === device.name }]"
          @click="selectDevice(device.name)"
          :title="device.label"
        >
          <span class="device-icon">{{ device.icon }}</span>
          <span class="device-label">{{ device.label }}</span>
        </button>
      </div>
      
      <div class="toolbar-center">
        <div class="device-info">
          {{ currentDeviceInfo.width }}px × {{ currentDeviceInfo.height }}px
        </div>
      </div>

      <div class="toolbar-right">
        <button
          class="rotate-btn"
          @click="toggleRotate"
          title="旋转设备"
        >
          🔄 旋转
        </button>
        <button
          class="scale-btn"
          @click="resetScale"
          title="重置缩放"
        >
          ⚖️ 100%
        </button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="preview-container" ref="containerRef">
      <div 
        class="device-frame"
        :class="[currentDevice, { rotated: isRotated }]"
        :style="frameStyle"
      >
        <div class="device-screen">
          <iframe
            ref="iframeRef"
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
            @load="onIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 预览URL
  url: {
    type: String,
    default: ''
  },
  // 初始设备
  initialDevice: {
    type: String,
    default: 'desktop'
  }
})

// 设备配置
const devices = [
  {
    name: 'mobile',
    label: '手机',
    icon: '📱',
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  },
  {
    name: 'tablet',
    label: '平板',
    icon: '📱',
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
  },
  {
    name: 'desktop',
    label: '桌面',
    icon: '🖥️',
    width: 1920,
    height: 1080,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    name: 'laptop',
    label: '笔记本',
    icon: '💻',
    width: 1440,
    height: 900,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  }
]

const currentDevice = ref(props.initialDevice)
const isRotated = ref(false)
const scale = ref(1)
const containerRef = ref(null)
const iframeRef = ref(null)

// 当前设备信息
const currentDeviceInfo = computed(() => {
  const device = devices.find(d => d.name === currentDevice.value)
  if (!device) return devices[0]
  
  if (isRotated.value) {
    return {
      ...device,
      width: device.height,
      height: device.width
    }
  }
  return device
})

// 预览URL
const previewUrl = computed(() => {
  return props.url || window.location.href
})

// 框架样式
const frameStyle = computed(() => {
  const info = currentDeviceInfo.value
  return {
    width: `${info.width}px`,
    height: `${info.height}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: 'top center'
  }
})

// 选择设备
function selectDevice(deviceName) {
  currentDevice.value = deviceName
  isRotated.value = false
  calculateScale()
}

// 切换旋转
function toggleRotate() {
  isRotated.value = !isRotated.value
  calculateScale()
}

// 重置缩放
function resetScale() {
  scale.value = 1
}

// 计算缩放比例
function calculateScale() {
  if (!containerRef.value) return
  
  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const info = currentDeviceInfo.value
  
  const scaleX = (containerWidth - 40) / info.width
  const scaleY = (containerHeight - 40) / info.height
  
  scale.value = Math.min(scaleX, scaleY, 1)
}

// iframe加载完成
function onIframeLoad() {
  console.log('Preview loaded')
}

// 监听窗口大小变化
let resizeObserver = null

onMounted(() => {
  calculateScale()
  
  // 使用 ResizeObserver 监听容器大小变化
  resizeObserver = new ResizeObserver(() => {
    calculateScale()
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.device-preview-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
}

/* 工具栏 */
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  gap: var(--spacing-4);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: var(--spacing-2);
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.device-info {
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

/* 设备按钮 */
.device-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.device-btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary-500);
}

.device-btn.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-600);
}

.device-icon {
  font-size: 1.2em;
}

.device-label {
  display: none;
}

@media (min-width: 768px) {
  .device-label {
    display: inline;
  }
}

/* 其他工具按钮 */
.rotate-btn,
.scale-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.rotate-btn:hover,
.scale-btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary-500);
}

/* 预览容器 */
.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  overflow: auto;
}

/* 设备框架 */
.device-frame {
  background: white;
  box-shadow: var(--shadow-2xl);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  position: relative;
}

.device-frame.mobile {
  border-radius: var(--radius-2xl);
}

.device-frame.tablet {
  border-radius: var(--radius-xl);
}

.device-frame.rotated {
  transform-origin: center center;
}

/* 设备屏幕 */
.device-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: white;
}

/* iframe */
.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .preview-toolbar {
    padding: var(--spacing-2);
  }
  
  .toolbar-center {
    display: none;
  }
}
</style>



