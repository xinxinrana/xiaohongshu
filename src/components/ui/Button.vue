






<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="button-loading">
      <span class="spinner"></span>
    </span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 按钮类型
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
  },
  // 按钮尺寸
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // HTML type属性
  type: {
    type: String,
    default: 'button'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否块级按钮
  block: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      'btn-block': props.block,
      'btn-disabled': props.disabled,
      'btn-loading': props.loading
    }
  ]
})

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-sans);
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* 尺寸变体 */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
}

.btn-md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

.btn-lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-lg);
}

/* 主要按钮 */
.btn-primary {
  color: white;
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-primary-600);
  border-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(0);
}

/* 次要按钮 */
.btn-secondary {
  color: white;
  background-color: var(--color-gray-600);
  border-color: var(--color-gray-600);
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-gray-700);
  border-color: var(--color-gray-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 轮廓按钮 */
.btn-outline {
  color: var(--color-primary-600);
  background-color: transparent;
  border-color: var(--color-primary-500);
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading) {
  color: white;
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

/* 幽灵按钮 */
.btn-ghost {
  color: var(--color-primary-600);
  background-color: transparent;
  border-color: transparent;
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-primary-50);
}

/* 危险按钮 */
.btn-danger {
  color: white;
  background-color: var(--color-error-500);
  border-color: var(--color-error-500);
}

.btn-danger:hover:not(.btn-disabled):not(.btn-loading) {
  background-color: var(--color-error-600);
  border-color: var(--color-error-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 块级按钮 */
.btn-block {
  display: flex;
  width: 100%;
}

/* 禁用状态 */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载状态 */
.btn-loading {
  cursor: wait;
}

.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>






