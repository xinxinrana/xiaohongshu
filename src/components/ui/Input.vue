










<template>
  <div :class="wrapperClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>

    <div class="input-container">
      <span v-if="$slots.prefix || prefixIcon" class="input-prefix">
        <slot name="prefix">
          <span class="input-icon">{{ prefixIcon }}</span>
        </slot>
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="handleEnter"
      />

      <span v-if="$slots.suffix || suffixIcon || clearable" class="input-suffix">
        <button
          v-if="clearable && modelValue"
          type="button"
          class="input-clear"
          @click="handleClear"
        >
          ✕
        </button>
        <slot name="suffix">
          <span v-if="suffixIcon" class="input-icon">{{ suffixIcon }}</span>
        </slot>
      </span>
    </div>

    <div v-if="hint || error" class="input-hint" :class="{ 'input-error': error }">
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 输入框类型
  type: {
    type: String,
    default: 'text'
  },
  // 标签
  label: {
    type: String,
    default: ''
  },
  // 占位符
  placeholder: {
    type: String,
    default: ''
  },
  // 尺寸
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否只读
  readonly: {
    type: Boolean,
    default: false
  },
  // 是否必填
  required: {
    type: Boolean,
    default: false
  },
  // 是否可清空
  clearable: {
    type: Boolean,
    default: false
  },
  // 前缀图标
  prefixIcon: {
    type: String,
    default: ''
  },
  // 后缀图标
  suffixIcon: {
    type: String,
    default: ''
  },
  // 提示信息
  hint: {
    type: String,
    default: ''
  },
  // 错误信息
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'enter', 'clear'])

const isFocused = ref(false)
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const wrapperClasses = computed(() => {
  return [
    'input-wrapper',
    {
      'input-disabled': props.disabled,
      'input-readonly': props.readonly,
      'input-focused': isFocused.value,
      'input-error-state': props.error
    }
  ]
})

const inputClasses = computed(() => {
  return [
    'input-field',
    `input-${props.size}`
  ]
})

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}

function handleFocus(event) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event) {
  isFocused.value = false
  emit('blur', event)
}

function handleEnter(event) {
  emit('enter', event)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

/* 标签 */
.input-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.input-required {
  color: var(--color-error-500);
}

/* 输入容器 */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.input-container:hover:not(.input-disabled) {
  border-color: var(--color-primary-400);
}

.input-focused .input-container {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.input-error-state .input-container {
  border-color: var(--color-error-500);
}

.input-error-state.input-focused .input-container {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-disabled .input-container {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

/* 输入框 */
.input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:disabled {
  cursor: not-allowed;
}

/* 尺寸变体 */
.input-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
  height: 32px;
}

.input-md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-base);
  height: 40px;
}

.input-lg {
  padding: var(--spacing-3) var(--spacing-5);
  font-size: var(--font-size-lg);
  height: 48px;
}

/* 前缀和后缀 */
.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-3);
  color: var(--color-text-secondary);
}

.input-icon {
  font-size: 1.2em;
}

/* 清除按钮 */
.input-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-gray-300);
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.input-clear:hover {
  background: var(--color-gray-400);
}

/* 提示信息 */
.input-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.input-error {
  color: var(--color-error-500);
}
</style>










