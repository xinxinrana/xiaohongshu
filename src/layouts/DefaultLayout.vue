
<template>
  <div class="layout-wrapper">
    <!-- 顶部导航栏 -->
    <header v-if="showHeader" class="layout-header">
      <slot name="header">
        <div class="container flex items-center justify-between h-full">
          <div class="header-left">
            <slot name="header-left">
              <h1 class="text-xl font-bold">{{ title }}</h1>
            </slot>
          </div>
          <div class="header-center flex-1">
            <slot name="header-center"></slot>
          </div>
          <div class="header-right">
            <slot name="header-right"></slot>
          </div>
        </div>
      </slot>
    </header>

    <!-- 主体内容区域 -->
    <div class="layout-body">
      <!-- 侧边栏 -->
      <aside v-if="showSidebar" class="layout-sidebar">
        <slot name="sidebar">
          <nav class="sidebar-nav">
            <slot name="sidebar-content"></slot>
          </nav>
        </slot>
      </aside>

      <!-- 主内容区 -->
      <main class="layout-main">
        <div :class="containerClass">
          <slot></slot>
        </div>
      </main>
    </div>

    <!-- 底部 -->
    <footer v-if="showFooter" class="layout-footer">
      <slot name="footer">
        <div class="container flex items-center justify-center h-full">
          <p class="text-sm text-secondary">© 2024 Your Company. All rights reserved.</p>
        </div>
      </slot>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示侧边栏
  showSidebar: {
    type: Boolean,
    default: false
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  },
  // 标题
  title: {
    type: String,
    default: 'App Title'
  },
  // 主内容容器类型：'container'(固定宽度) 或 'container-fluid'(全宽)
  containerType: {
    type: String,
    default: 'container',
    validator: (value) => ['container', 'container-fluid', 'none'].includes(value)
  }
})

const containerClass = computed(() => {
  if (props.containerType === 'none') return ''
  return props.containerType
})
</script>

<style scoped>
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 头部样式 */
.layout-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 64px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

/* 主体区域 */
.layout-body {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

/* 侧边栏样式 */
.layout-sidebar {
  width: 250px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-nav {
  padding: var(--spacing-4);
}

/* 主内容区 */
.layout-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg-secondary);
  padding: var(--spacing-6) 0;
}

/* 底部样式 */
.layout-footer {
  height: 60px;
  background: var(--color-bg-primary);
  border-top: 1px solid var(--color-border-light);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: -250px;
    top: 64px;
    bottom: 0;
    z-index: var(--z-fixed);
    transition: left var(--transition-base);
  }

  .layout-sidebar.active {
    left: 0;
  }

  .header-center {
    display: none;
  }
}

@media (max-width: 640px) {
  .layout-header {
    height: 56px;
  }

  .header-left h1 {
    font-size: var(--font-size-lg);
  }
}
</style>

