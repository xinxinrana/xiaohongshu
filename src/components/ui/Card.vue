








<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- 卡片头部 -->
    <div v-if="hasHeader" class="card-header">
      <slot name="header">
        <div class="card-title">{{ title }}</div>
        <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
      </slot>
    </div>

    <!-- 卡片主体 -->
    <div class="card-body">
      <slot></slot>
    </div>

    <!-- 卡片底部 -->
    <div v-if="hasFooter" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: ''
  },
  // 卡片副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 卡片变体
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'elevated', 'ghost'].includes(value)
  },
  // 是否可悬停
  hoverable: {
    type: Boolean,
    default: false
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: false
  },
  // 内边距大小
  padding: {
    type: String,
    default: 'md',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['click'])

const slots = useSlots()

const hasHeader = computed(() => {
  return !!slots.header || !!props.title
})

const hasFooter = computed(() => {
  return !!slots.footer
})

const cardClasses = computed(() => {
  return [
    'card',
    `card-${props.variant}`,
    `card-padding-${props.padding}`,
    {
      'card-hoverable': props.hoverable,
      'card-clickable': props.clickable
    }
  ]
})

function handleClick(event) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础卡片样式 */
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
}

/* 变体样式 */
.card-default {
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.card-bordered {
  border: 2px solid var(--color-border-default);
}

.card-elevated {
  border: none;
  box-shadow: var(--shadow-lg);
}

.card-ghost {
  border: none;
  background: transparent;
}

/* 悬停效果 */
.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* 可点击 */
.card-clickable {
  cursor: pointer;
  user-select: none;
}

.card-clickable:active {
  transform: translateY(-2px);
}

/* 内边距变体 */
.card-padding-none .card-body {
  padding: 0;
}

.card-padding-sm .card-body {
  padding: var(--spacing-3);
}

.card-padding-md .card-body {
  padding: var(--spacing-4);
}

.card-padding-lg .card-body {
  padding: var(--spacing-6);
}

/* 卡片头部 */
.card-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 卡片主体 */
.card-body {
  flex: 1;
}

/* 卡片底部 */
.card-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}
</style>








